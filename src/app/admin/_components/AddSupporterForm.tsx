'use client';

import { useActionState, useEffect, useRef } from 'react';

import { createSupporter, type ActionResult } from '@/app/admin/actions';

const inputCls =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

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
      className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900">Add a supporter</h3>
      </div>
      <input name="org_name" placeholder="Organisation name" className={inputCls} required />
      <input name="logo_url" placeholder="Logo URL" className={inputCls} required />
      <input name="link_url" placeholder="Website URL (optional)" className={inputCls} />
      <input
        name="display_order"
        type="number"
        placeholder="Display order"
        defaultValue={0}
        className={inputCls}
      />
      {state.error && (
        <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? 'Adding…' : 'Add supporter'}
        </button>
      </div>
    </form>
  );
}
