import assert from 'node:assert/strict';
import test from 'node:test';

import request from 'supertest';

import { createApp } from '../server/app.js';
import { readConfig } from '../server/config.js';
import { productInputSchema } from '../server/validation.js';

const config = {
  appOrigin: 'https://gojan.example',
  cookieName: '__Host-gojan_session',
  cookieSecure: true,
  databaseUrl: 'postgresql://unused',
  isProduction: true,
  port: 3000,
  publicStoreSlug: 'gojan',
  sessionMaxAgeMs: 8 * 60 * 60 * 1000,
  supabaseAnonKey: 'public-test-key',
  supabaseUrl: 'https://project.supabase.co',
};

test('login issues only a hashed opaque session in a secure HttpOnly cookie', async () => {
  const queries = [];
  const userId = 'c3e6fb6d-28d0-47a5-bcee-85c056d0815d';
  const storeId = '51fb754d-e115-4cdc-b421-0d09e958420e';
  const pool = {
    async query(sql, values) {
      queries.push({ sql, values });
      return { rows: [] };
    },
    async connect() {
      return {
        async query(sql, values) {
          queries.push({ sql, values });
          if (sql.includes('SELECT m.store_id, m.role')) {
            return { rows: [{ store_id: storeId, role: 'owner' }] };
          }
          return { rows: [] };
        },
        release() {},
      };
    },
  };
  const app = createApp({
    pool,
    config,
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://project.supabase.co/auth/v1/token?grant_type=password');
      assert.equal(options.headers.apikey, 'public-test-key');
      return {
        ok: true,
        async json() {
          return { user: { id: userId }, access_token: 'provider-access-token' };
        },
      };
    },
  });

  const response = await request(app)
    .post('/api/auth/login')
    .set('Origin', config.appOrigin)
    .send({ email: 'owner@example.test', password: 'a test password' });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { user: { id: userId, role: 'owner', storeId } });
  const cookie = response.headers['set-cookie'][0];
  assert.match(cookie, /^__Host-gojan_session=/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.doesNotMatch(cookie, /provider-access-token/);
  assert.equal(queries.filter(({ sql }) => sql.includes('INSERT INTO app_private.sessions')).length, 1);
  const sessionInsert = queries.find(({ sql }) => sql.includes('INSERT INTO app_private.sessions'));
  assert.match(sessionInsert.values[0], /^[a-f0-9]{64}$/);
  assert.equal(sessionInsert.values[1], userId);
  assert.equal(sessionInsert.values.includes('provider-access-token'), false);
});

test('login rejects a cross-origin request before contacting Supabase', async () => {
  let authCalled = false;
  const app = createApp({
    pool: { async query() { return { rows: [] }; } },
    config,
    fetchImpl: async () => {
      authCalled = true;
      throw new Error('must not be called');
    },
  });
  const response = await request(app)
    .post('/api/auth/login')
    .set('Origin', 'https://attacker.example')
    .send({ email: 'owner@example.test', password: 'password' });

  assert.equal(response.status, 403);
  assert.equal(authCalled, false);
});

test('login does not create a session for a Supabase user without store membership', async () => {
  const statements = [];
  const pool = {
    async query(sql) {
      statements.push(sql);
      return { rows: [] };
    },
    async connect() {
      return {
        async query(sql) {
          statements.push(sql);
          if (sql.includes('SELECT m.store_id, m.role')) return { rows: [] };
          return { rows: [] };
        },
        release() {},
      };
    },
  };
  const app = createApp({
    pool,
    config,
    fetchImpl: async () => ({
      ok: true,
      async json() {
        return { user: { id: 'c3e6fb6d-28d0-47a5-bcee-85c056d0815d' } };
      },
    }),
  });
  const response = await request(app)
    .post('/api/auth/login')
    .set('Origin', config.appOrigin)
    .send({ email: 'user@example.test', password: 'a test password' });

  assert.equal(response.status, 403);
  assert.equal(response.headers['set-cookie'], undefined);
  assert.equal(statements.some((sql) => sql.includes('INSERT INTO app_private.sessions')), false);
});

