-- Convert the single-value industry_speciality / domain_speciality columns into
-- proper many-to-many join tables so a speaker can have several of each, with an
-- optional custom "Others" label.
--
-- This migration is ADDITIVE: the old enum columns are left in place (no longer
-- read by the app) so an in-flight old deployment keeps working during rollout.
-- They can be dropped in a later cleanup migration.

-- Join tables. Allowed values are CHECK-constrained to the canonical lists (kept
-- in sync with src/lib/constants.ts). "Others" is a real value; the free-text
-- label lives in speakers.industry_other_text / domain_other_text.
create table speaker_industries (
  speaker_id uuid not null references speakers (id) on delete cascade,
  industry text not null,
  primary key (speaker_id, industry),
  constraint speaker_industries_valid check (
    industry in (
      'AI, Software and Technology',
      'Fintech, Banking and Financial Services',
      'Healthcare',
      'Consumer/Retail',
      'Media & Entertainment',
      'Education',
      'Hardware and Manufacturing',
      'Real Estate',
      'Climate Tech',
      'DeepTech',
      'Agritech and Rural Economy',
      'Logistics & Supply Chain',
      'Legal / RegTech',
      'Public Sector/Policy',
      'Non-profit/Social Impact',
      'Others'
    )
  )
);

create table speaker_domains (
  speaker_id uuid not null references speakers (id) on delete cascade,
  domain text not null,
  primary key (speaker_id, domain),
  constraint speaker_domains_valid check (
    domain in (
      'Sales and GTM',
      'Marketing',
      'Finance',
      'Technology and Engineering',
      'Product',
      'Operations',
      'People and Talent',
      'Strategy',
      'Legal/Compliance',
      'Data/Analytics',
      'Board Governance / Investor Relations',
      'ESG/Impact',
      'Others'
    )
  )
);

create index speaker_industries_speaker_idx on speaker_industries (speaker_id);
create index speaker_industries_value_idx on speaker_industries (industry);
create index speaker_domains_speaker_idx on speaker_domains (speaker_id);
create index speaker_domains_value_idx on speaker_domains (domain);

-- Free-text label shown in place of "Others" on the directory card / profile.
alter table speakers
  add column industry_other_text text,
  add column domain_other_text text;

-- 0003 replaced table-level SELECT on speakers with per-column grants, so the new
-- columns must be granted explicitly to be readable by the public roles.
grant select (industry_other_text, domain_other_text)
  on speakers to anon, authenticated;

-- RLS: a join row is readable when the speaker is publicly visible (approved and
-- not paused) OR the caller is an admin (so the admin dashboard sees pending
-- speakers' tags too). Writes are service-role only (no write policies).
alter table speaker_industries enable row level security;
alter table speaker_domains enable row level security;

create policy speaker_industries_read on speaker_industries
  for select using (
    is_admin()
    or exists (
      select 1 from speakers s
      where s.id = speaker_industries.speaker_id
        and s.status = 'approved'
        and s.paused = false
    )
  );

create policy speaker_domains_read on speaker_domains
  for select using (
    is_admin()
    or exists (
      select 1 from speakers s
      where s.id = speaker_domains.speaker_id
        and s.status = 'approved'
        and s.paused = false
    )
  );

grant select on speaker_industries, speaker_domains to anon, authenticated;

-- Migrate existing single-value data into the join tables, mapping old labels to
-- the new vocabulary (unchanged labels pass through the ELSE branch).
insert into speaker_industries (speaker_id, industry)
select id,
  case industry_speciality::text
    when 'Technology' then 'AI, Software and Technology'
    when 'Financial Services' then 'Fintech, Banking and Financial Services'
    when 'Manufacturing' then 'Hardware and Manufacturing'
    when 'Other' then 'Others'
    else industry_speciality::text
  end
from speakers
where industry_speciality is not null
on conflict do nothing;

insert into speaker_domains (speaker_id, domain)
select id,
  case domain_speciality::text
    when 'Sales' then 'Sales and GTM'
    when 'GTM' then 'Sales and GTM'
    when 'HR' then 'People and Talent'
    when 'Fundraising' then 'Board Governance / Investor Relations'
    when 'Other' then 'Others'
    else domain_speciality::text
  end
from speakers
where domain_speciality is not null
on conflict do nothing;
