'use client';

import { useState, type FormEvent } from 'react';

import { deleteSupporter, updateSupporter } from '@/app/admin/actions';
import { useActionRunner } from '@/app/admin/_components/useActionRunner';
import type { Supporter } from '@/lib/database.types';

const inputCls =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export function SupporterRow({ supporter }: { supporter: Supporter }) {
  const [editing, setEditing] = useState(false);
  const { pending, error, run } = useActionRunner();

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => updateSupporter(supporter.id, fd), () => setEditing(false));
  }

  if (editing) {
    return (
      <li className="rounded-lg border border-gray-200 bg-white p-4">
        <form onSubmit={onSave} className="grid gap-3 sm:grid-cols-2">
          <input name="org_name" defaultValue={supporter.org_name} className={inputCls} required />
          <input name="logo_url" defaultValue={supporter.logo_url} className={inputCls} required />
          <input
            name="link_url"
            defaultValue={supporter.link_url ?? ''}
            placeholder="Website URL (optional)"
            className={`${inputCls} sm:col-span-2`}
          />
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <img
          src={supporter.logo_url}
          alt=""
          className="h-10 w-10 rounded object-contain"
        />
        <div>
          <p className="font-medium text-gray-900">{supporter.org_name}</p>
          <p className="text-xs text-gray-500">
            {supporter.link_url && (
              <a
                href={supporter.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
              >
                website ↗
              </a>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {error && <span className="text-xs text-red-600">{error}</span>}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm(`Remove ${supporter.org_name}?`)) {
              run(() => deleteSupporter(supporter.id));
            }
          }}
          className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
