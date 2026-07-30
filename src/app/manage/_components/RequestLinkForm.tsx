'use client';

import { useActionState } from 'react';

import { requestManageLink, type ManageLinkState } from '@/app/manage/actions';

export function RequestLinkForm() {
  const [state, formAction, pending] = useActionState<ManageLinkState, FormData>(
    requestManageLink,
    undefined
  );

  if (state?.sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-8">
        <h1 className="text-xl font-semibold text-emerald-900">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm text-emerald-800">
          If that email belongs to a listed speaker, we’ve sent a secure
          sign-in link. It expires shortly — open it on this device to manage
          your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-wbv-slate/30 bg-white p-6 sm:p-8">
      <h1 className="text-xl font-semibold text-wbv-secondary">
        Manage your profile
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Are you a listed speaker? Enter the email on your profile and we’ll send
        a secure sign-in link — no password needed. You can update your bio,
        photo, and location, or pause your listing.
      </p>

      <form action={formAction} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Your email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="mt-1 w-full rounded-md border border-wbv-slate/40 px-3 py-2 text-sm text-wbv-secondary placeholder-gray-400 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent"
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
          className="inline-flex w-full items-center justify-center rounded-md bg-wbv-primary px-4 py-2.5 text-sm font-medium text-wbv-black hover:brightness-95 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send sign-in link'}
        </button>
      </form>
    </div>
  );
}
