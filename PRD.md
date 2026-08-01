# Women's Speaker Collective — Product Requirements (as built)

A free, India-focused, public directory of women speakers, run by a single
non-technical operator. No commercial component — a diversity & inclusion
initiative. This document describes the system **as actually implemented in this
repository**, and a final section notes where it diverged from the original
`PROJECT.md` spec.

- **Production:** https://speaker-bureau-nine.vercel.app
- **Source:** GitHub `WaterBridgeVentures/SpeakerBureau` (Vercel auto-deploys `main`)
- **Supabase project ref:** `ealuvtjucdtdqohnzzoj`

---

## 1. Tech stack

| Layer | Choice (as built) |
|---|---|
| Framework | **Next.js 16.2.12**, App Router, TypeScript, Turbopack (default). Note: v16 renamed `middleware` → **`proxy`** (Node.js runtime) and requires async `cookies()`/`headers()`. |
| UI | **React 19.2**, **Tailwind CSS v4** |
| Database & Auth | **Supabase** (Postgres + Row Level Security + Supabase Auth). Clients via `@supabase/ssr` 0.12 and `@supabase/supabase-js` 2.110 |
| Email | **Resend** 6.18 (transactional) |
| Hosting | **Vercel**, auto-deploy from `main`; `vercel.json` pins `framework: nextjs` |
| Mobile-first | Every screen built mobile-first; QA'd at 375 / 768 / 1024px |

### Routes

| Path | Type | Access |
|---|---|---|
| `/` | Landing | Public |
| `/nominate` | Self-nomination form | Public |
| `/speakers` | Directory (search/filter) | Public |
| `/speakers/[id]` | Speaker profile + intro request | Public (approved speakers only; else 404) |
| `/auth/callback` | Route handler — OAuth PKCE **and** magic-link `token_hash` exchange | Public |
| `/admin/login` | Admin sign-in (email/password) | Public |
| `/admin` → `/admin/nominations` | Redirect | Gated |
| `/admin/nominations`, `/admin/intro-requests`, `/admin/supporters`, `/admin/speakers`, `/admin/admins` | Dashboard tabs (route group `(dashboard)`) | Gated (role-based) |

### Supabase client layers (`src/lib/supabase/`)
- **`client.ts`** — browser client (anon key), used by Client Components.
- **`server.ts`** — cookie-bound SSR client; RLS runs as the signed-in user (or `anon`).
- **`admin.ts`** — **service-role** client, `server-only`, bypasses RLS. Used only in trusted server code (email sending, admin-user management, reading the private speaker email).
- **`proxy.ts`** — session-refresh helper used by `src/proxy.ts`.

---

## 2. Data model

Four tables plus five enum types. UUID primary keys (`gen_random_uuid()`),
`timestamptz` timestamps.

### Enums
- `speaker_status`: `pending` · `approved` · `rejected` · `inactive`
- `intro_request_status`: `pending` · `approved` · `declined` · `introduced`
- `domain_speciality`: Sales, Marketing, Finance, GTM, Product, Operations, HR, Strategy, Fundraising, Other
- `industry_speciality`: Technology, Financial Services, Healthcare, Consumer/Retail, Media & Entertainment, Education, Manufacturing, Real Estate, Public Sector/Policy, Non-profit/Social Impact, Other
- `admin_role`: `super_admin` · `approver`

### `speakers`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | |
| designation | text NOT NULL | role + org |
| linkedin_url | text NOT NULL | |
| photo_url | text | from LinkedIn OAuth picture or a manual URL |
| industry_speciality | `industry_speciality` | dropdown, nullable |
| domain_speciality | `domain_speciality` | dropdown, nullable |
| bio | text | optional, short |
| status | `speaker_status` NOT NULL default `pending` | |
| created_at | timestamptz | |
| **email** | text | **PRIVATE** — added in migration 0003; not exposed publicly (see below) |

Indexes on `status`, `industry_speciality`, `domain_speciality`.

**Email privacy (migration 0003):** Postgres can't revoke a single column from a
table-level grant, so table-level `SELECT` is revoked from `anon`/`authenticated`
and re-granted on **every column except `email`**. Result: the public directory
and any signed-in user can read all speaker fields **except** email; only the
**service role** (server-side email sending / admin editing) can read it.
`INSERT`/`UPDATE` are untouched, so the nomination form can still write it.

