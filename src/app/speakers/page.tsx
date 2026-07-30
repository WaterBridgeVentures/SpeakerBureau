import type { Metadata } from 'next';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { SPEAKER_COLUMNS } from '@/lib/constants';
import { Directory } from '@/app/speakers/_components/Directory';
import { Header } from '@/app/_components/Header';
import { Footer } from '@/app/_components/Footer';

export const metadata: Metadata = {
  title: 'Speaker Directory — Women’s Speaker Bureau',
  description:
    'Browse and search approved women speakers by name, industry, and domain.',
};

export default async function SpeakersPage() {
  // Single query for all approved speakers (~100 max), then search/filter runs
  // client-side — no server-side pagination needed.
  const supabase = await createClient();
  const { data: speakers, error } = await supabase
    .from('speakers')
    .select(SPEAKER_COLUMNS)
    .eq('status', 'approved')
    .eq('paused', false)
    .order('name', { ascending: true });

  return (
    <div className="flex min-h-screen flex-col bg-wbv-ivory">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-wbv-secondary">
              Speaker Directory
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Discover women speakers across industries and domains.
            </p>
          </div>
          <Link
            href="/nominate"
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-wbv-primary px-4 py-2 text-sm font-medium text-white hover:brightness-95"
          >
            Nominate yourself
          </Link>
        </header>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Couldn’t load the directory: {error.message}
            </p>
          ) : (
            <Directory speakers={speakers ?? []} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
