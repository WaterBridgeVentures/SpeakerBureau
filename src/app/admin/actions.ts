'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNominationApproved, sendWarmIntro } from '@/lib/email';
import { requireAdmin, requireSuperAdmin } from '@/lib/dal';
import {
  ADMIN_ROLES,
  DOMAIN_SPECIALITIES,
  INDUSTRY_SPECIALITIES,
  SPEAKING_FORMATS,
} from '@/lib/constants';
import type {
  AdminRole,
  DomainSpeciality,
  IndustrySpeciality,
  IntroRequestStatus,
  SpeakerStatus,
  SpeakingFormat,
} from '@/lib/database.types';

export type ActionResult = {
  ok?: true;
  error?: string;
  warning?: string;
  success?: string;
};

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

// Approve a pending nomination AND email the nominee a confirmation. The
// approval is the primary action; a failed/skipped email is non-fatal.
export async function approveSpeaker(id: string): Promise<ActionResult> {
  await requireAdmin();

  // Service role: only it can read the private `email` column, and it lets us
  // approve + read the row back in one call. The status guard keeps this
  // idempotent (won't re-approve/re-email an already-approved speaker).
  const svc = createAdminClient();
  const { data: updated, error } = await svc
    .from('speakers')
    .update({ status: 'approved' })
    .eq('id', id)
    .eq('status', 'pending')
    .select('name, email')
    .maybeSingle();
  if (error) return { error: error.message };
  if (!updated) return { error: 'Nomination not found or already handled.' };

  revalidatePath('/admin/nominations');
  revalidatePath('/admin/speakers');
  revalidatePath('/speakers');

  const res = await sendNominationApproved({
    name: updated.name,
    email: updated.email ?? null,
  });
  if (!res.ok) {
    console.error('Nomination approved but confirmation email failed:', res.error);
    return { ok: true, warning: `Approved, but the email didn’t send: ${res.error}` };
  }
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
  const format = String(formData.get('in_person_or_virtual') ?? '');
  const email = String(formData.get('email') ?? '').trim();

  const patch = {
    name: String(formData.get('name') ?? '').trim(),
    designation: String(formData.get('designation') ?? '').trim(),
    linkedin_url: String(formData.get('linkedin_url') ?? '').trim(),
    bio: String(formData.get('bio') ?? '').trim() || null,
    email: email || null,
    location: String(formData.get('location') ?? '').trim() || null,
    industry_speciality: (INDUSTRY_SPECIALITIES as string[]).includes(industry)
      ? (industry as IndustrySpeciality)
      : null,
    domain_speciality: (DOMAIN_SPECIALITIES as string[]).includes(domain)
      ? (domain as DomainSpeciality)
      : null,
    in_person_or_virtual: (SPEAKING_FORMATS as string[]).includes(format)
      ? (format as SpeakingFormat)
      : null,
  };

  if (!patch.name || !patch.designation || !patch.linkedin_url) {
    return { error: 'Name, designation and LinkedIn URL are required.' };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email, or leave it blank.' };
  }

  // Service role (already super_admin-gated above) so the write covers the
  // private email column without depending on the authenticated role's grants.
  const svc = createAdminClient();
  const { error } = await svc.from('speakers').update(patch).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/speakers');
  revalidatePath('/admin/nominations');
  revalidatePath('/speakers');
  return { ok: true };
}

// Toggle the admin-controlled featured flag (super_admin only).
export async function toggleFeatured(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  await requireSuperAdmin();

  const svc = createAdminClient();
  const { error } = await svc
    .from('speakers')
    .update({ featured })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/speakers');
  revalidatePath('/speakers');
  return { ok: true };
}

// Pause/unpause a speaker (super_admin). Speakers can also do this themselves
// from /manage; this lets an admin unpause on their behalf if needed.
export async function togglePaused(
  id: string,
  paused: boolean
): Promise<ActionResult> {
  await requireSuperAdmin();

  const svc = createAdminClient();
  const { error } = await svc.from('speakers').update({ paused }).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/speakers');
  revalidatePath('/speakers');
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

// Approve an intro request: send the warm-introduction email to both parties,
// then (only if the email sent) move the request to `introduced`.
export async function approveIntroRequest(id: string): Promise<ActionResult> {
  await requireAdmin();

  const svc = createAdminClient();
  const { data: req, error: reqErr } = await svc
    .from('intro_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (reqErr) return { error: reqErr.message };
  if (!req || req.status !== 'pending') {
    return { error: 'Request not found or already handled.' };
  }

  const { data: speaker } = await svc
    .from('speakers')
    .select('name, designation, email')
    .eq('id', req.speaker_id)
    .maybeSingle();
  if (!speaker) return { error: 'Speaker not found.' };

  const speakerEmailed = Boolean(speaker.email);
  const res = await sendWarmIntro({
    requesterName: req.requester_name,
    requesterOrg: req.requester_org,
    requesterEmail: req.requester_email,
    reason: req.reason ?? '',
    speakerName: speaker.name,
    speakerDesignation: speaker.designation,
    speakerEmail: speaker.email ?? null,
  });
  if (!res.ok) {
    return { error: `Couldn’t send the introduction email: ${res.error}` };
  }

  const { error: updErr } = await svc
    .from('intro_requests')
    .update({ status: 'introduced' })
    .eq('id', id);
  if (updErr) return { error: updErr.message };

  revalidatePath('/admin/intro-requests');

  // Be honest about who was actually emailed: if the speaker has no address on
  // file, the intro went to the requester + the bureau admin to forward.
  if (speakerEmailed) {
    return {
      ok: true,
      success: `Introduction sent to ${req.requester_name} and ${speaker.name}.`,
    };
  }
  return {
    ok: true,
    success: `Introduction sent to ${req.requester_name}.`,
    warning: `${speaker.name} has no email on file — you were CC’d to forward it. Add their email under All Speakers so future intros reach them directly.`,
  };
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
