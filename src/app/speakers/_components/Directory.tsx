'use client';

import { useMemo, useState } from 'react';

import { SpeakerCard } from '@/app/speakers/_components/SpeakerCard';
import { DOMAIN_SPECIALITIES, INDUSTRY_SPECIALITIES } from '@/lib/constants';
import type { Speaker } from '@/lib/database.types';

const controlCls =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export function Directory({ speakers }: { speakers: Speaker[] }) {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState('');
  const [domain, setDomain] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return speakers.filter((s) => {
      if (needle && !s.name.toLowerCase().includes(needle)) return false;
      if (industry && s.industry_speciality !== industry) return false;
      if (domain && s.domain_speciality !== domain) return false;
      return true;
    });
  }, [speakers, query, industry, domain]);

  const hasFilters = query.trim() !== '' || industry !== '' || domain !== '';

  return (
    <div>
      {/* Search + filter controls */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          aria-label="Search speakers by name"
          className={controlCls}
        />
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          aria-label="Filter by industry speciality"
          className={controlCls}
        >
          <option value="">All industries</option>
          {INDUSTRY_SPECIALITIES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          aria-label="Filter by domain speciality"
          className={controlCls}
        >
          <option value="">All domains</option>
          {DOMAIN_SPECIALITIES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? 'speaker' : 'speakers'}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIndustry('');
              setDomain('');
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid — single column under 768px, then 2/3 columns */}
      {filtered.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          {speakers.length === 0
            ? 'No speakers in the directory yet — check back soon.'
            : 'No speakers match your search. Try clearing the filters.'}
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((speaker) => (
            <li key={speaker.id} className="h-full">
              <SpeakerCard speaker={speaker} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
