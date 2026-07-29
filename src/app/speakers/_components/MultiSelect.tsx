'use client';

import { useEffect, useRef, useState } from 'react';

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  // Close on click/tap outside or Escape. (Native <details> only closes via its
  // own summary; selections live in the parent, so they persist across close.)
  useEffect(() => {
    if (!open) return;
    const close = () => {
      if (ref.current) ref.current.open = false;
    };
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        ref.current?.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = (v: string) =>
    onChange(
      selected.includes(v)
        ? selected.filter((x) => x !== v)
        : [...selected, v]
    );

  return (
    <details
      ref={ref}
      className="relative"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border border-wbv-slate/40 bg-white px-3 py-2 text-sm text-wbv-secondary [&::-webkit-details-marker]:hidden">
        <span className="truncate">
          {label}
          {selected.length > 0 && (
            <span className="ml-1 text-wbv-accent">({selected.length})</span>
          )}
        </span>
        <svg viewBox="0 0 20 20" aria-hidden="true" className="ml-2 h-4 w-4 shrink-0 fill-gray-400">
          <path d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z" />
        </svg>
      </summary>
      <div className="absolute z-20 mt-1 max-h-64 w-full min-w-[12rem] overflow-auto rounded-md border border-wbv-slate/40 bg-white p-1.5 shadow-lg">
        {options.map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-wbv-ivory"
          >
            <input
              type="checkbox"
              checked={selected.includes(o)}
              onChange={() => toggle(o)}
              className="accent-wbv-primary"
            />
            {o}
          </label>
        ))}
      </div>
    </details>
  );
}
