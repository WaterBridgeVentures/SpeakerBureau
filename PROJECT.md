# Women's Speaker Collective — Project Spec

## Overview
A free, India-focused, public-facing directory of women speakers, built and run
by a single non-technical operator (admin). No commercial component — this is a
diversity & inclusion initiative. The site has two independent public workflows
plus one admin approval dashboard.

## Tech Stack
- **Frontend/Backend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (Postgres)
- **Auth**: Supabase Auth — email/password or magic link for the admin;
  "Sign in with LinkedIn (OIDC)" for speaker self-nomination
- **File storage**: Supabase Storage (speaker photos, supporter logos)
- **Email**: Resend (transactional email API)
- **Hosting**: Vercel, auto-deploy from GitHub `main` branch
- **Mobile-first**: build every screen mobile-first with Tailwind responsive
  classes; the directory grid, all forms, and the admin dashboard must collapse
  cleanly to a single column on narrow viewports. Test at 375px width before
  wider breakpoints.

## Data Model

### `speakers`
| field | type | notes |
|---|---|---|
| id | uuid | pk |
| name | text | required |
| designation | text | required — role + org |
| linkedin_url | text | required |
| photo_url | text | from upload or LinkedIn OAuth profile picture |
| industry_speciality | enum/text | dropdown — see list below |
| domain_speciality | enum/text | dropdown — Sales, Marketing, Finance, GTM, Product, Operations, HR, Strategy, Fundraising, Other |
| bio | text | optional, short |
| status | enum | `pending`, `approved`, `rejected`, `inactive` |
| created_at | timestamp | |

### `intro_requests`
| field | type | notes |
|---|---|---|
| id | uuid | pk |
| speaker_id | uuid | fk → speakers |
| requester_name | text | required |
| requester_email | text | required |
| requester_org | text | optional |
| reason | text | why they want the intro |
| status | enum | `pending`, `approved`, `declined`, `introduced` |
| created_at | timestamp | |

### `supporters`
| field | type | notes |
|---|---|---|
| id | uuid | pk |
| org_name | text | |
| logo_url | text | |
| link_url | text | optional, org website |
| display_order | int | for footer strip ordering |

## Workflow 1 — Self-Nomination → Onboarding
1. Public "Nominate Yourself" form. Fields: name, designation, LinkedIn URL,
   photo (upload or auto-filled via LinkedIn OAuth), industry speciality
   (dropdown), domain speciality (dropdown), short bio (optional).
2. LinkedIn OAuth prefill: "Sign in with LinkedIn" button fills name, photo,
   and headline automatically from the person's own profile; manual entry is
   the fallback for anyone who skips it.
3. Submission creates a `speakers` row with `status = pending`.
4. Admin reviews in the admin dashboard, approves or rejects.
5. On approval: `status → approved`, speaker becomes visible in the public
   directory, and an auto-email confirmation goes to the nominee.
6. On rejection: `status → rejected`, no public visibility, optional email.

## Workflow 2 — Directory Browse → Intro Request → Warm Intro
1. Public directory page lists all `approved` speakers as cards (photo, name,
   designation, industry + domain tags).
2. Search/filter by name (text search) and by both dropdown fields.
3. Each speaker has a profile view with a "Request an Introduction" button
   opening a form: requester name, email, org (optional), reason/context.
4. Submission creates an `intro_requests` row with `status = pending`.
5. Admin reviews in the admin dashboard, approves or declines.
6. On approval: system sends the standard warm-introduction email (template
   below) and sets `status = introduced`. On decline: `status = declined`,
   no email sent (or an optional polite decline note to the requester).

## Standard Warm Introduction Email Template
Sent by admin (or system, from admin's address) to both parties on approval:

```
Subject: Introduction: {{requester_name}} <> {{speaker_name}}

Hi {{requester_name}} and {{speaker_name}},

Happy to make this introduction. {{requester_name}} ({{requester_org}}) would
like to connect with {{speaker_name}} ({{speaker_designation}}) — 

{{reason}}

I'll let you two take it from here!

Best,
[Admin name], Women's Speaker Collective
```

## Admin Dashboard
- Gated route (`/admin`), Supabase Auth login.
- Tab 1: Pending nominations — approve/reject with one click, view submitted
  fields and photo.
- Tab 2: Pending intro requests — approve/decline, view requester + speaker
  context; approve triggers the email template above.
- Tab 3: Supporters — add/edit/remove logo, name, link, reorder.
- Tab 4: All speakers — view/edit/deactivate any approved speaker.

## Public Site Structure
1. Landing page — mission statement, CTA to nominate + CTA to browse
2. Directory — searchable/filterable grid of approved speakers
3. Speaker profile — full details + "Request Introduction" button
4. Nominate Yourself — self-nomination form
5. Footer — supporter logo strip, pulled live from `supporters` table

## Dropdown Values — Industry Speciality (starter list, editable)
Technology, Financial Services, Healthcare, Consumer/Retail, Media &
Entertainment, Education, Manufacturing, Real Estate, Public Sector/Policy,
Non-profit/Social Impact, Other

## Build Order (do this in phases, commit after each)
1. Supabase schema + migrations for all three tables
2. Admin dashboard (auth + all 4 tabs) — build this early so test data can be
   seeded and reviewed before public forms exist
3. Self-nomination form + LinkedIn OAuth prefill
4. Public directory with search/filter
5. Speaker profile page + intro request form
6. Resend email integration for the warm-intro template
7. Supporter logo strip
8. Mobile QA pass across all screens at 375px, 768px, 1024px+
9. Deploy to Vercel, connect custom domain if available

## Environment Variables (set in Vercel dashboard, never commit)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`
