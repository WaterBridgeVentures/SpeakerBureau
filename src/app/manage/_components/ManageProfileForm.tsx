'use client';

import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  signOutManage,
  toggleOwnPaused,
  updateOwnProfile,
  type ManageProfileState,
} from '@/app/manage/actions';

type ManageSpeaker = {
  id: string;
  name: string;
  designation: string;
  photo_url: string | null;
  location: string | null;
  bio: string | null;
  paused: boolean;
};

const inputCls =
  'mt-1 w-full rounded-md border border-wbv-slate/40 px-3 py-2 text-sm text-wbv-secondary placeholder-gray-400 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent';
const labelCls = 'block text-sm font-medium text-gray-700';

export function ManageProfileForm({
  speaker,
  email,
}: {
  speaker: ManageSpeaker;
  email: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    ManageProfileState,
    FormData
  >(updateOwnProfile, undefined);

  const [pausePending, startPause] = useTransition();
  const [pauseMsg, setPauseMsg] = useState<string | null>(null);
  const [pauseErr, setPauseErr] = useState<string | null>(null);

  function onTogglePause() {
    setPauseMsg(null);
    setPauseErr(null);
    startPause(async () => {
      const res = await toggleOwnPaused(!speaker.paused);
      if (res?.error) setPauseErr(res.error);
      else {
        if (res?.success) setPauseMsg(res.success);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-wbv-secondary">
            Hi {speaker.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-600">{speaker.designation}</p>
          <p className="mt-0.5 text-xs text-gray-400">Signed in as {email}</p>
        </div>
        <form action={signOutManage}>
          <button
            type="submit"
            className="shrink-0 text-sm font-medium text-wbv-accent hover:brightness-90"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Pause / unpause */}
      <div
        className={
          speaker.paused
            ? 'rounded-xl border border-amber-300 bg-amber-50 p-4'
            : 'rounded-xl border border-wbv-slate/30 bg-white p-4'
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-wbv-secondary">
              {speaker.paused
                ? 'Your listing is paused'
                : 'Your listing is live'}
            </p>
            <p className="mt-0.5 text-xs text-gray-600">
              {speaker.paused
                ? 'You’re hidden from the public directory. Your profile isn’t deleted — unpause any time.'
                : 'You appear in the public directory and can receive introduction requests.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onTogglePause}
            disabled={pausePending}
            aria-pressed={speaker.paused}
            className={
              speaker.paused
                ? 'shrink-0 rounded-md bg-wbv-primary px-4 py-2 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50'
                : 'shrink-0 rounded-md border border-wbv-slate/40 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-wbv-ivory disabled:opacity-50'
            }
          >
            {pausePending
              ? 'Saving…'
              : speaker.paused
                ? 'Unpause my listing'
                : 'Pause my listing'}
          </button>
        </div>
        {pauseMsg && (
          <p className="mt-2 text-xs font-medium text-emerald-700">{pauseMsg}</p>
        )}
        {pauseErr && (
          <p className="mt-2 text-xs font-medium text-red-600">{pauseErr}</p>
        )}
        {!speaker.paused && (
          <Link
            href={`/speakers/${speaker.id}`}
            className="mt-2 inline-block text-xs font-medium text-wbv-accent hover:brightness-90"
          >
            View my public profile ↗
          </Link>
        )}
      </div>

      {/* Edit bio / photo / location */}
      <form
        action={formAction}
        className="space-y-4 rounded-xl border border-wbv-slate/30 bg-white p-4 sm:p-6"
      >
        <h2 className="text-sm font-semibold text-wbv-secondary">
          Edit your details
        </h2>

        <div>
          <label htmlFor="location" className={labelCls}>
            Location (city)
          </label>
          <input
            id="location"
            name="location"
            defaultValue={speaker.location ?? ''}
            placeholder="e.g. Bengaluru"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="photo_url" className={labelCls}>
            Photo URL
          </label>
          <input
            id="photo_url"
            name="photo_url"
            type="url"
            defaultValue={speaker.photo_url ?? ''}
            placeholder="https://…"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-gray-400">
            A direct link to a square headshot works best.
          </p>
        </div>

        <div>
          <label htmlFor="bio" className={labelCls}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={speaker.bio ?? ''}
            placeholder="A short bio for your directory profile."
            className={inputCls}
          />
        </div>

        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-md bg-wbv-primary px-4 py-2.5 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
