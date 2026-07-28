'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { AdminRole } from '@/lib/database.types';

type Tab = { href: string; label: string; superAdminOnly?: boolean };

const TABS: Tab[] = [
  { href: '/admin/nominations', label: 'Pending Nominations' },
  { href: '/admin/intro-requests', label: 'Pending Intro Requests' },
  { href: '/admin/supporters', label: 'Supporters', superAdminOnly: true },
  { href: '/admin/speakers', label: 'All Speakers', superAdminOnly: true },
  { href: '/admin/admins', label: 'Admin Users', superAdminOnly: true },
];

export function NavTabs({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const tabs = TABS.filter((t) => !t.superAdminOnly || role === 'super_admin');

  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Admin sections">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={[
              'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            ].join(' ')}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
