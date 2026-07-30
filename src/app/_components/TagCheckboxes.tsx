'use client';

import { useState } from 'react';

import { OTHERS } from '@/lib/constants';

/**
 * A multi-select checkbox group that submits every checked value under `name`
 * (read server-side with FormData.getAll(name)). When "Others" is checked, a
 * required free-text input appears, submitted under `otherName`.
 */
export function TagCheckboxes({
  legend,
  name,
  otherName,
  options,
  defaultSelected = [],
  defaultOtherText = '',
}: {
  legend: string;
  name: string;
  otherName: string;
  options: readonly string[];
  defaultSelected?: string[];
  defaultOtherText?: string;
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const othersChecked = selected.includes(OTHERS);

  const toggle = (v: string) =>
    setSelected((cur) =>
      cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    );

  return (
    <fieldset className="rounded-md border border-wbv-slate/30 p-3">
      <legend className="px-1 text-sm font-medium text-gray-700">{legend}</legend>
      <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              name={name}
              value={o}
              checked={selected.includes(o)}
              onChange={() => toggle(o)}
              className="mt-0.5 accent-wbv-primary"
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
      {othersChecked && (
        <input
          name={otherName}
          required
          defaultValue={defaultOtherText}
          placeholder="Please specify"
          aria-label={`Specify other ${legend.toLowerCase()}`}
          className="mt-2 w-full rounded-md border border-wbv-slate/40 px-3 py-2 text-sm text-wbv-secondary placeholder-gray-400 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent"
        />
      )}
    </fieldset>
  );
}
