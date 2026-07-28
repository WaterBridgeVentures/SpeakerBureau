import type {
  AdminRole,
  DomainSpeciality,
  IndustrySpeciality,
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

export const ADMIN_ROLES: AdminRole[] = ['super_admin', 'approver'];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super admin',
  approver: 'Approver',
};
