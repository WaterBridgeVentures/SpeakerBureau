import type { AdminRole, SpeakingFormat } from '@/lib/database.types';

// The literal label used for a free-text "other" speciality. When a speaker
// selects this, they also provide industry_other_text / domain_other_text.
export const OTHERS = 'Others';

// Multi-select speciality vocabularies. Kept in sync with the CHECK constraints
// in supabase/migrations/0006_multi_speciality.sql. A speaker may hold any
// number of each (see the speaker_industries / speaker_domains join tables).
export const INDUSTRIES = [
  'AI, Software and Technology',
  'Fintech, Banking and Financial Services',
  'Healthcare',
  'Consumer/Retail',
  'Media & Entertainment',
  'Education',
  'Hardware and Manufacturing',
  'Real Estate',
  'Climate Tech',
  'DeepTech',
  'Agritech and Rural Economy',
  'Logistics & Supply Chain',
  'Legal / RegTech',
  'Public Sector/Policy',
  'Non-profit/Social Impact',
  OTHERS,
] as const;
export type Industry = (typeof INDUSTRIES)[number];

/**
 * Display labels for a speaker's tags: the canonical "Others" is replaced by the
 * speaker's free-text label when present. Use for cards / profiles — NOT for
 * filtering, which always matches on the canonical "Others". Pure + client-safe.
 */
export function resolveTagLabels(
  labels: string[],
  otherText: string | null
): string[] {
  return labels.map((l) =>
    l === OTHERS && otherText?.trim() ? otherText.trim() : l
  );
}

export const DOMAINS = [
  'Sales and GTM',
  'Marketing',
  'Finance',
  'Technology and Engineering',
  'Product',
  'Operations',
  'People and Talent',
  'Strategy',
  'Legal/Compliance',
  'Data/Analytics',
  'Board Governance / Investor Relations',
  'ESG/Impact',
  OTHERS,
] as const;
export type Domain = (typeof DOMAINS)[number];

export const SPEAKING_FORMATS: SpeakingFormat[] = [
  'in_person',
  'virtual',
  'both',
];

export const SPEAKING_FORMAT_LABELS: Record<SpeakingFormat, string> = {
  in_person: 'In person',
  virtual: 'Virtual',
  both: 'In person or virtual',
};

// Speaker columns readable by anon/authenticated (everything except the private
// `email`). Use this instead of '*' anywhere a non-service-role client reads
// speakers, since selecting `email` there is denied by column grants.
export const SPEAKER_COLUMNS =
  'id, name, designation, linkedin_url, photo_url, bio, status, created_at, verified, location, in_person_or_virtual, featured, paused, industry_other_text, domain_other_text';

export const ADMIN_ROLES: AdminRole[] = ['super_admin', 'approver'];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super admin',
  approver: 'Approver',
};
