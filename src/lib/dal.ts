import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { AdminRole } from '@/lib/database.types';

export interface AdminIdentity {
  id: string;
  email: string | null;
  role: AdminRole;
}

/**
 * Data Access Layer for admin auth. `getUser()` revalidates the JWT with
 * Supabase (authoritative), then we look up the caller's role in admin_users.
 * Memoized per-request with React `cache` so repeated calls in a render pass
 * (layout + page + leaf components) hit the network once.
 *
 * Returns null when the visitor is not signed in OR is signed in but is not an
 * admin (no admin_users row).
 */
export const getAdmin = cache(async (): Promise<AdminIdentity | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!adminRow) return null;

  return { id: user.id, email: user.email ?? null, role: adminRow.role };
});

/** Require any admin (super_admin or approver); redirect to login otherwise. */
export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

/** Require super_admin; bounce approvers to a page they can access. */
export async function requireSuperAdmin(): Promise<AdminIdentity> {
  const admin = await requireAdmin();
  if (admin.role !== 'super_admin') redirect('/admin/nominations');
  return admin;
}