### `intro_requests`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| speaker_id | uuid NOT NULL → speakers(id) ON DELETE CASCADE | |
| requester_name | text NOT NULL | |
| requester_email | text NOT NULL | |
| requester_org | text | optional |
| reason | text | why they want the intro |
| status | `intro_request_status` NOT NULL default `pending` | |
| created_at | timestamptz | |

Indexes on `speaker_id`, `status`.

### `supporters`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| org_name | text NOT NULL | |
| logo_url | text NOT NULL | |
| link_url | text | optional website |
| display_order | int NOT NULL default 0 | **vestigial** — footer now sorts A–Z by `org_name`; field retained in DB but removed from the admin UI |

### `admin_users` (migration 0002)
| Column | Type | Notes |
|---|---|---|
| user_id | uuid PK → auth.users(id) ON DELETE CASCADE | |
| role | `admin_role` NOT NULL | |
| created_at | timestamptz | |

### Row Level Security (summary)
RLS is on for all four tables.
- **speakers:** public `SELECT` where `status = 'approved'`; public `INSERT` with `CHECK (status = 'pending')`; admins (`is_admin()`) read all; **super_admins** direct `UPDATE`/`DELETE`.
- **intro_requests:** public `INSERT` with `CHECK (status = 'pending')`; admins read all; **super_admins** direct `UPDATE`/`DELETE`.
- **supporters:** public `SELECT`; **super_admins** `INSERT`/`UPDATE`/`DELETE`.
- **admin_users:** an admin reads their own row; **super_admins** read all + manage.

### Security-definer functions (the role plumbing)
- `is_admin()`, `is_super_admin()`, `current_admin_role()` — `SECURITY DEFINER`, `stable`, pinned `search_path`. They read `admin_users` with RLS bypassed, which keeps policies terse and avoids infinite recursion on `admin_users`' own policies.
- `set_speaker_status(uuid, speaker_status)` and `set_intro_request_status(uuid, intro_request_status)` — `SECURITY DEFINER` RPCs that mutate **only** the status column. `set_speaker_status` allows a non-super-admin (approver) to set **only** `approved`/`rejected`; super_admins may set any status. These exist because RLS can't restrict *which columns* an `UPDATE` touches — so approvers get **no** direct `UPDATE` and must go through these.

---

## 3. User flow 1 — Self-nomination → onboarding

