'use client';

import { useActionState, useEffect, useRef } from 'react';

import { addAdmin, type ActionResult } from '@/app/admin/actions';
import { ADMIN_ROLES, ADMIN_ROLE_LABELS } from '@/lib/constants';

const inputCls =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export function AddAdminForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    addAdmin,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto]"
    >
      <div className="sm:col-span-3">
        <h3 className="text-sm font-semibold text-gray-900">Add an admin</h3>
        <p className="text-xs text-gray-500">
          The person must already have signed up via Supabase Auth.
        </p>
      </div>
      <input
        name="email"
        type="email"
        placeholder="admin@example.com"
        className={inputCls}
        required
      />
      <select name="role" defaultValue="approver" className={inputCls}>
        {ADMIN_ROLES.map((r) => (
          <option key={r} value={r}>
            {ADMIN_ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? 'Adding…' : 'Add'}
      </button>
      {state.error && (
        <p className="text-sm text-red-600 sm:col-span-3">{state.error}</p>
      )}
    </form>
  );
}
