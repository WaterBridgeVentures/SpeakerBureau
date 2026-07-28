'use client';

import { approveIntroRequest, setIntroRequestStatus } from '@/app/admin/actions';
import { useActionRunner } from '@/app/admin/_components/useActionRunner';

export function IntroRequestActions({ requestId }: { requestId: string }) {
  const { pending, error, run } = useActionRunner();

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => approveIntroRequest(requestId))}
          className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 sm:flex-none"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setIntroRequestStatus(requestId, 'declined'))}
          className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 sm:flex-none"
        >
          Decline
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
