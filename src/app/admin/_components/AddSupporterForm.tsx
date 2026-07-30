'use client';

import { useActionState, useEffect, useRef } from 'react';

import { createSupporter, type ActionResult } from '@/app/admin/actions';

const inputCls =
  'w-full rounded-md border border-wbv-slate/40 px-3 py-2 text-sm text-wbv-secondary placeholder-gray-400 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent';

export function AddSupporterForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createSupporter,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 rounded-lg border border-wbv-slate/30 bg-white p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h3 className="text-sm font-semibold text-wbv-secondary">Add a supporter</h3>
      </div>
      <input name="org_name" placeholder="Organisation name" className={inputCls} required />
      <input name="logo_url" placeholder="Logo URL" className={inputCls} required />
      <input
        name="link_url"
        placeholder="Website URL (optional)"
        className={`${inputCls} sm:col-span-2`}
      />
      {state.error && (
        <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-wbv-primary px-3 py-2 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
        >
          {pending ? 'Adding…' : 'Add supporter'}
        </button>
      </div>
    </form>
  );
}
