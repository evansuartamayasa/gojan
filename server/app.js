import { createHash, randomBytes, randomUUID } from 'node:crypto';

import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';

import {
  importRequestSchema,
  productInputSchema,
  toProductRecord,
  validationDetails,
} from './validation.js';

const SESSION_TABLE = 'app_private.sessions';
const PRODUCT_COLUMNS = `id, nama, kategori, harga, stok, deskripsi, image_url, unggulan`;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  for (const pair of cookieHeader.split(';')) {
    const separator = pair.indexOf('=');
    if (separator < 0 || pair.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(pair.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

function setSessionCookie(res, config, token) {
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: config.sessionMaxAgeMs,
  });
}

function clearSessionCookie(res, config) {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    path: '/',
  });
}

function requireSameOrigin(req, config, next) {
  if (req.get('origin') !== config.appOrigin) {
    return next(new HttpError(403, 'Origin permintaan tidak diizinkan.'));
  }
  next();
}

function requireSession(pool, config) {
  return async (req, res, next) => {
    const token = getCookie(req, config.cookieName);
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return next(new HttpError(401, 'Sesi diperlukan.'));
    }

    try {
      const { rows } = await pool.query(
        `SELECT user_id FROM ${SESSION_TABLE}
         WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
        [hashToken(token)],
      );
      if (!rows[0]) {
        clearSessionCookie(res, config);
        return next(new HttpError(401, 'Sesi tidak berlaku atau telah berakhir.'));
      }
      req.userId = rows[0].user_id;
      next();
    } catch (error) {
      next(error);
    }
  };
}

async function withUserTransaction(pool, userId, callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT set_config($1, $2, true)', ['app.user_id', userId]);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Gagal membatalkan transaksi database:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

async function getMembership(client, userId, storeSlug) {
  const { rows } = await client.query(
    `SELECT m.store_id, m.role
     FROM memberships m
     JOIN stores s ON s.id = m.store_id
     WHERE m.user_id = $1 AND m.is_active = true AND s.slug = $2
     LIMIT 1`,
    [userId, storeSlug],
  );
  if (!rows[0]) throw new HttpError(403, 'Akun tidak memiliki akses ke toko ini.');
  return rows[0];
}

function requireRole(membership, roles) {
  if (!roles.includes(membership.role)) {
    throw new HttpError(403, 'Peran akun tidak diizinkan untuk tindakan ini.');
  }
}

function parseOrThrow(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError(400, 'Data permintaan tidak valid.', validationDetails(result.error));
  }
  return result.data;
}

function createAuthRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Terlalu banyak percobaan masuk. Coba lagi nanti.' },
  });
}

export function createApp({ pool, config, fetchImpl = fetch }) {
  const app = express();
  const sessionRequired = requireSession(pool, config);
  const authRateLimiter = createAuthRateLimiter();
  const authOrigin = (req, res, next) => requireSameOrigin(req, config, next);

  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: config.isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              imgSrc: ["'self'", 'data:'],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
    }),
  );
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    next();
  });
  app.use(express.json({ limit: '256kb', type: 'application/json' }));

  app.get('/api/health', async (req, res, next) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok' });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', authRateLimiter, authOrigin, async (req, res, next) => {
    try {
      const credentials = parseOrThrow(
        z.object({
          email: z.string().trim().email().max(254),
          password: z.string().min(1).max(1024),
        }).strict(),
        req.body,
      );
      let authResponse;
      try {
        authResponse = await fetchImpl(
          `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
          {
            method: 'POST',
            headers: {
              apikey: config.supabaseAnonKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            signal: AbortSignal.timeout(10_000),
          },
        );
      } catch (error) {
        console.error('Supabase Auth tidak dapat dijangkau:', error);
        throw new HttpError(503, 'Layanan autentikasi sedang tidak tersedia.');
      }

      if (!authResponse.ok) {
        throw new HttpError(401, 'Email atau kata sandi tidak valid.');
      }
      let authResult;
      try {
        authResult = await authResponse.json();
      } catch {
        throw new HttpError(502, 'Respons autentikasi tidak valid.');
      }
      const userId = authResult?.user?.id;
      if (typeof userId !== 'string' || !UUID_PATTERN.test(userId)) {
        throw new HttpError(502, 'Respons autentikasi tidak valid.');
      }

      const sessionToken = randomBytes(32).toString('base64url');
      const membership = await withUserTransaction(pool, userId, async (client) => {
        const currentMembership = await getMembership(client, userId, config.publicStoreSlug);
        await client.query(
          `INSERT INTO ${SESSION_TABLE} (token_hash, user_id, expires_at)
           VALUES ($1, $2, now() + ($3 * interval '1 millisecond'))`,
          [hashToken(sessionToken), userId, config.sessionMaxAgeMs],
        );
        return currentMembership;
      });

      setSessionCookie(res, config, sessionToken);
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({
        user: { id: userId, role: membership.role, storeId: membership.store_id },
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/auth/me', sessionRequired, async (req, res, next) => {
    try {
      const result = await withUserTransaction(pool, req.userId, async (client) => {
        const membership = await getMembership(client, req.userId, config.publicStoreSlug);
        return { id: req.userId, role: membership.role, storeId: membership.store_id };
      });
      res.setHeader('Cache-Control', 'no-store');
      res.json({ user: result });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/logout', authOrigin, async (req, res, next) => {
    try {
      const token = getCookie(req, config.cookieName);
      if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
        await pool.query(
          `UPDATE ${SESSION_TABLE} SET revoked_at = now()
           WHERE token_hash = $1 AND revoked_at IS NULL`,
          [hashToken(token)],
        );
      }
      clearSessionCookie(res, config);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/products', async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT p.${PRODUCT_COLUMNS.split(', ').join(', p.')}, p.store_id
         FROM products p
         JOIN stores s ON s.id = p.store_id
         WHERE s.slug = $1 AND s.is_public = true AND p.is_published = true
         ORDER BY p.created_at DESC`,
        [config.publicStoreSlug],
      );
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      res.json({ products: rows.map(toProductRecord) });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/owner/products', sessionRequired, async (req, res, next) => {
    try {
      const products = await withUserTransaction(pool, req.userId, async (client) => {
        const membership = await getMembership(client, req.userId, config.publicStoreSlug);
        const { rows } = await client.query(
          `SELECT ${PRODUCT_COLUMNS} FROM products
           WHERE store_id = $1 ORDER BY created_at DESC`,
          [membership.store_id],
        );
        return rows.map(toProductRecord);
      });
      res.setHeader('Cache-Control', 'no-store');
      res.json({ products });
    } catch (error) {
      next(error);
    }
  });

  app.post(
    '/api/owner/products',
    authOrigin,
    sessionRequired,
    async (req, res, next) => {
      try {
        const input = parseOrThrow(productInputSchema, req.body);
        const product = await withUserTransaction(pool, req.userId, async (client) => {
          const membership = await getMembership(client, req.userId, config.publicStoreSlug);
          requireRole(membership, ['owner', 'editor']);
          const { rows } = await client.query(
            `INSERT INTO products
             (store_id, nama, kategori, harga, stok, deskripsi, image_url, unggulan)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING ${PRODUCT_COLUMNS}`,
            [
              membership.store_id,
              input.nama,
              input.kategori,
              input.harga,
              input.stok,
              input.deskripsi,
              input.imageUrl,
              input.unggulan,
            ],
          );
          await writeAudit(client, req, req.userId, membership.store_id, 'product.created', rows[0].id, {
            after: toProductRecord(rows[0]),
          });
          return toProductRecord(rows[0]);
        });
        res.status(201).json({ product });
      } catch (error) {
        next(error);
      }
    },
  );

  app.patch(
    '/api/owner/products/:id',
    authOrigin,
    sessionRequired,
    async (req, res, next) => {
      try {
        if (!UUID_PATTERN.test(req.params.id)) throw new HttpError(400, 'ID produk tidak valid.');
        const input = parseOrThrow(productInputSchema, req.body);
        const product = await withUserTransaction(pool, req.userId, async (client) => {
          const membership = await getMembership(client, req.userId, config.publicStoreSlug);
          requireRole(membership, ['owner', 'editor']);
          const previous = await client.query(
            `SELECT ${PRODUCT_COLUMNS} FROM products
             WHERE id = $1 AND store_id = $2 FOR UPDATE`,
            [req.params.id, membership.store_id],
          );
          if (!previous.rows[0]) throw new HttpError(404, 'Produk tidak ditemukan.');
          const { rows } = await client.query(
            `UPDATE products SET nama = $3, kategori = $4, harga = $5, stok = $6,
             deskripsi = $7, image_url = $8, unggulan = $9, updated_at = now()
             WHERE id = $1 AND store_id = $2
             RETURNING ${PRODUCT_COLUMNS}`,
            [
              req.params.id,
              membership.store_id,
              input.nama,
              input.kategori,
              input.harga,
              input.stok,
              input.deskripsi,
              input.imageUrl,
              input.unggulan,
            ],
          );
          await writeAudit(client, req, req.userId, membership.store_id, 'product.updated', rows[0].id, {
            before: toProductRecord(previous.rows[0]),
            after: toProductRecord(rows[0]),
          });
          return toProductRecord(rows[0]);
        });
        res.json({ product });
      } catch (error) {
        next(error);
      }
    },
  );

  app.delete(
    '/api/owner/products/:id',
    authOrigin,
    sessionRequired,
    async (req, res, next) => {
      try {
        if (!UUID_PATTERN.test(req.params.id)) throw new HttpError(400, 'ID produk tidak valid.');
        await withUserTransaction(pool, req.userId, async (client) => {
          const membership = await getMembership(client, req.userId, config.publicStoreSlug);
          requireRole(membership, ['owner', 'editor']);
          const { rows } = await client.query(
            `DELETE FROM products WHERE id = $1 AND store_id = $2
             RETURNING ${PRODUCT_COLUMNS}`,
            [req.params.id, membership.store_id],
          );
          if (!rows[0]) throw new HttpError(404, 'Produk tidak ditemukan.');
          await writeAudit(client, req, req.userId, membership.store_id, 'product.deleted', rows[0].id, {
            before: toProductRecord(rows[0]),
          });
        });
        res.status(204).end();
      } catch (error) {
        next(error);
      }
    },
  );

  app.post(
    '/api/owner/import',
    authOrigin,
    sessionRequired,
    async (req, res, next) => {
      try {
        const { products } = parseOrThrow(importRequestSchema, req.body);
        const result = await withUserTransaction(pool, req.userId, async (client) => {
          const membership = await getMembership(client, req.userId, config.publicStoreSlug);
          requireRole(membership, ['owner']);
          const imported = [];
          let skipped = 0;
          for (const item of products) {
            const { id: legacyId, ...input } = item;
            const { rows } = await client.query(
              `INSERT INTO products
               (store_id, legacy_id, nama, kategori, harga, stok, deskripsi, image_url, unggulan)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (store_id, legacy_id) WHERE legacy_id IS NOT NULL DO NOTHING
               RETURNING ${PRODUCT_COLUMNS}`,
              [
                membership.store_id,
                legacyId ?? null,
                input.nama,
                input.kategori,
                input.harga,
                input.stok,
                input.deskripsi,
                input.imageUrl,
                input.unggulan,
              ],
            );
            if (!rows[0]) {
              skipped += 1;
              continue;
            }
            const product = toProductRecord(rows[0]);
            imported.push(product);
            await writeAudit(
              client,
              req,
              req.userId,
              membership.store_id,
              'product.imported',
              rows[0].id,
              { after: product, legacyId: legacyId ?? null },
            );
          }
          return { imported, skipped };
        });
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  app.use('/api', (req, res, next) => next(new HttpError(404, 'Endpoint API tidak ditemukan.')));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({ error: 'JSON permintaan tidak valid.', requestId: req.requestId });
    }
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) console.error(`[${req.requestId}] Kesalahan API:`, error);
    res.status(status).json({
      error: status === 500 ? 'Terjadi kesalahan server.' : error.message,
      ...(error.details ? { details: error.details } : {}),
      requestId: req.requestId,
    });
  });

  return app;
}

async function writeAudit(client, req, userId, storeId, action, entityId, changes) {
  await client.query(
    `INSERT INTO audit_events
     (actor_user_id, store_id, action, entity_type, entity_id, changes, request_id)
     VALUES ($1, $2, $3, 'product', $4, $5::jsonb, $6)`,
    [userId, storeId, action, entityId, JSON.stringify(changes), req.requestId],
  );
}

export { HttpError };
