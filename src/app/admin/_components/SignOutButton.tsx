'use client';

import { useTransition } from 'react';

import { logout } from '@/app/admin/actions';

export function SignOutButton() {
  const [pending, start] = useTransition();

  return (
    <form action={() => start(() => logout())}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    </form>
  );
}
