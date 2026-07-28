'use client';

import { approveSpeaker, setSpeakerStatus } from '@/app/admin/actions';
import { useActionRunner } from '@/app/admin/_components/useActionRunner';

export function NominationActions({ speakerId }: { speakerId: string }) {
  const { pending, error, run } = useActionRunner();

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => approveSpeaker(speakerId))}
          className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 sm:flex-none"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setSpeakerStatus(speakerId, 'rejected'))}
          className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 sm:flex-none"
        >
          Reject
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
