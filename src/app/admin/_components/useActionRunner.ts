'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { ActionResult } from '@/app/admin/actions';

/**
 * Runs an imperative Server Action, tracking pending state and surfacing any
 * returned error. On success it refreshes the route so revalidated data shows.
 */
export function useActionRunner() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run(fn: () => Promise<ActionResult>, onSuccess?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res?.error) {
        setError(res.error);
      } else {
        onSuccess?.();
        router.refresh();
      }
    });
  }

  return { pending, error, setError, run };
}
