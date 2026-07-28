'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { ActionResult } from '@/app/admin/actions';
import { useToast } from '@/app/admin/_components/Toast';

/**
 * Runs an imperative Server Action, tracking pending state and surfacing the
 * result. A hard `error` shows inline (the row stays put). A `warning` (the
 * action succeeded but a side effect like email failed, so the row is about to
 * disappear on refresh) is shown via a toast that survives the refresh.
 */
export function useActionRunner() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { notify } = useToast();

  function run(fn: () => Promise<ActionResult>, onSuccess?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res?.error) {
        setError(res.error);
      } else {
        if (res?.warning) notify(res.warning, 'warning');
        if (res?.success) notify(res.success, 'success');
        onSuccess?.();
        router.refresh();
      }
    });
  }

  return { pending, error, setError, run };
}
