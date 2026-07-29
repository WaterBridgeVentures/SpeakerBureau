import { requireSuperAdmin } from '@/lib/dal';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddAdminForm } from '@/app/admin/_components/AddAdminForm';
import { AdminUserRow } from '@/app/admin/_components/AdminUserRow';

export default async function AdminUsersPage() {
  const me = await requireSuperAdmin();

  // Read the admin_users rows through the RLS-scoped session client (a
  // super_admin may read them all).
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from('admin_users')
    .select('user_id, role, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    return <p className="text-sm text-red-600">Failed to load: {error.message}</p>;
  }

  // Service role only for resolving emails from auth.users (not exposed to the
  // anon/authenticated roles). Gated above on super_admin.
  const admin = createAdminClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const emailById = new Map(
    (list?.users ?? []).map((u) => [u.id, u.email ?? '(unknown)'])
  );

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-wbv-secondary">Admin Users</h2>

      <AddAdminForm />

      <ul className="space-y-3">
        {(rows ?? []).map((row) => (
          <AdminUserRow
            key={row.user_id}
            userId={row.user_id}
            email={emailById.get(row.user_id) ?? '(unknown)'}
            role={row.role}
            isSelf={row.user_id === me.id}
          />
        ))}
      </ul>
    </section>
  );
}
