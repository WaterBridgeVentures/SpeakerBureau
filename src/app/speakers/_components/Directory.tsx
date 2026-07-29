'use client';

import { useMemo, useState } from 'react';

import { SpeakerCard } from '@/app/speakers/_components/SpeakerCard';
import { MultiSelect } from '@/app/speakers/_components/MultiSelect';
import {
  DOMAIN_SPECIALITIES,
  INDUSTRY_SPECIALITIES,
  SPEAKING_FORMATS,
  SPEAKING_FORMAT_LABELS,
} from '@/lib/constants';
import type { Speaker } from '@/lib/database.types';

const controlCls =
  'w-full rounded-md border border-wbv-slate/40 bg-white px-3 py-2 text-sm text-wbv-secondary placeholder-gray-400 focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent';

type SortKey = 'alpha' | 'recent' | 'featured';

export function Directory({ speakers }: { speakers: Speaker[] }) {
  const [query, setQuery] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [format, setFormat] = useState('');
  const [sort, setSort] = useState<SortKey>('alpha');

  // Distinct cities present in the directory, for the location filter.
  const locations = useMemo(
    () =>
      Array.from(
        new Set(speakers.map((s) => s.location).filter(Boolean) as string[])
      ).sort((a, b) => a.localeCompare(b)),
    [speakers]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = speakers.filter((s) => {
      if (needle) {
        const haystack = `${s.name} ${s.designation} ${s.bio ?? ''}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (industries.length && !industries.includes(s.industry_speciality ?? ''))
        return false;
      if (domains.length && !domains.includes(s.domain_speciality ?? ''))
        return false;
      if (location && s.location !== location) return false;
      if (format && s.in_person_or_virtual !== format) return false;
      return true;
    });

    const byName = (a: Speaker, b: Speaker) => a.name.localeCompare(b.name);
    if (sort === 'recent') {
      result.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sort === 'featured') {
      result.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || byName(a, b)
      );
    } else {
      result.sort(byName);
    }
    return result;
  }, [speakers, query, industries, domains, location, format, sort]);

  const hasFilters =
    query.trim() !== '' ||
    industries.length > 0 ||
    domains.length > 0 ||
    location !== '' ||
    format !== '';

  function clearFilters() {
    setQuery('');
    setIndustries([]);
    setDomains([]);
    setLocation('');
    setFormat('');
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, role, or bio…"
        aria-label="Search speakers"
        className={controlCls}
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MultiSelect
          label="Industries"
          options={INDUSTRY_SPECIALITIES}
          selected={industries}
          onChange={setIndustries}
        />
        <MultiSelect
          label="Domains"
          options={DOMAIN_SPECIALITIES}
          selected={domains}
          onChange={setDomains}
        />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Filter by location"
          className={controlCls}
        >
          <option value="">All locations</option>
          {locations.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          aria-label="Filter by speaking format"
          className={controlCls}
        >
          <option value="">Any format</option>
          {SPEAKING_FORMATS.map((f) => (
            <option key={f} value={f}>
              {SPEAKING_FORMAT_LABELS[f]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {filtered.length} {filtered.length === 1 ? 'speaker' : 'speakers'}
        </p>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-wbv-accent hover:brightness-90"
            >
              Clear filters
            </button>
          )}
          <label className="flex items-center gap-2 text-sm text-gray-500">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort speakers"
              className="rounded-md border border-wbv-slate/40 bg-white px-2 py-1.5 text-sm text-wbv-secondary focus:border-wbv-accent focus:outline-none focus:ring-1 focus:ring-wbv-accent"
            >
              <option value="alpha">A–Z</option>
              <option value="recent">Recently added</option>
              <option value="featured">Featured first</option>
            </select>
          </label>
        </div>
      </div>

      {/* Grid — single column under 768px, then 2/3 columns */}
      {filtered.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-wbv-slate/40 bg-white p-10 text-center text-sm text-gray-500">
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