1. A candidate visits **`/nominate`** (linked from the landing page and directory).
2. **Optional LinkedIn prefill** ("Sign in with LinkedIn"): starts Supabase OAuth (`linkedin_oidc`, scopes `openid profile email`), redirect target `${window.location.origin}/auth/callback?next=/nominate`. After auth, the form prefills **name, email, and photo URL** from the session's `user_metadata`. Manual entry is always the fallback.
3. Form fields: **name\*, email\*** (private), **designation\***, **LinkedIn profile URL\***, photo URL (optional), industry speciality, domain speciality, bio. (\* required.)
4. Submit (a Server Action, `src/app/nominate/actions.ts`) validates input and inserts a `speakers` row with `status = 'pending'` using the anon/session client (RLS permits it; no `.select()` back, since pending rows aren't publicly readable). A "thank you / pending review" state is shown.
5. Admin reviews under **Pending Nominations** and approves or rejects.
6. **On approval:** `status → approved` (speaker becomes visible in the directory) **and** a confirmation email is sent to the nominee via Resend. Approval succeeds even if the email fails or is skipped (a warning toast surfaces email failures; no email is sent if there's no address on file).
7. **On rejection:** `status → rejected`, no public visibility, no email.

### LinkedIn OAuth prefill — what does and doesn't fill
LinkedIn's **OpenID Connect** returns: `name`, `given_name`, `family_name`, `picture`, `email`, `email_verified`, `locale`, and an opaque `sub`/`provider_id`.
- **Prefilled:** name, photo (`picture`), email.
- **Not available from OIDC → entered manually:** **designation/headline** (not an OIDC claim) and the **LinkedIn profile URL** (OIDC exposes only an opaque member id, which can't be turned into a `linkedin.com/in/…` URL). The form shows a note explaining the URL must be pasted.
- **Linked accounts:** prefill is **not** gated on the primary provider. If a person signs in with LinkedIn using an email that already has an account (e.g. the operator's admin login), Supabase links the identity and `app_metadata.provider` stays `email` — so prefill triggers whenever the session's metadata contains a name/picture, regardless of primary provider.

---

## 4. User flow 2 — Directory → intro request → warm intro

1. **`/speakers`** lists all `approved` speakers as cards (photo/initials, name, designation, industry + domain tags). All approved speakers are fetched in one query; **search (by name) and filters (industry, domain)** run **client-side** (instant; no server pagination — sized for ~100 speakers).
2. **`/speakers/[id]`** shows the full profile. A non-approved/unknown/invalid id returns **404** (enforced by RLS + a `status = 'approved'` filter). Dynamic `<title>` via `generateMetadata`.
3. **"Request an Introduction"** expands an inline form: requester **name\*, email\*, organisation** (optional), **reason\***. Submit (`src/app/speakers/[id]/actions.ts`) validates, confirms the `speaker_id` belongs to an approved speaker, and inserts an `intro_requests` row with `status = 'pending'` (no `.select()` back).
4. New requests appear in the admin **Pending Intro Requests** tab.
5. **On approval:** the standard **warm-introduction email** is sent to both parties, then `status → introduced` (only if the email actually sent — a failure leaves the request pending to retry). A success toast confirms; if the speaker has no email on file, the intro goes to the requester + the bureau admin (to forward) and a warning toast says so honestly.
6. **On decline:** `status → declined`, no email.

### Warm-introduction email (Resend, `src/lib/email.ts`)
```
Subject: Introduction: {requester_name} <> {speaker_name}

Hi {requester_name} and {speaker_name},

Happy to make this introduction. {requester_name} ({requester_org|"independent"})
would like to connect with {speaker_name} ({speaker_designation}):

{reason}

{speaker_name}, you can reach {requester_name} directly at {requester_email} —
replying to this email will go straight to them.

I'll let you two take it from here!

Best,
{BUREAU_ADMIN_NAME}, Women's Speaker Collective
```
- **Recipients:** `[requester_email, speaker.email]`. If the speaker has no email, falls back to `[requester_email, BUREAU_ADMIN_EMAIL]`.
- **Reply-to:** the **requester's** address, so a speaker's reply reaches them directly.
- A separate, composed **nomination-approval** email confirms the nominee is now listed.

---

## 5. Admin dashboard & role-based permissions

Gated at `/admin` (route group `(dashboard)`). Auth is enforced in depth:
- **`src/proxy.ts`** refreshes the Supabase session on every request and optimistically redirects unauthenticated visitors away from `/admin` (except `/admin/login`).
- **DAL (`src/lib/dal.ts`)** is authoritative: `getAdmin()` calls `getUser()` (validates the JWT) then looks up the caller's role in `admin_users`, memoized per-request with React `cache`. `requireAdmin()` / `requireSuperAdmin()` redirect if unauthorized, and are called by every gated page and every mutating Server Action.
- Sign-in is **email/password** (`/admin/login`). **Magic-link** sign-in also works: `/auth/callback` verifies a `token_hash` via `verifyOtp`.

### Tabs
1. **Pending Nominations** — approve / reject, with photo and submitted fields.
2. **Pending Intro Requests** — approve (sends warm intro) / decline, with requester + speaker context.
3. **Supporters** — add / edit / remove (super_admin only).
4. **All Speakers** — view/edit/deactivate any speaker; set the private email (super_admin only).
5. **Admin Users** — add / change-role / remove admins (super_admin only), with self-lockout guards.

The nav hides tabs a role can't use, and wraps to multiple rows on mobile.

### Role model: `super_admin` vs `approver`

| Capability | approver | super_admin |
|---|:--:|:--:|
| View all nominations / intro requests | ✓ | ✓ |
| Approve / reject **nominations** (status only) | ✓ | ✓ |
| Approve / decline **intro requests** (status only) | ✓ | ✓ |
| Edit a speaker's fields / set email / deactivate | ✗ | ✓ |
| Delete a speaker / intro request | ✗ | ✓ |
| Manage **supporters** (add/edit/remove) | ✗ | ✓ |
| Manage **admin users** | ✗ | ✓ |

**Enforcement is layered:**
- Approvers have **no direct table `UPDATE`**; their status changes go through the `set_speaker_status` / `set_intro_request_status` RPCs, which mutate only `status` and cap approvers to `approved`/`rejected` (speakers). This holds even against the raw API.
- Super-admin-only actions that use the **service-role** client (admin-user management, reading the private email, editing speakers) are gated in code by `requireSuperAdmin()` first, since the service role bypasses RLS.
- **Bootstrapping:** the first `super_admin` can't be created through RLS (none exists yet), so it's seeded once via the service role: `insert into admin_users (user_id, role) select id, 'super_admin' from auth.users where email = '…'`.

Admin feedback uses a toast system (success/warning) plus inline errors — e.g. a green "Introduction sent" toast, or an amber "speaker has no email on file, you were CC'd" warning.

---

## 6. Supporter logo strip

- **Public footer** (`src/app/_components/Footer.tsx`, a server component) on the landing, directory, profile, and nominate pages via a sticky-footer layout.
- Pulls **live** from `supporters` (RLS anon read), **sorted A–Z by `org_name`**.
- Each logo links to its `link_url` when present; renders nothing when there are no supporters.
- **Responsive:** logos **wrap** to multiple rows on narrow screens.
- Full admin CRUD in the Supporters tab (super_admin only).

---

## 7. Environment & deployment

### Environment variables (`.env.example`)
Required (from PROJECT.md): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.
Optional email tuning (fallbacks if unset): `RESEND_FROM`, `BUREAU_ADMIN_EMAIL`, `BUREAU_ADMIN_NAME`.

> The LinkedIn credentials are entered in the **Supabase dashboard** (Authentication → Providers → LinkedIn OIDC), not read by the app — listed for deployment reference only.

### Deployment notes
- **Vercel** auto-deploys `main`. `vercel.json` declares `framework: nextjs` so Vercel wires up the App Router (a missing/mis-set framework preset causes every route to 404 despite a "Ready" build).
- **Supabase Auth config** matters for OAuth: **Site URL** must be the production URL and the **Redirect URLs allow-list** must use **`/**` wildcards** (e.g. `https://speaker-bureau-nine.vercel.app/**`, `http://localhost:3000/**`) — the app's `redirect_to` carries a query string, which an exact (non-wildcard) entry won't match, causing a fallback to Site URL.

---

## 8. How this differs from the original `PROJECT.md` spec

The tech stack, the two workflows, the directory, the admin dashboard, the
warm-intro template, and the enum values all match the spec. The notable
deviations and clarifications:

1. **Speaker email added (new column).** The original data model had no email on `speakers`, but both the nomination-approval and warm-intro emails need a recipient. Added a **private** `speakers.email` (column-level grants hide it from the public/authenticated roles; only the service role reads it), and the **nomination form now collects a required email**.
2. **LinkedIn prefill fills name/photo/email, not "headline."** The spec said it fills "name, photo, and headline." LinkedIn OIDC does **not** return a headline, so **designation is entered manually**; the **LinkedIn profile URL also can't be prefilled** (OIDC exposes only an opaque id). Prefill was also made to work for **linked accounts** (where the primary provider reads `email`).
3. **Photo: URL + LinkedIn, not file upload.** The spec allowed "upload or auto-filled via LinkedIn." Implemented as LinkedIn auto-fill **plus a manual photo-URL field**; a Supabase Storage upload flow was **not** built (deferred).
4. **Two-role admin model.** The spec described a single admin. Built `super_admin` + `approver` with an `admin_users` table and RPC-enforced, column-scoped permissions (the initial 0001 migration used a placeholder "any authenticated = admin," replaced in 0002).
5. **Supporters sort A–Z, not by `display_order`.** The strip sorts alphabetically by org name; the `display_order` column is retained in the DB but **removed from the admin UI** (now vestigial).
6. **Admin magic-link sign-in** is supported (`/auth/callback` handles `token_hash`), in addition to email/password.
7. **Warm-intro email enhanced.** Beyond the spec template, it **includes the requester's email** in the body and sets **reply-to to the requester**, so the speaker can actually reach them. A **nomination-approval** email was also composed (the spec provided no template for it).
8. **Next.js 16 specifics (as built).** Uses **`proxy.ts`** (v16's rename of `middleware`, Node.js runtime) for session refresh + gating, and the async request APIs.
9. **Deferred / not built:** file-upload to Storage (see #3); a custom domain (running on the default `*.vercel.app`); optional "polite decline" emails on rejection/decline (only approvals send email).

---

*This document reflects the codebase as of the latest commit on `main`. When the
schema or flows change, update the relevant section here and in the migrations.*
