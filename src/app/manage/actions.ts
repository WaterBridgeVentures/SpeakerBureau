'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendManageLink } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

export type ManageLinkState =
  | { ok?: boolean; error?: string; sent?: boolean }
  | undefined;

export type ManageProfileState =
  | { ok?: boolean; error?: string; success?: string }
  | undefined;

// Escape PostgREST ilike wildcards so an email's `_`/`%` can't over-match. We
// use ilike (not eq) because speaker emails are stored as entered while Supabase
// auth lowercases them — the two must still match case-insensitively.
function ilikeLiteral(s: string): string {
  return s.replace(/([\\%_])/g, '\\$1');
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.');
  const proto = h.get('x-forwarded-proto') ?? (isLocal ? 'http' : 'https');
  return `${proto}://${host}`;
}

/**
 * Email a listed speaker a passwordless sign-in link so they can manage their
 * own profile. Always returns the same "sent" state regardless of whether the
 * email is on file, to avoid revealing who is (or isn't) a listed speaker.
 */
export async function requestManageLink(
  _prev: ManageLinkState,
  formData: FormData
): Promise<ManageLinkState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };

  const generic: ManageLinkState = { ok: true, sent: true };

  const svc = createAdminClient();
  const { data: rows } = await svc
    .from('speakers')
    .select('name')
    .ilike('email', ilikeLiteral(email))
    .eq('status', 'approved')
    .limit(1);
  const speaker = rows?.[0];
  if (!speaker) return generic; // unknown email → say nothing, send nothing

  // A magic link needs an auth user; create one if this speaker has never
  // signed in. Ignored if the user already exists.
  await svc.auth.admin
    .createUser({ email, email_confirm: true })
    .catch(() => {});

  const { data: link, error } = await svc.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  const hashed = link?.properties?.hashed_token;
  if (error || !hashed) {
    console.error('generateLink failed for manage link:', error?.message);
    return generic;
  }

  const origin = await getOrigin();
  const url = `${origin}/auth/callback?token_hash=${hashed}&type=magiclink&next=/manage`;

  const res = await sendManageLink({ email, name: speaker.name, url });
  if (!res.ok) console.error('Manage link email failed:', res.error);

  return generic;
}

/** Resolve the signed-in user's own approved speaker row (service role). */
async function getOwnSpeakerId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const svc = createAdminClient();
  const { data: rows } = await svc
    .from('speakers')
    .select('id')
    .ilike('email', ilikeLiteral(user.email))
    .eq('status', 'approved')
    .limit(1);
  return rows?.[0]?.id ?? null;
}

/** A speaker edits their own bio / photo / location. */
export async function updateOwnProfile(
  _prev: ManageProfileState,
  formData: FormData
): Promise<ManageProfileState> {
  const id = await getOwnSpeakerId();
  if (!id) {
    return { error: 'Your session has expired — request a new sign-in link.' };
  }

  const bio = String(formData.get('bio') ?? '').trim() || null;
  const location = String(formData.get('location') ?? '').trim() || null;
  const photo_url = String(formData.get('photo_url') ?? '').trim() || null;
  if (photo_url && !URL_RE.test(photo_url)) {
    return {
      error: 'Photo URL must start with http:// or https://, or be left blank.',
    };
  }

  // Service role, but scoped to this speaker's own id (resolved from their
  // authenticated email) and only the fields a speaker may self-edit.
  const svc = createAdminClient();
  const { error } = await svc
    .from('speakers')
    .update({ bio, location, photo_url })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/manage');
  revalidatePath('/speakers');
  revalidatePath(`/speakers/${id}`);
  return { ok: true, success: 'Your profile has been updated.' };
}

/** A speaker pauses/unpauses their own public listing. */
export async function toggleOwnPaused(
  paused: boolean
): Promise<ManageProfileState> {
  const id = await getOwnSpeakerId();
  if (!id) {
    return { error: 'Your session has expired — request a new sign-in link.' };
  }

  const svc = createAdminClient();
  const { error } = await svc
    .from('speakers')
    .update({ paused })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/manage');
  revalidatePath('/speakers');
  revalidatePath(`/speakers/${id}`);
  return {
    ok: true,
    success: paused
      ? 'Your listing is now paused and hidden from the directory.'
      : 'Your listing is live in the directory again.',
  };
}

export async function signOutManage(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/manage');
}
