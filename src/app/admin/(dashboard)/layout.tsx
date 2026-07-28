import type { Metadata } from 'next';

import { requireAdmin } from '@/lib/dal';
import { ADMIN_ROLE_LABELS } from '@/lib/constants';
import { NavTabs } from '@/app/admin/_components/NavTabs';
import { SignOutButton } from '@/app/admin/_components/SignOutButton';

export const metadata: Metadata = {
  title: 'Admin — Women’s Speaker Bureau',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole dashboard. Each page also re-checks via the DAL, so this is
  // defense-in-depth rather than the only guard.
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              Women’s Speaker Bureau — Admin
            </h1>
            <p className="text-xs text-gray-500">
              {admin.email}
              <span className="mx-1.5 text-gray-300">•</span>
              <span className="font-medium text-gray-700">
                {ADMIN_ROLE_LABELS[admin.role]}
              </span>
            </p>
          </div>
          <SignOutButton />
        </div>
        <div className="mx-auto max-w-5xl px-4">
          <NavTabs role={admin.role} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
