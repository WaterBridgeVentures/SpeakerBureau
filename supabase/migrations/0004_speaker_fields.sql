-- Directory feature fields on speakers:
--   verified            — true when the profile was created via LinkedIn OAuth
--   location            — city (free text)
--   in_person_or_virtual— speaking format preference (enum)
--   featured            — admin-toggleable, floats to the top of the directory

create type speaking_format as enum ('in_person', 'virtual', 'both');

alter table speakers
  add column verified boolean not null default false,
  add column location text,
  add column in_person_or_virtual speaking_format,
  add column featured boolean not null default false;

-- Migration 0003 replaced table-level SELECT with column-level grants for the
-- public roles, so new columns must be granted explicitly to be readable.
grant select (verified, location, in_person_or_virtual, featured)
  on speakers to anon, authenticated;

create index speakers_featured_idx on speakers (featured);
