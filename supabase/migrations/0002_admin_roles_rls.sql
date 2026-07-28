-- Women's Speaker Bureau — role-based admin auth
--
-- Replaces the "any authenticated user = admin" policies from 0001 with a
-- proper role model:
--   * admin_users links Supabase Auth users to a role.
--   * super_admin: manages admin_users + supporters, plus everything approver
--     can do, plus editing/deactivating/deleting speakers and intro requests.
--   * approver: view + approve/reject nominations and intro requests ONLY.
--
-- Column-level intent that RLS can't express ("approver may change status but
-- nothing else") is enforced via SECURITY DEFINER RPC functions: approvers get
-- NO direct UPDATE on speakers/intro_requests and must go through
-- set_speaker_status() / set_intro_request_status(), which mutate status only.
-- super_admins keep direct UPDATE for full edits.

-- ---------------------------------------------------------------------------
-- Role enum + admin_users table
-- ---------------------------------------------------------------------------
create type admin_role as enum (
  'super_admin',
  'approver'
);

create table admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       admin_role  not null,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

-- ---------------------------------------------------------------------------
-- Helper functions
--
-- SECURITY DEFINER so they read admin_users as the function owner (which
-- bypasses RLS) — this both keeps policies terse and prevents infinite
-- recursion when admin_users' own policies need to check the caller's role.
-- search_path is pinned to public to avoid search-path injection.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
  returns boolean
  language sql
  security definer
  stable
  set search_path = public
as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$;

create or replace function public.is_super_admin()
  returns boolean
  language sql
  security definer
  stable
  set search_path = public
as $$
  select exists (
    select 1 from admin_users
    where user_id = auth.uid() and role = 'super_admin'
  );
$$;

-- Returns the caller's admin role, or null if they are not an admin. Handy for
-- the dashboard to branch UI on the current user's role.
create or replace function public.current_admin_role()
  returns admin_role
  language sql
  security definer
  stable
  set search_path = public
as $$
  select role from admin_users where user_id = auth.uid();
$$;

grant execute on function public.is_admin()           to anon, authenticated;
grant execute on function public.is_super_admin()     to anon, authenticated;
grant execute on function public.current_admin_role() to authenticated;

-- ---------------------------------------------------------------------------
-- Status-transition RPCs (the only way an approver mutates data)
-- ---------------------------------------------------------------------------

-- Approve/reject a nomination (or, for super_admin, set any status incl.
-- inactive/pending). Only the status column is ever touched.
create or replace function public.set_speaker_status(
  p_speaker_id uuid,
  p_status     speaker_status
)
  returns speakers
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_row speakers;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  -- Approvers may only approve or reject; (de)activation is super_admin-only.
  if not public.is_super_admin() and p_status not in ('approved', 'rejected') then
    raise exception 'approver may only set status to approved or rejected'
      using errcode = '42501';
  end if;

  update speakers
     set status = p_status
   where id = p_speaker_id
  returning * into v_row;

  if not found then
    raise exception 'speaker % not found', p_speaker_id using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

-- Move an intro request through its review lifecycle
-- (approved / declined / introduced / pending). Only status is touched.
create or replace function public.set_intro_request_status(
  p_id     uuid,
  p_status intro_request_status
)
  returns intro_requests
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_row intro_requests;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update intro_requests
     set status = p_status
   where id = p_id
  returning * into v_row;

  if not found then
    raise exception 'intro request % not found', p_id using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

grant execute on function public.set_speaker_status(uuid, speaker_status)
  to authenticated;
grant execute on function public.set_intro_request_status(uuid, intro_request_status)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Replace the old "authenticated = admin" policies
-- ---------------------------------------------------------------------------

-- speakers ------------------------------------------------------------------
drop policy if exists "speakers: admin read all" on speakers;
drop policy if exists "speakers: admin update"   on speakers;
drop policy if exists "speakers: admin delete"   on speakers;

-- Both roles can view every speaker (incl. pending) in the dashboard.
create policy "speakers: admin read all"
  on speakers for select
  to authenticated
  using (public.is_admin());

-- Direct edits/deactivation are super_admin-only. Approvers change status via
-- set_speaker_status() (runs as definer, so it needs no UPDATE policy here).
create policy "speakers: super_admin update"
  on speakers for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "speakers: super_admin delete"
  on speakers for delete
  to authenticated
  using (public.is_super_admin());

-- intro_requests ------------------------------------------------------------
drop policy if exists "intro_requests: admin read"   on intro_requests;
drop policy if exists "intro_requests: admin update" on intro_requests;
drop policy if exists "intro_requests: admin delete" on intro_requests;

create policy "intro_requests: admin read"
  on intro_requests for select
  to authenticated
  using (public.is_admin());

-- Approvers change status via set_intro_request_status(); direct UPDATE is
-- reserved for super_admin.
create policy "intro_requests: super_admin update"
  on intro_requests for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "intro_requests: super_admin delete"
  on intro_requests for delete
  to authenticated
  using (public.is_super_admin());

-- supporters ----------------------------------------------------------------
drop policy if exists "supporters: admin insert" on supporters;
drop policy if exists "supporters: admin update" on supporters;
drop policy if exists "supporters: admin delete" on supporters;

create policy "supporters: super_admin insert"
  on supporters for insert
  to authenticated
  with check (public.is_super_admin());

create policy "supporters: super_admin update"
  on supporters for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "supporters: super_admin delete"
  on supporters for delete
  to authenticated
  using (public.is_super_admin());

-- admin_users ---------------------------------------------------------------
-- An admin can read their own row (to discover their role); super_admins can
-- read and manage all rows. No recursion: is_super_admin() is SECURITY DEFINER
-- and reads admin_users with RLS bypassed.
create policy "admin_users: read own or super_admin"
  on admin_users for select
  to authenticated
  using (user_id = auth.uid() or public.is_super_admin());

create policy "admin_users: super_admin insert"
  on admin_users for insert
  to authenticated
  with check (public.is_super_admin());

create policy "admin_users: super_admin update"
  on admin_users for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "admin_users: super_admin delete"
  on admin_users for delete
  to authenticated
  using (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- Bootstrapping the first super_admin
-- ---------------------------------------------------------------------------
-- No super_admin exists yet, so the first one cannot be created through RLS.
-- Seed it once by running the following with the service role (SQL editor /
-- service_role key), after the user has signed up via Supabase Auth:
--
--   insert into admin_users (user_id, role)
--   select id, 'super_admin' from auth.users where email = 'admin@example.com';
--
-- Thereafter, that super_admin invites others through the dashboard.
