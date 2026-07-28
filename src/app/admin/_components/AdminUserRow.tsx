'use client';

import { removeAdmin, updateAdminRole } from '@/app/admin/actions';
import { useActionRunner } from '@/app/admin/_components/useActionRunner';
import { ADMIN_ROLES, ADMIN_ROLE_LABELS } from '@/lib/constants';
import type { AdminRole } from '@/lib/database.types';

export function AdminUserRow({
  userId,
  email,
  role,
  isSelf,
}: {
  userId: string;
  email: string;
  role: AdminRole;
  isSelf: boolean;
}) {
  const { pending, error, run } = useActionRunner();

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900">
          {email}
          {isSelf && <span className="ml-2 text-xs text-gray-400">(you)</span>}
        </p>
        <p className="text-xs text-gray-500">{ADMIN_ROLE_LABELS[role]}</p>
      </div>

      <div className="flex items-center gap-2">
        {error && <span className="text-xs text-red-600">{error}</span>}
        <select
          aria-label="Change role"
          value={role}
          disabled={pending || isSelf}
          onChange={(e) =>
            run(() => updateAdminRole(userId, e.target.value as AdminRole))
          }
          className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        >
          {ADMIN_ROLES.map((r) => (
            <option key={r} value={r}>
              {ADMIN_ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending || isSelf}
          title={isSelf ? 'You cannot remove yourself' : undefined}
          onClick={() => {
            if (window.confirm(`Remove admin access for ${email}?`)) {
              run(() => removeAdmin(userId));
            }
          }}
          className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
