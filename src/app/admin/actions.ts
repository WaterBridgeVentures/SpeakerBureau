'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, requireSuperAdmin } from '@/lib/dal';
import { ADMIN_ROLES, DOMAIN_SPECIALITIES, INDUSTRY_SPECIALITIES } from '@/lib/constants';
import type {
  AdminRole,
  DomainSpeciality,
  IndustrySpeciality,
  IntroRequestStatus,
  SpeakerStatus,
} from '@/lib/database.types';

export type ActionResult = { ok?: true; error?: string };

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export type LoginState = { error?: string } | undefined;

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { error: error.message };
  }

  // Verify the account is actually an admin using the just-authenticated
  // in-memory session (avoids a cookie round-trip within this request).
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    return { error: 'This account is not authorized for the admin dashboard.' };
  }

  redirect('/admin');
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ---------------------------------------------------------------------------
// Nominations / All speakers — status transitions (both roles, DB-enforced)
// ---------------------------------------------------------------------------
export async function setSpeakerStatus(
  id: string,
  status: SpeakerStatus
): Promise<ActionResult> {
  const admin = await requireAdmin();
  // Mirror the DB rule for a friendlier message; the RPC enforces it regardless.
  if (admin.role !== 'super_admin' && status !== 'approved' && status !== 'rejected') {
    return { error: 'Approvers can only approve or reject.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('set_speaker_status', {
    p_speaker_id: id,
    p_status: status,
  });
  if (error) return { error: error.message };

  revalidatePath('/admin/nominations');
  revalidatePath('/admin/speakers');
  return { ok: true };
}

// Full edit of a speaker's fields (super_admin only).
export async function updateSpeaker(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const industry = String(formData.get('industry_speciality') ?? '');
  const domain = String(formData.get('domain_speciality') ?? '');

  const patch = {
    name: String(formData.get('name') ?? '').trim(),
    designation: String(formData.get('designation') ?? '').trim(),
    linkedin_url: String(formData.get('linkedin_url') ?? '').trim(),
    bio: String(formData.get('bio') ?? '').trim() || null,
    industry_speciality: (INDUSTRY_SPECIALITIES as string[]).includes(industry)
      ? (industry as IndustrySpeciality)
      : null,
    domain_speciality: (DOMAIN_SPECIALITIES as string[]).includes(domain)
      ? (domain as DomainSpeciality)
      : null,
  };

  if (!patch.name || !patch.designation || !patch.linkedin_url) {
    return { error: 'Name, designation and LinkedIn URL are required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('speakers').update(patch).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/speakers');
  revalidatePath('/admin/nominations');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Intro requests — status transitions (both roles, DB-enforced)
// ---------------------------------------------------------------------------
// NOTE: Approve sets `approved` for now. Phase 6 (Resend) will send the warm
// intro email and move the row to `introduced`.
export async function setIntroRequestStatus(
  id: string,
  status: IntroRequestStatus
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.rpc('set_intro_request_status', {
    p_id: id,
    p_status: status,
  });
  if (error) return { error: error.message };

  revalidatePath('/admin/intro-requests');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Supporters (super_admin only)
// ---------------------------------------------------------------------------
export async function createSupporter(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const row = {
    org_name: String(formData.get('org_name') ?? '').trim(),
    logo_url: String(formData.get('logo_url') ?? '').trim(),
    link_url: String(formData.get('link_url') ?? '').trim() || null,
    display_order: Number(formData.get('display_order') ?? 0) || 0,
  };
  if (!row.org_name || !row.logo_url) {
    return { error: 'Organisation name and logo URL are required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('supporters').insert(row);
  if (error) return { error: error.message };

  revalidatePath('/admin/supporters');
  return { ok: true };
}

export async function updateSupporter(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const patch = {
    org_name: String(formData.get('org_name') ?? '').trim(),
    logo_url: String(formData.get('logo_url') ?? '').trim(),
    link_url: String(formData.get('link_url') ?? '').trim() || null,
    display_order: Number(formData.get('display_order') ?? 0) || 0,
  };
  if (!patch.org_name || !patch.logo_url) {
    return { error: 'Organisation name and logo URL are required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('supporters').update(patch).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/supporters');
  return { ok: true };
}

export async function deleteSupporter(id: string): Promise<ActionResult> {
  await requireSuperAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from('supporters').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/supporters');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Admin users (super_admin only) — needs the service role to resolve emails
// from auth.users and to bypass RLS for management.
// ---------------------------------------------------------------------------
export async function addAdmin(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireSuperAdmin();

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const role = String(formData.get('role') ?? '') as AdminRole;
  if (!email) return { error: 'Email is required.' };
  if (!ADMIN_ROLES.includes(role)) return { error: 'Pick a valid role.' };

  const admin = createAdminClient();
  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) return { error: listErr.message };

  const user = list.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    return {
      error:
        'No Supabase Auth user with that email. Ask them to sign up first, then add them.',
    };
  }

  const { error } = await admin
    .from('admin_users')
    .upsert({ user_id: user.id, role }, { onConflict: 'user_id' });
  if (error) return { error: error.message };

  revalidatePath('/admin/admins');
  return { ok: true };
}

export async function updateAdminRole(
  userId: string,
  role: AdminRole
): Promise<ActionResult> {
  const me = await requireSuperAdmin();
  if (userId === me.id) {
    return { error: 'You cannot change your own role (avoids lockout).' };
  }
  if (!ADMIN_ROLES.includes(role)) return { error: 'Invalid role.' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('admin_users')
    .update({ role })
    .eq('user_id', userId);
  if (error) return { error: error.message };

  revalidatePath('/admin/admins');
  return { ok: true };
}

export async function removeAdmin(userId: string): Promise<ActionResult> {
  const me = await requireSuperAdmin();
  if (userId === me.id) {
    return { error: 'You cannot remove yourself (avoids lockout).' };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('admin_users')
    .delete()
    .eq('user_id', userId);
  if (error) return { error: error.message };

  revalidatePath('/admin/admins');
  return { ok: true };
}
