'use client';

import { useState, type FormEvent } from 'react';

import { setSpeakerStatus, updateSpeaker } from '@/app/admin/actions';
import { useActionRunner } from '@/app/admin/_components/useActionRunner';
import { SpeakerSummary } from '@/app/admin/_components/SpeakerSummary';
import { StatusBadge } from '@/app/admin/_components/StatusBadge';
import { DOMAIN_SPECIALITIES, INDUSTRY_SPECIALITIES } from '@/lib/constants';
import type { Speaker, SpeakerStatus } from '@/lib/database.types';

const SPEAKER_STATUSES: SpeakerStatus[] = [
  'pending',
  'approved',
  'rejected',
  'inactive',
];

const inputCls =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export function SpeakerEditor({ speaker }: { speaker: Speaker }) {
  const [editing, setEditing] = useState(false);
  const { pending, error, run } = useActionRunner();

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => updateSpeaker(speaker.id, fd), () => setEditing(false));
  }

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SpeakerSummary speaker={speaker} />
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <StatusBadge status={speaker.status} />
            <select
              aria-label="Change status"
              value={speaker.status}
              disabled={pending}
              onChange={(e) =>
                run(() =>
                  setSpeakerStatus(speaker.id, e.target.value as SpeakerStatus)
                )
              }
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              {SPEAKER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {editing ? 'Close' : 'Edit'}
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>

      {editing && (
        <form onSubmit={onSave} className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Name</span>
            <input name="name" defaultValue={speaker.name} className={inputCls} required />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Designation</span>
            <input name="designation" defaultValue={speaker.designation} className={inputCls} required />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-gray-600">LinkedIn URL</span>
            <input name="linkedin_url" defaultValue={speaker.linkedin_url} className={inputCls} required />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-gray-600">
              Email{' '}
              <span className="text-gray-400">
                (private — used for intro/approval emails, never shown publicly)
              </span>
            </span>
            <input
              name="email"
              type="email"
              defaultValue={speaker.email ?? ''}
              placeholder="speaker@example.com"
              className={inputCls}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Industry speciality</span>
            <select
              name="industry_speciality"
              defaultValue={speaker.industry_speciality ?? ''}
              className={inputCls}
            >
              <option value="">— none —</option>
              {INDUSTRY_SPECIALITIES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Domain speciality</span>
            <select
              name="domain_speciality"
              defaultValue={speaker.domain_speciality ?? ''}
              className={inputCls}
            >
              <option value="">— none —</option>
              {DOMAIN_SPECIALITIES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-gray-600">Bio</span>
            <textarea name="bio" defaultValue={speaker.bio ?? ''} rows={3} className={inputCls} />
          </label>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
