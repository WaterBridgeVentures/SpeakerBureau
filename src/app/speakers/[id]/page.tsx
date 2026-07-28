import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { Avatar } from '@/app/speakers/_components/Avatar';
import { SpecialityTags } from '@/app/speakers/_components/SpecialityTags';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageParams = { params: Promise<{ id: string }> };

// Only approved speakers are readable (enforced by RLS and this filter), so an
// unknown/pending/rejected id resolves to a 404.
async function getApprovedSpeaker(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('speakers')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { id } = await params;
  const speaker = await getApprovedSpeaker(id);
  if (!speaker) return { title: 'Speaker — Women’s Speaker Bureau' };
  return {
    title: `${speaker.name} — Women’s Speaker Bureau`,
    description: speaker.designation,
  };
}

export default async function SpeakerProfilePage({ params }: PageParams) {
  const { id } = await params;
  const speaker = await getApprovedSpeaker(id);
  if (!speaker) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
        <Link
          href="/speakers"
          className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          ← Back to directory
        </Link>

        <article className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <Avatar
              name={speaker.name}
              photoUrl={speaker.photo_url}
              size="lg"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">
                {speaker.name}
              </h1>
              <p className="mt-0.5 text-gray-600">{speaker.designation}</p>
              <div className="mt-3 flex justify-center sm:justify-start">
                <SpecialityTags
                  industry={speaker.industry_speciality}
                  domain={speaker.domain_speciality}
                />
              </div>
            </div>
          </div>

          {speaker.bio && (
            <p className="mt-6 whitespace-pre-line text-gray-700">
              {speaker.bio}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6">
            <a
              href={speaker.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View LinkedIn profile ↗
            </a>

            {/* Intro-request flow ships in the next phase. */}
            <div>
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="w-full cursor-not-allowed rounded-md bg-indigo-600/50 px-4 py-2.5 text-sm font-medium text-white"
              >
                Request an Introduction
              </button>
              <p className="mt-1 text-center text-xs text-gray-400">
                Introduction requests open soon.
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
