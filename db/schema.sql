-- Esquema multi-tienda (PostgreSQL / Supabase).
--
-- Orden de ejecución:
--   1. Crear las tablas de Better Auth:  pnpm auth:migrate   (user, session, account, verification)
--   2. Ejecutar este archivo en el SQL Editor de Supabase.
--   3. (Opcional) db/seed.sql para cargar tiendas de demostración.
--
-- Todo el acceso desde la app es server-side con la service role key, filtrando
-- siempre por store_id desde lib/data. RLS queda activado SIN políticas: la
-- anon key no puede leer ni escribir nada.

create extension if not exists pgcrypto;

-- ─── Tipos ───────────────────────────────────────────────────────────────────

create type store_status as enum (
  'active_unverified', 'in_review', 'verified', 'paused', 'suspended'
);
create type member_role as enum ('owner', 'editor');
create type review_action as enum ('approved', 'changes_requested', 'suspended', 'reactivated');

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─── Tiendas ─────────────────────────────────────────────────────────────────

create table stores (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  slug                  text not null unique
                        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 30),
  status                store_status not null default 'active_unverified',

  -- Marca y textos del catálogo
  logo_path             text,
  primary_color         text,
  banner_path           text,
  hero_eyebrow          text,
  hero_title            text,
  hero_subtitle         text,
  shipping_note         text,
  tagline               text,

  -- Contacto
  whatsapp              text,
  email                 text,
  address               text,
  city                  text,
  currency              text not null default 'PYG',
  locale                text not null default 'es-PY',

  -- Etapa 2: planes (reservado, sin FK todavía)
  plan_id               uuid,

  -- Verificación
  terms_accepted_at     timestamptz,
  verification_deadline timestamptz,
  verified_at           timestamptz,
  review_message        text,
  reminder_day3_sent_at timestamptz,
  reminder_day6_sent_at timestamptz,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index stores_status_idx on stores (status);
create trigger stores_updated_at before update on stores
  for each row execute function set_updated_at();

-- ─── Miembros (usuario ↔ tienda) ─────────────────────────────────────────────
-- user_id referencia la tabla "user" creada por Better Auth.

create table store_members (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  user_id    text not null references "user"(id) on delete cascade,
  role       member_role not null default 'owner',
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);
create index store_members_user_idx on store_members (user_id);

-- ─── Catálogo ────────────────────────────────────────────────────────────────
-- Las FK compuestas (id, store_id) impiden que un producto apunte a una
-- categoría de otra tienda, aunque el código se equivoque.

create table categories (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  name        text not null,
  slug        text not null,
  description text,
  image_path  text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (store_id, slug),
  unique (id, store_id)
);
create trigger categories_updated_at before update on categories
  for each row execute function set_updated_at();

create table subcategories (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  category_id uuid not null,
  name        text not null,
  slug        text not null,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (store_id, slug),
  unique (id, store_id),
  foreign key (category_id, store_id) references categories (id, store_id) on delete cascade
);
create trigger subcategories_updated_at before update on subcategories
  for each row execute function set_updated_at();

create table products (
  id                uuid primary key default gen_random_uuid(),
  store_id          uuid not null references stores(id) on delete cascade,
  category_id       uuid not null,
  subcategory_id    uuid,
  sku               text,
  name              text not null,
  slug              text not null,
  short_description text,
  description       text,
  price             numeric,
  show_price        boolean not null default true,
  featured          boolean not null default false,
  tags              text[] not null default '{}',
  is_active         boolean not null default true,
  is_visible        boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (store_id, slug),
  unique (id, store_id),
  foreign key (category_id, store_id) references categories (id, store_id) on delete restrict,
  foreign key (subcategory_id, store_id) references subcategories (id, store_id)
    on delete set null (subcategory_id)
);
create index products_store_idx on products (store_id, is_active, is_visible);
create index products_category_idx on products (category_id);
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

-- public_id de Cloudinary completo (stores/{store_id}/products/...). Un producto
-- tiene como máximo una portada; la galería se ordena por sort_order.
create table product_images (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null references stores(id) on delete cascade,
  product_id      uuid not null,
  public_id       text not null,
  sort_order      integer not null default 0,
  is_cover        boolean not null default false,
  -- Reservado para marcar imágenes generadas con IA (etapa 2).
  is_ai_generated boolean not null default false,
  created_at      timestamptz not null default now(),
  foreign key (product_id, store_id) references products (id, store_id) on delete cascade
);
create index product_images_product_idx on product_images (product_id, sort_order);
create unique index product_images_one_cover on product_images (product_id) where is_cover;

-- ─── Revisión y configuración ────────────────────────────────────────────────

create table review_history (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  admin_id   text not null references "user"(id),
  action     review_action not null,
  reason     text,
  created_at timestamptz not null default now()
);
create index review_history_store_idx on review_history (store_id, created_at desc);

create table system_settings (
  key   text primary key,
  value jsonb not null
);
insert into system_settings (key, value) values
  ('verification_days', '7'),
  ('review_mode', '"manual"');

-- ─── RLS: activado sin políticas (solo la service role accede) ───────────────

alter table stores          enable row level security;
alter table store_members   enable row level security;
alter table categories      enable row level security;
alter table subcategories   enable row level security;
alter table products        enable row level security;
alter table product_images  enable row level security;
alter table review_history  enable row level security;
alter table system_settings enable row level security;
