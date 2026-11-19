import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import { Pool } from 'pg';
import { createServer as createViteServer } from 'vite';

import { createApp } from './app.js';
import { readConfig } from './config.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
if (existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'));

const config = readConfig();
const pool = new Pool({ connectionString: config.databaseUrl, max: 10 });

async function assertDatabaseSecurity() {
  const { rows } = await pool.query(
    `SELECT current_user AS role_name, r.rolsuper, r.rolbypassrls
     FROM pg_roles r WHERE r.rolname = current_user`,
  );
  if (!rows[0] || rows[0].rolsuper || rows[0].rolbypassrls) {
    throw new Error('DATABASE_URL harus memakai role runtime non-superuser dan NOBYPASSRLS.');
  }

  const tables = await pool.query(
    `SELECT c.relname, c.relforcerowsecurity,
            c.relowner = (SELECT oid FROM pg_roles WHERE rolname = current_user) AS is_owner
     FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = ANY($1)`,
    [['stores', 'memberships', 'products', 'audit_events']],
  );
  const protectedTables = new Map(
    tables.rows.map((row) => [row.relname, { forced: row.relforcerowsecurity, owner: row.is_owner }]),
  );
  const missingOrUnforced = ['stores', 'memberships', 'products', 'audit_events'].filter(
    (name) => protectedTables.get(name)?.forced !== true || protectedTables.get(name)?.owner,
  );
  if (missingOrUnforced.length) {
    throw new Error(
      `Role runtime harus bukan pemilik tabel dan FORCE RLS harus aktif pada: ${missingOrUnforced.join(', ')}.`,
    );
  }
  console.info(`Database tersambung menggunakan role ${rows[0].role_name}; RLS aktif.`);
}

async function start() {
  await assertDatabaseSecurity();
  const app = createApp({ pool, config });

  if (config.isProduction) {
    app.use(express.static(path.join(root, 'dist'), { index: false }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(root, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      configFile: path.join(root, 'vite.config.js'),
      root,
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(config.port, () => {
    console.info(`GoJan berjalan di ${config.appOrigin} (API port ${config.port}).`);
  });

  const shutdown = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch(async (error) => {
  console.error('Server GoJan tidak dapat dimulai:', error);
  await pool.end();
  process.exitCode = 1;
});
