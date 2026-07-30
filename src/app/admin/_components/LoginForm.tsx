'use client';

import { useActionState } from 'react';

import { login, type LoginState } from '@/app/admin/actions';

const initial: LoginState = undefined;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-md border border-wbv-slate/40 px-3 py-2 text-sm text-wbv-secondary placeholder-gray-400 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-md border border-wbv-slate/40 px-3 py-2 text-sm text-wbv-secondary placeholder-gray-400 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-md bg-wbv-primary px-3 py-2 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
