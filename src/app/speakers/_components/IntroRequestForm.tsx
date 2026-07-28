'use client';

import { useActionState, useState } from 'react';

import {
  submitIntroRequest,
  type IntroRequestState,
} from '@/app/speakers/[id]/actions';

const inputCls =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-gray-700';

export function IntroRequestForm({
  speakerId,
  speakerName,
}: {
  speakerId: string;
  speakerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    IntroRequestState,
    FormData
  >(submitIntroRequest, undefined);

  if (state?.ok) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-center">
        <p className="text-sm font-semibold text-emerald-900">
          Request sent!
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          We’ll review your request and be in touch if {speakerName} is happy to
          connect.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Request an Introduction
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 text-left">
      <input type="hidden" name="speaker_id" value={speakerId} />

      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          Request an introduction to {speakerName}
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          The bureau reviews every request before making a warm introduction.
        </p>
      </div>

      <div>
        <label htmlFor="requester_name" className={labelCls}>
          Your name <span className="text-red-500">*</span>
        </label>
        <input
          id="requester_name"
          name="requester_name"
          required
          className={inputCls}
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="requester_email" className={labelCls}>
          Your email <span className="text-red-500">*</span>
        </label>
        <input
          id="requester_email"
          name="requester_email"
          type="email"
          required
          className={inputCls}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="requester_org" className={labelCls}>
          Organisation <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="requester_org"
          name="requester_org"
          className={inputCls}
          placeholder="Where you work"
        />
      </div>

      <div>
        <label htmlFor="reason" className={labelCls}>
          Why would you like to connect?{' '}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={4}
          required
          className={inputCls}
          placeholder="A sentence or two of context for the introduction."
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send request'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
