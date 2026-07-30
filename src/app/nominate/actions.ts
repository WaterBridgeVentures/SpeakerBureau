'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  DOMAINS,
  INDUSTRIES,
  OTHERS,
  SPEAKING_FORMATS,
} from '@/lib/constants';
import type { SpeakingFormat } from '@/lib/database.types';

export type NominateState = { ok?: boolean; error?: string } | undefined;

// Keep only recognised values, de-duplicated, preserving submission order.
function cleanSelection(raw: FormDataEntryValue[], allowed: readonly string[]) {
  const set = new Set(allowed as readonly string[]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of raw) {
    const s = String(v);
    if (set.has(s) && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

export async function submitNomination(
  _prev: NominateState,
  formData: FormData
): Promise<NominateState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const designation = String(formData.get('designation') ?? '').trim();
  const linkedin_url = String(formData.get('linkedin_url') ?? '').trim();
  const photo_url = String(formData.get('photo_url') ?? '').trim() || null;
  const bio = String(formData.get('bio') ?? '').trim() || null;
  const location = String(formData.get('location') ?? '').trim() || null;
  const format = String(formData.get('in_person_or_virtual') ?? '');
  const consent = formData.get('consent') != null;

  const industries = cleanSelection(formData.getAll('industries'), INDUSTRIES);
  const domains = cleanSelection(formData.getAll('domains'), DOMAINS);
  const industryOther = industries.includes(OTHERS)
    ? String(formData.get('industry_other_text') ?? '').trim()
    : '';
  const domainOther = domains.includes(OTHERS)
    ? String(formData.get('domain_other_text') ?? '').trim()
    : '';

  if (!name || !email || !designation || !linkedin_url) {
    return { error: 'Name, email, designation, and LinkedIn URL are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' };
  }
  if (!/^https?:\/\//i.test(linkedin_url)) {
    return { error: 'Enter a full LinkedIn URL starting with http:// or https://' };
  }
  if (photo_url && !/^https?:\/\//i.test(photo_url)) {
    return { error: 'Photo URL must start with http:// or https://' };
  }
  if (industries.includes(OTHERS) && !industryOther) {
    return { error: 'Please specify your “Other” industry.' };
  }
  if (domains.includes(OTHERS) && !domainOther) {
    return { error: 'Please specify your “Other” domain.' };
  }
  if (!consent) {
    return { error: 'Please confirm the consent checkbox to submit.' };
  }

  // Mark verified when the submitter is signed in via LinkedIn (an account with
  // a linkedin_oidc identity — including linked accounts). Manual/anonymous
  // entries stay unverified.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const verified = providers.includes('linkedin_oidc');

  // Service role so we can insert the speaker + its join rows and read back the
  // new id. The action fully controls the values and hardcodes status=pending.
  const svc = createAdminClient();
  const { data: inserted, error } = await svc
    .from('speakers')
    .insert({
      name,
      email,
      designation,
      linkedin_url,
      photo_url,
      bio,
      location,
      in_person_or_virtual: (SPEAKING_FORMATS as string[]).includes(format)
        ? (format as SpeakingFormat)
        : null,
      industry_other_text: industryOther || null,
      domain_other_text: domainOther || null,
      verified,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return { error: error?.message ?? 'Could not submit your nomination.' };
  }

  const speakerId = inserted.id;
  const [indErr, domErr] = await Promise.all([
    industries.length
      ? svc
          .from('speaker_industries')
          .insert(industries.map((industry) => ({ speaker_id: speakerId, industry })))
          .then((r) => r.error)
      : Promise.resolve(null),
    domains.length
      ? svc
          .from('speaker_domains')
          .insert(domains.map((domain) => ({ speaker_id: speakerId, domain })))
          .then((r) => r.error)
      : Promise.resolve(null),
  ]);

  if (indErr || domErr) {
    // Roll back the orphaned speaker so the nomination can be retried cleanly.
    await svc.from('speakers').delete().eq('id', speakerId);
    return { error: 'Could not save your specialities — please try again.' };
  }

  return { ok: true };
}
