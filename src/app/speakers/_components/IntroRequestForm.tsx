'use client';

import { useActionState, useState } from 'react';

import {
  submitIntroRequest,
  type IntroRequestState,
} from '@/app/speakers/[id]/actions';

const inputCls =
  'mt-1 w-full rounded-md border border-wbv-slate/40 px-3 py-2 text-sm text-wbv-secondary placeholder-gray-400 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent';
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
          Request received — pending review
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          Thanks! Your request is now with the bureau for review. If{' '}
          {speakerName} is happy to connect, we’ll send a warm introduction to
          your email. A confirmation is on its way to your inbox — no further
          action needed.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md bg-wbv-primary px-4 py-2.5 text-sm font-medium text-white hover:brightness-95"
      >
        Request an Introduction
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 text-left">
      <input type="hidden" name="speaker_id" value={speakerId} />

      <div>
        <h2 className="text-sm font-semibold text-wbv-secondary">
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

      <fieldset className="space-y-4 rounded-md border border-wbv-slate/30 bg-wbv-ivory/60 p-3">
        <legend className="px-1 text-xs font-medium text-gray-500">
          Event details <span className="text-gray-400">(optional)</span>
        </legend>

        <div>
          <label htmlFor="event_name" className={labelCls}>
            Event name
          </label>
          <input
            id="event_name"
            name="event_name"
            className={inputCls}
            placeholder="e.g. FinTech India Summit"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event_month" className={labelCls}>
              Event month
            </label>
            <input
              id="event_month"
              name="event_month"
              type="month"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="audience_size" className={labelCls}>
              Audience size
            </label>
            <input
              id="audience_size"
              name="audience_size"
              inputMode="numeric"
              className={inputCls}
              placeholder="e.g. 150"
            />
          </div>
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 accent-wbv-primary"
        />
        <span>
          I consent to the Women’s Speaker Bureau storing and using the
          information I’ve submitted to review and facilitate this introduction
          request.
        </span>
      </label>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-md bg-wbv-primary px-4 py-2.5 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send request'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-wbv-slate/40 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-wbv-ivory"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
