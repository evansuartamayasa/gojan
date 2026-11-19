function required(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Konfigurasi ${name} wajib diisi.`);
  return value;
}

export function readConfig(env = process.env) {
  const appOrigin = new URL(env.APP_ORIGIN || 'http://localhost:5173').origin;
  const supabaseUrl = new URL(required(env, 'SUPABASE_URL'));
  if (!['https:', 'http:'].includes(supabaseUrl.protocol)) {
    throw new Error('SUPABASE_URL harus menggunakan HTTP atau HTTPS.');
  }

  const nodeEnv = env.NODE_ENV || 'development';
  const databaseUrl = new URL(required(env, 'DATABASE_URL'));
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
    throw new Error('DATABASE_URL harus menggunakan protokol PostgreSQL.');
  }
  if (nodeEnv === 'production') {
    if (appOrigin.startsWith('http:') || supabaseUrl.protocol !== 'https:') {
      throw new Error('Produksi wajib memakai HTTPS untuk aplikasi dan Supabase Auth.');
    }
    if (!['require', 'verify-ca', 'verify-full'].includes(databaseUrl.searchParams.get('sslmode'))) {
      throw new Error('DATABASE_URL produksi wajib mengaktifkan TLS PostgreSQL (sslmode=require).');
    }
  }

  const port = Number.parseInt(env.PORT || '3000', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT harus berupa bilangan 1–65535.');
  }

  return {
    appOrigin,
    cookieSecure: nodeEnv === 'production' || env.COOKIE_SECURE === 'true',
    cookieName:
      nodeEnv === 'production' || env.COOKIE_SECURE === 'true'
        ? '__Host-gojan_session'
        : 'gojan_session',
    databaseUrl: databaseUrl.toString(),
    port,
    publicStoreSlug: env.PUBLIC_STORE_SLUG || 'gojan',
    sessionMaxAgeMs: 8 * 60 * 60 * 1000,
    supabaseAnonKey: required(env, 'SUPABASE_ANON_KEY'),
    supabaseUrl: supabaseUrl.origin,
    isProduction: nodeEnv === 'production',
  };
}
