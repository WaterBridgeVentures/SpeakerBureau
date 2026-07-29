'use server';

import { createClient } from '@/lib/supabase/server';
import {
  DOMAIN_SPECIALITIES,
  INDUSTRY_SPECIALITIES,
  SPEAKING_FORMATS,
} from '@/lib/constants';
import type {
  DomainSpeciality,
  IndustrySpeciality,
  SpeakingFormat,
} from '@/lib/database.types';

export type NominateState = { ok?: boolean; error?: string } | undefined;

export async function submitNomination(
  _prev: NominateState,
  formData: FormData
): Promise<NominateState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const designation = String(formData.get('designation') ?? '').trim();
  const linkedin_url = String(formData.get('linkedin_url') ?? '').trim();
  const photo_url = String(formData.get('photo_url') ?? '').trim() || null;
  const industry = String(formData.get('industry_speciality') ?? '');
  const domain = String(formData.get('domain_speciality') ?? '');
  const bio = String(formData.get('bio') ?? '').trim() || null;
  const location = String(formData.get('location') ?? '').trim() || null;
  const format = String(formData.get('in_person_or_virtual') ?? '');
  const consent = formData.get('consent') != null;

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
  if (!consent) {
    return { error: 'Please confirm the consent checkbox to submit.' };
  }

  const supabase = await createClient();

  // Mark verified when the submitter is signed in via LinkedIn (an account with
  // a linkedin_oidc identity — including linked accounts, where the primary
  // provider may read 'email'). Manual/anonymous entries stay unverified.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const verified = providers.includes('linkedin_oidc');

  // No .select() here: RLS lets anyone INSERT a pending speaker, but reading
  // back a pending row is not permitted for anon/authenticated.
  const { error } = await supabase.from('speakers').insert({
    name,
    email,
    designation,
    linkedin_url,
    photo_url,
    industry_speciality: (INDUSTRY_SPECIALITIES as string[]).includes(industry)
      ? (industry as IndustrySpeciality)
      : null,
    domain_speciality: (DOMAIN_SPECIALITIES as string[]).includes(domain)
      ? (domain as DomainSpeciality)
      : null,
    bio,
    location,
    in_person_or_virtual: (SPEAKING_FORMATS as string[]).includes(format)
      ? (format as SpeakingFormat)
      : null,
    verified,
    status: 'pending',
  });

  if (error) return { error: error.message };
  return { ok: true };
}