test('server product validation rejects invalid fields and unknown properties', () => {
  const product = {
    nama: 'Produk',
    kategori: 'Makanan',
    harga: 10_000,
    stok: 5,
    deskripsi: '',
    imageUrl: '',
    unggulan: false,
  };
  assert.equal(productInputSchema.safeParse(product).success, true);
  assert.equal(productInputSchema.safeParse({ ...product, stok: -1 }).success, false);
  assert.equal(productInputSchema.safeParse({ ...product, owner_id: 'attacker' }).success, false);
  assert.equal(productInputSchema.safeParse({ ...product, imageUrl: 'https://evil.example/x.svg' }).success, false);
});

test('production configuration requires HTTPS and PostgreSQL TLS', () => {
  const productionEnv = {
    NODE_ENV: 'production',
    APP_ORIGIN: 'https://gojan.example',
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_ANON_KEY: 'public-key',
    DATABASE_URL: 'postgresql://gojan_api:secret@db.example/postgres?sslmode=require',
  };
  assert.equal(readConfig(productionEnv).cookieSecure, true);
  assert.equal(readConfig(productionEnv).cookieName, '__Host-gojan_session');
  assert.throws(
    () => readConfig({ ...productionEnv, APP_ORIGIN: 'http://gojan.example' }),
    /HTTPS/,
  );
  assert.throws(
    () => readConfig({
      ...productionEnv,
      DATABASE_URL: 'postgresql://gojan_api:secret@db.example/postgres',
    }),
    /TLS PostgreSQL/,
  );
});

test('product mutations use server-side membership and reject viewer role', async () => {
  const userId = 'c3e6fb6d-28d0-47a5-bcee-85c056d0815d';
  const storeId = '51fb754d-e115-4cdc-b421-0d09e958420e';
  const productId = '63c9a4f9-15b3-4ee7-986e-e687f09defbf';
  const product = {
    nama: 'Produk Aman',
    kategori: 'Makanan',
    harga: 10_000,
    stok: 5,
    deskripsi: '',
    imageUrl: '',
    unggulan: false,
  };

  async function createAppForRole(role, statements) {
    const pool = {
      async query(sql) {
        if (sql.includes('FROM app_private.sessions')) return { rows: [{ user_id: userId }] };
        return { rows: [] };
      },
      async connect() {
        return {
          async query(sql, values) {
            statements.push({ sql, values });
            if (sql.includes('SELECT m.store_id, m.role')) {
              return { rows: [{ store_id: storeId, role }] };
            }
            if (sql.includes('INSERT INTO products')) {
              return {
                rows: [{
                  id: productId,
                  nama: values[1],
                  kategori: values[2],
                  harga: values[3],
                  stok: values[4],
                  deskripsi: values[5],
                  image_url: values[6],
                  unggulan: values[7],
                }],
              };
            }
            return { rows: [] };
          },
          release() {},
        };
      },
    };
    return createApp({
      pool,
      config,
      fetchImpl: async () => { throw new Error('not used'); },
    });
  }

  const ownerStatements = [];
  const ownerApp = await createAppForRole('owner', ownerStatements);
  const ownerResponse = await request(ownerApp)
    .post('/api/owner/products')
    .set('Origin', config.appOrigin)
    .set('Cookie', `${config.cookieName}=${'A'.repeat(43)}`)
    .send(product);

  assert.equal(ownerResponse.status, 201);
  const insert = ownerStatements.find(({ sql }) => sql.includes('INSERT INTO products'));
  assert.equal(insert.values[0], storeId);
  assert.ok(ownerStatements.some(({ sql, values }) => (
    sql.includes('set_config') && values[1] === userId
  )));

  const viewerStatements = [];
  const viewerApp = await createAppForRole('viewer', viewerStatements);
  const viewerResponse = await request(viewerApp)
    .post('/api/owner/products')
    .set('Origin', config.appOrigin)
    .set('Cookie', `${config.cookieName}=${'A'.repeat(43)}`)
    .send(product);

  assert.equal(viewerResponse.status, 403);
  assert.equal(viewerStatements.some(({ sql }) => sql.includes('INSERT INTO products')), false);
});
