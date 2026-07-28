-- Women's Speaker Bureau — initial schema
-- Tables: speakers, intro_requests, supporters
-- Enum values match PROJECT.md exactly.
--
-- Notes:
--  * The four dropdown/status fields are implemented as Postgres ENUM types so
--    the exact allowed values are enforced in the database. Enums remain
--    extendable later via `ALTER TYPE <type> ADD VALUE '<new>'` — this covers
--    the spec's "starter list, editable" note for industry_speciality.
--  * Row Level Security is enabled with baseline policies derived from the
--    public workflows described in the spec (public read of approved speakers &
--    supporters; public insert for self-nomination and intro requests; the
--    authenticated admin has full access). Adjust as the auth model firms up.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------

-- speakers.status
create type speaker_status as enum (
  'pending',
  'approved',
  'rejected',
  'inactive'
);

-- intro_requests.status
create type intro_request_status as enum (
  'pending',
  'approved',
  'declined',
  'introduced'
);

-- speakers.domain_speciality
create type domain_speciality as enum (
  'Sales',
  'Marketing',
  'Finance',
  'GTM',
  'Product',
  'Operations',
  'HR',
  'Strategy',
  'Fundraising',
  'Other'
);

-- speakers.industry_speciality (starter list — editable via ALTER TYPE ... ADD VALUE)
create type industry_speciality as enum (
  'Technology',
  'Financial Services',
  'Healthcare',
  'Consumer/Retail',
  'Media & Entertainment',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Public Sector/Policy',
  'Non-profit/Social Impact',
  'Other'
);

-- ---------------------------------------------------------------------------
-- speakers
-- ---------------------------------------------------------------------------
create table speakers (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  designation          text not null,               -- role + org
  linkedin_url         text not null,
  photo_url            text,                         -- upload or LinkedIn OAuth picture
  industry_speciality  industry_speciality,
  domain_speciality    domain_speciality,
  bio                  text,                         -- optional, short
  status               speaker_status not null default 'pending',
  created_at           timestamptz not null default now()
);

create index speakers_status_idx              on speakers (status);
create index speakers_industry_speciality_idx on speakers (industry_speciality);
create index speakers_domain_speciality_idx   on speakers (domain_speciality);

-- ---------------------------------------------------------------------------
-- intro_requests
-- ---------------------------------------------------------------------------
create table intro_requests (
  id              uuid primary key default gen_random_uuid(),
  speaker_id      uuid not null references speakers (id) on delete cascade,
  requester_name  text not null,
  requester_email text not null,
  requester_org   text,                             -- optional
  reason          text,                             -- why they want the intro
  status          intro_request_status not null default 'pending',
  created_at      timestamptz not null default now()
);

create index intro_requests_speaker_id_idx on intro_requests (speaker_id);
create index intro_requests_status_idx     on intro_requests (status);

-- ---------------------------------------------------------------------------
-- supporters
-- ---------------------------------------------------------------------------
create table supporters (
  id            uuid primary key default gen_random_uuid(),
  org_name      text not null,
  logo_url      text not null,
  link_url      text,                               -- optional, org website
  display_order int  not null default 0             -- footer strip ordering
);

create index supporters_display_order_idx on supporters (display_order);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table speakers       enable row level security;
alter table intro_requests enable row level security;
alter table supporters     enable row level security;

-- speakers ------------------------------------------------------------------
-- Public can read only approved speakers (the directory).
create policy "speakers: public read approved"
  on speakers for select
  to anon, authenticated
  using (status = 'approved');

-- Public self-nomination: anyone may create a speaker row, but only as pending.
create policy "speakers: public self-nominate"
  on speakers for insert
  to anon, authenticated
  with check (status = 'pending');

-- Admin (any authenticated user — only the operator signs in) full access.
create policy "speakers: admin read all"
  on speakers for select
  to authenticated
  using (true);

create policy "speakers: admin update"
  on speakers for update
  to authenticated
  using (true)
  with check (true);

create policy "speakers: admin delete"
  on speakers for delete
  to authenticated
  using (true);

-- intro_requests ------------------------------------------------------------
-- Public may submit an intro request (always starts as pending).
create policy "intro_requests: public create"
  on intro_requests for insert
  to anon, authenticated
  with check (status = 'pending');

-- Admin full access (read / update / delete).
create policy "intro_requests: admin read"
  on intro_requests for select
  to authenticated
  using (true);

create policy "intro_requests: admin update"
  on intro_requests for update
  to authenticated
  using (true)
  with check (true);

create policy "intro_requests: admin delete"
  on intro_requests for delete
  to authenticated
  using (true);

-- supporters ----------------------------------------------------------------
-- Public can read supporters (footer logo strip).
create policy "supporters: public read"
  on supporters for select
  to anon, authenticated
  using (true);

-- Admin manages supporters.
create policy "supporters: admin insert"
  on supporters for insert
  to authenticated
  with check (true);

create policy "supporters: admin update"
  on supporters for update
  to authenticated
  using (true)
  with check (true);

create policy "supporters: admin delete"
  on supporters for delete
  to authenticated
  using (true);
