BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS app_private;

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (store_id, user_id)
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  legacy_id text,
  nama text NOT NULL CHECK (char_length(btrim(nama)) BETWEEN 2 AND 60),
  kategori text NOT NULL CHECK (char_length(btrim(kategori)) BETWEEN 1 AND 24),
  harga integer NOT NULL CHECK (harga BETWEEN 0 AND 100000000),
  stok integer NOT NULL CHECK (stok BETWEEN 0 AND 100000),
  deskripsi text NOT NULL DEFAULT '' CHECK (char_length(deskripsi) <= 280),
  image_url text NOT NULL DEFAULT '' CHECK (
    image_url = '' OR image_url ~ '^/img/[\w.-]+\.(svg|png|jpe?g|webp)$'
  ),
  unggulan boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS products_store_legacy_id_unique
  ON products (store_id, legacy_id) WHERE legacy_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_public_catalog_idx
  ON products (store_id, created_at DESC) WHERE is_published = true;

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL REFERENCES auth.users(id),
  store_id uuid NOT NULL REFERENCES stores(id),
  action text NOT NULL CHECK (char_length(action) <= 80),
  entity_type text NOT NULL CHECK (char_length(entity_type) <= 80),
  entity_id uuid,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_events_store_created_idx
  ON audit_events (store_id, created_at DESC);

CREATE TABLE IF NOT EXISTS app_private.sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS sessions_user_expiry_idx
  ON app_private.sessions (user_id, expires_at);

CREATE OR REPLACE FUNCTION app_private.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores FORCE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stores_public_read ON stores;
CREATE POLICY stores_public_read ON stores
  FOR SELECT USING (is_public = true);
DROP POLICY IF EXISTS stores_member_read ON stores;
CREATE POLICY stores_member_read ON stores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.store_id = stores.id
        AND m.user_id = app_private.current_user_id()
        AND m.is_active = true
    )
  );

DROP POLICY IF EXISTS memberships_self_read ON memberships;
CREATE POLICY memberships_self_read ON memberships
  FOR SELECT USING (user_id = app_private.current_user_id() AND is_active = true);

DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products
  FOR SELECT USING (
    is_published = true AND EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id = products.store_id AND s.is_public = true
    )
  );
DROP POLICY IF EXISTS products_member_read ON products;
CREATE POLICY products_member_read ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.store_id = products.store_id
        AND m.user_id = app_private.current_user_id()
        AND m.is_active = true
    )
  );
DROP POLICY IF EXISTS products_editor_insert ON products;
CREATE POLICY products_editor_insert ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.store_id = products.store_id
        AND m.user_id = app_private.current_user_id()
        AND m.is_active = true
        AND m.role IN ('owner', 'editor')
    )
  );
DROP POLICY IF EXISTS products_editor_update ON products;
CREATE POLICY products_editor_update ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.store_id = products.store_id
        AND m.user_id = app_private.current_user_id()
        AND m.is_active = true
        AND m.role IN ('owner', 'editor')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.store_id = products.store_id
        AND m.user_id = app_private.current_user_id()
        AND m.is_active = true
        AND m.role IN ('owner', 'editor')
    )
  );
DROP POLICY IF EXISTS products_editor_delete ON products;
CREATE POLICY products_editor_delete ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.store_id = products.store_id
        AND m.user_id = app_private.current_user_id()
        AND m.is_active = true
        AND m.role IN ('owner', 'editor')
    )
  );

DROP POLICY IF EXISTS audit_owner_insert ON audit_events;
CREATE POLICY audit_owner_insert ON audit_events
  FOR INSERT WITH CHECK (
    actor_user_id = app_private.current_user_id() AND EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.store_id = audit_events.store_id
        AND m.user_id = app_private.current_user_id()
        AND m.is_active = true
        AND m.role IN ('owner', 'editor')
    )
  );
DROP POLICY IF EXISTS audit_owner_read ON audit_events;
CREATE POLICY audit_owner_read ON audit_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.store_id = audit_events.store_id
        AND m.user_id = app_private.current_user_id()
        AND m.is_active = true
        AND m.role = 'owner'
    )
  );

REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO gojan_api;
GRANT USAGE ON SCHEMA app_private TO gojan_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON app_private.sessions TO gojan_api;
GRANT EXECUTE ON FUNCTION app_private.current_user_id() TO gojan_api;
GRANT SELECT ON stores, memberships, products, audit_events TO gojan_api;
GRANT INSERT, UPDATE, DELETE ON products TO gojan_api;
GRANT INSERT ON audit_events TO gojan_api;

COMMIT;
