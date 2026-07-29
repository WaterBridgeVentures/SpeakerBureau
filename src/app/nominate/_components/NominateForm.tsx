'use client';

import { useActionState } from 'react';

import { submitNomination, type NominateState } from '@/app/nominate/actions';
import { LinkedInButton } from '@/app/nominate/_components/LinkedInButton';
import { DOMAIN_SPECIALITIES, INDUSTRY_SPECIALITIES } from '@/lib/constants';

export type Prefill = {
  name: string;
  email: string;
  photo_url: string;
  headline: string;
};

const inputCls =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-gray-700';

export function NominateForm({
  prefill,
  linkedInError,
}: {
  prefill: Prefill | null;
  linkedInError: boolean;
}) {
  const [state, formAction, pending] = useActionState<NominateState, FormData>(
    submitNomination,
    undefined
  );

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h2 className="text-base font-semibold text-emerald-900">
          Thank you — you’re in the queue!
        </h2>
        <p className="mt-2 text-sm text-emerald-800">
          Your nomination has been submitted and is pending review. You’ll hear
          from us once it’s approved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {prefill ? (
        <div className="flex items-center gap-3 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          {prefill.photo_url && (
            <img
              src={prefill.photo_url}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <span>
            Prefilled from LinkedIn
            {prefill.name ? ` for ${prefill.name}` : ''}. Review and complete the
            rest below.
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <LinkedInButton />
          {linkedInError && (
            <p className="text-xs text-red-600">
              LinkedIn sign-in didn’t complete. You can fill the form in
              manually below.
            </p>
          )}
          <p className="text-center text-xs text-gray-400">
            or fill in the form manually
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelCls}>
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            defaultValue={prefill?.name ?? ''}
            required
            className={inputCls}
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={prefill?.email ?? ''}
            required
            className={inputCls}
            placeholder="you@example.com"
          />
          <p className="mt-1 text-xs text-gray-400">
            Kept private — used only to reach you about your nomination and any
            introduction requests. Never shown publicly.
          </p>
        </div>

        <div>
          <label htmlFor="designation" className={labelCls}>
            Designation (role + organisation){' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="designation"
            name="designation"
            defaultValue={prefill?.headline ?? ''}
            required
            className={inputCls}
            placeholder="VP Engineering, Acme Corp"
          />
        </div>

        <div>
          <label htmlFor="linkedin_url" className={labelCls}>
            LinkedIn profile URL <span className="text-red-500">*</span>
          </label>
          <input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            required
            className={inputCls}
            placeholder="https://www.linkedin.com/in/your-handle"
          />
          {prefill && (
            <p className="mt-1 text-xs text-gray-400">
              LinkedIn’s sign-in doesn’t share your profile URL, so please paste
              it here (e.g. linkedin.com/in/your-name).
            </p>
          )}
        </div>

        <div>
          <label htmlFor="photo_url" className={labelCls}>
            Photo URL <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="photo_url"
            name="photo_url"
            type="url"
            defaultValue={prefill?.photo_url ?? ''}
            className={inputCls}
            placeholder="https://…/your-photo.jpg"
          />
          <p className="mt-1 text-xs text-gray-400">
            Autofilled from LinkedIn if you signed in. Otherwise paste a link to
            a photo.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="industry_speciality" className={labelCls}>
              Industry speciality
            </label>
            <select
              id="industry_speciality"
              name="industry_speciality"
              defaultValue=""
              className={inputCls}
            >
              <option value="">— select —</option>
              {INDUSTRY_SPECIALITIES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="domain_speciality" className={labelCls}>
              Domain speciality
            </label>
            <select
              id="domain_speciality"
              name="domain_speciality"
              defaultValue=""
              className={inputCls}
            >
              <option value="">— select —</option>
              {DOMAIN_SPECIALITIES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bio" className={labelCls}>
            Short bio <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            className={inputCls}
            placeholder="A sentence or two about what you speak on."
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
          className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? 'Submitting…' : 'Submit nomination'}
        </button>
      </form>
    </div>
  );
}
