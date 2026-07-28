'use server';

import { createClient } from '@/lib/supabase/server';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type IntroRequestState = { ok?: boolean; error?: string } | undefined;

export async function submitIntroRequest(
  _prev: IntroRequestState,
  formData: FormData
): Promise<IntroRequestState> {
  const speaker_id = String(formData.get('speaker_id') ?? '');
  const requester_name = String(formData.get('requester_name') ?? '').trim();
  const requester_email = String(formData.get('requester_email') ?? '').trim();
  const requester_org =
    String(formData.get('requester_org') ?? '').trim() || null;
  const reason = String(formData.get('reason') ?? '').trim();

  if (!UUID_RE.test(speaker_id)) {
    return { error: 'Something went wrong — please reopen the form.' };
  }
  if (!requester_name || !requester_email || !reason) {
    return { error: 'Name, email, and a reason are required.' };
  }
  if (!EMAIL_RE.test(requester_email)) {
    return { error: 'Enter a valid email address.' };
  }

  const supabase = await createClient();

  // Only allow intro requests to speakers who are actually in the directory.
  const { data: speaker } = await supabase
    .from('speakers')
    .select('id')
    .eq('id', speaker_id)
    .eq('status', 'approved')
    .maybeSingle();
  if (!speaker) {
    return { error: 'This speaker isn’t available for introductions.' };
  }

  // No .select(): anyone may INSERT a pending intro request, but reading the
  // row back is not permitted for anon/authenticated (RLS).
  const { error } = await supabase.from('intro_requests').insert({
    speaker_id,
    requester_name,
    requester_email,
    requester_org,
    reason,
    status: 'pending',
  });
  if (error) return { error: error.message };

  return { ok: true };
}
