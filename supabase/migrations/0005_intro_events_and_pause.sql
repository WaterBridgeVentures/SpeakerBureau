-- Intro request event context + speaker self-pause.
--
-- intro_requests: optional event details captured on the public request form and
-- shown to the admin reviewer. Kept as free text (event_month accepts a browser
-- month value like '2026-09'; audience_size is text so it can hold a range such
-- as '50–100' or an estimate like '~200'). intro_requests still uses table-level
-- grants (migration 0003 only re-granted speakers per-column), so new columns
-- are covered by the existing anon INSERT / authenticated SELECT grants.
alter table intro_requests
  add column event_name text,
  add column event_month text,
  add column audience_size text;

-- speakers: a listed speaker can pause their own profile — hidden from the public
-- directory without changing status (stays 'approved', not deactivated/deleted).
alter table speakers
  add column paused boolean not null default false;

-- Migration 0003 replaced table-level SELECT with per-column grants for the
-- public roles, so `paused` must be granted explicitly (the directory filters on
-- it). email stays ungranted (private, service-role only).
grant select (paused) on speakers to anon, authenticated;

create index speakers_paused_idx on speakers (paused);
