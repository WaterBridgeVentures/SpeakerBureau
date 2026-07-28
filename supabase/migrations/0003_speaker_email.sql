-- Add a private email for speakers/nominees (used for approval + warm-intro
-- emails). It must NOT be exposed on the public directory.
--
-- Postgres can't "revoke one column" from a table-level SELECT grant, so we
-- drop the table-level SELECT for the public roles and re-grant SELECT on every
-- column EXCEPT email. INSERT/UPDATE are untouched (the nomination form still
-- writes email). Only the service role (server-side email sending) can read it.

alter table speakers add column email text;

revoke select on speakers from anon, authenticated;

grant select (
  id,
  name,
  designation,
  linkedin_url,
  photo_url,
  industry_speciality,
  domain_speciality,
  bio,
  status,
  created_at
) on speakers to anon, authenticated;
