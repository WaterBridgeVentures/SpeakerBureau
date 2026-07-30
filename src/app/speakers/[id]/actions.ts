'use server';

import { createClient } from '@/lib/supabase/server';
import { sendIntroRequestReceived } from '@/lib/email';

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
  const event_name = String(formData.get('event_name') ?? '').trim() || null;
  const event_month = String(formData.get('event_month') ?? '').trim() || null;
  const audience_size =
    String(formData.get('audience_size') ?? '').trim() || null;
  const consent = formData.get('consent') != null;

  if (!UUID_RE.test(speaker_id)) {
    return { error: 'Something went wrong — please reopen the form.' };
  }
  if (!requester_name || !requester_email || !reason) {
    return { error: 'Name, email, and a reason are required.' };
  }
  if (!EMAIL_RE.test(requester_email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (!consent) {
    return { error: 'Please confirm the consent checkbox to submit.' };
  }

  const supabase = await createClient();

  // Only allow intro requests to speakers who are actually in the directory.
  const { data: speaker } = await supabase
    .from('speakers')
    .select('id, name')
    .eq('id', speaker_id)
    .eq('status', 'approved')
    .eq('paused', false)
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
    event_name,
    event_month,
    audience_size,
    status: 'pending',
  });
  if (error) return { error: error.message };

  // Best-effort acknowledgement so the requester knows it's pending review.
  // A delivery failure must not fail the (already-recorded) request.
  const ack = await sendIntroRequestReceived({
    requesterEmail: requester_email,
    requesterName: requester_name,
    speakerName: speaker.name,
  });
  if (!ack.ok) {
    console.error('Intro request saved but ack email failed:', ack.error);
  }

  return { ok: true };
}
