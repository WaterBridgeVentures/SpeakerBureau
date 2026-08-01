import type { Metadata } from 'next';
import Link from 'next/link';

import { requireAdmin } from '@/lib/dal';
import { ADMIN_ROLE_LABELS } from '@/lib/constants';
import { NavTabs } from '@/app/admin/_components/NavTabs';
import { SignOutButton } from '@/app/admin/_components/SignOutButton';
import { ToastProvider } from '@/app/admin/_components/Toast';

export const metadata: Metadata = {
  title: 'Admin — Women’s Speaker Collective',
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
    <div className="min-h-screen bg-wbv-ivory text-wbv-black">
      <header className="bg-wbv-secondary">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              aria-label="Women’s Speaker Collective — admin home"
            >
              <img
                src="/bureau-mark-dark.png"
                alt="Women’s Speaker Collective"
                className="h-9 w-auto"
              />
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-white">
                Women’s Speaker Collective — Admin
              </h1>
              <p className="text-xs text-white/60">
                {admin.email}
                <span className="mx-1.5 text-white/30">•</span>
                <span className="font-medium text-white/80">
                  {ADMIN_ROLE_LABELS[admin.role]}
                </span>
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
        <div className="mx-auto max-w-5xl border-t border-white/10 px-4">
          <NavTabs role={admin.role} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
