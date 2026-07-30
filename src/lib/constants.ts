import type {
  AdminRole,
  DomainSpeciality,
  IndustrySpeciality,
  SpeakingFormat,
} from '@/lib/database.types';

// Dropdown values — kept in sync with the enum types in the DB migrations.
export const INDUSTRY_SPECIALITIES: IndustrySpeciality[] = [
  'Technology',
  'Financial Services',
  'Healthcare',
  'Consumer/Retail',
  'Media & Entertainment',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Public Sector/Policy',
  'Non-profit/Social Impact',
  'Other',
];

export const DOMAIN_SPECIALITIES: DomainSpeciality[] = [
  'Sales',
  'Marketing',
  'Finance',
  'GTM',
  'Product',
  'Operations',
  'HR',
  'Strategy',
  'Fundraising',
  'Other',
];

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
  'id, name, designation, linkedin_url, photo_url, industry_speciality, domain_speciality, bio, status, created_at, verified, location, in_person_or_virtual, featured, paused';

export const ADMIN_ROLES: AdminRole[] = ['super_admin', 'approver'];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super admin',
  approver: 'Approver',
};
