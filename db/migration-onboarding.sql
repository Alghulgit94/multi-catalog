-- Migración para bases ya creadas: onboarding previo al registro.
-- Ejecutar una vez en el SQL Editor de Supabase.

alter table stores add column if not exists plan_intent text;

create table if not exists onboarding_drafts (
  id              uuid primary key default gen_random_uuid(),
  data            jsonb not null default '{}'::jsonb,
  logo_public_id  text,
  expires_at      timestamptz not null default (now() + interval '7 days'),
  claimed_at      timestamptz,
  claimed_by      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists onboarding_drafts_expires_idx on onboarding_drafts (expires_at);
drop trigger if exists onboarding_drafts_updated_at on onboarding_drafts;
create trigger onboarding_drafts_updated_at before update on onboarding_drafts
  for each row execute function set_updated_at();
alter table onboarding_drafts enable row level security;
