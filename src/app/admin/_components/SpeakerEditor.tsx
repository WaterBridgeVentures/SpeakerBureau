'use client';

import { useState, type FormEvent } from 'react';

import {
  setSpeakerStatus,
  toggleFeatured,
  togglePaused,
  updateSpeaker,
} from '@/app/admin/actions';
import { useActionRunner } from '@/app/admin/_components/useActionRunner';
import { SpeakerSummary } from '@/app/admin/_components/SpeakerSummary';
import { StatusBadge } from '@/app/admin/_components/StatusBadge';
import { VerifiedBadge } from '@/app/speakers/_components/Badges';
import { TagCheckboxes } from '@/app/_components/TagCheckboxes';
import {
  DOMAINS,
  INDUSTRIES,
  SPEAKING_FORMATS,
  SPEAKING_FORMAT_LABELS,
} from '@/lib/constants';
import type { SpeakerStatus, SpeakerWithTags } from '@/lib/database.types';

const SPEAKER_STATUSES: SpeakerStatus[] = [
  'pending',
  'approved',
  'rejected',
  'inactive',
];

const inputCls =
  'w-full rounded-md border border-wbv-slate/40 px-3 py-2 text-sm text-wbv-secondary placeholder-gray-400 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent';

export function SpeakerEditor({ speaker }: { speaker: SpeakerWithTags }) {
  const [editing, setEditing] = useState(false);
  const { pending, error, run } = useActionRunner();

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => updateSpeaker(speaker.id, fd), () => setEditing(false));
  }

  return (
    <li className="rounded-lg border border-wbv-slate/30 bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SpeakerSummary speaker={speaker} />
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {speaker.verified && <VerifiedBadge />}
            {speaker.paused && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Paused
              </span>
            )}
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
              className="rounded-md border border-wbv-slate/40 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent disabled:opacity-50"
            >
              {SPEAKER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pending}
              aria-pressed={speaker.featured}
              onClick={() =>
                run(() => toggleFeatured(speaker.id, !speaker.featured))
              }
              className={
                speaker.featured
                  ? 'rounded-md border border-wbv-primary bg-wbv-primary/20 px-3 py-1.5 text-sm font-medium text-wbv-black hover:brightness-95 disabled:opacity-50'
                  : 'rounded-md border border-wbv-slate/40 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-wbv-ivory disabled:opacity-50'
              }
            >
              {speaker.featured ? '★ Featured' : '☆ Feature'}
            </button>
            <button
              type="button"
              disabled={pending}
              aria-pressed={speaker.paused}
              onClick={() =>
                run(() => togglePaused(speaker.id, !speaker.paused))
              }
              className={
                speaker.paused
                  ? 'rounded-md border border-amber-300 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900 hover:brightness-95 disabled:opacity-50'
                  : 'rounded-md border border-wbv-slate/40 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-wbv-ivory disabled:opacity-50'
              }
            >
              {speaker.paused ? 'Unpause' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-md border border-wbv-slate/40 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-wbv-ivory"
            >
              {editing ? 'Close' : 'Edit'}
            </button>
          </div>
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
          <div className="sm:col-span-2">
            <TagCheckboxes
              legend="Industries"
              name="industries"
              otherName="industry_other_text"
              options={INDUSTRIES}
              defaultSelected={speaker.industries}
              defaultOtherText={speaker.industry_other_text ?? ''}
            />
          </div>
          <div className="sm:col-span-2">
            <TagCheckboxes
              legend="Domains"
              name="domains"
              otherName="domain_other_text"
              options={DOMAINS}
              defaultSelected={speaker.domains}
              defaultOtherText={speaker.domain_other_text ?? ''}
            />
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Location (city)</span>
            <input
              name="location"
              defaultValue={speaker.location ?? ''}
              placeholder="e.g. Bengaluru"
              className={inputCls}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-gray-600">Speaking format</span>
            <select
              name="in_person_or_virtual"
              defaultValue={speaker.in_person_or_virtual ?? ''}
              className={inputCls}
            >
              <option value="">— none —</option>
              {SPEAKING_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {SPEAKING_FORMAT_LABELS[f]}
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
              className="rounded-md bg-wbv-primary px-3 py-2 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
