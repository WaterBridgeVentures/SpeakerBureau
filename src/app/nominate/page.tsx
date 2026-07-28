import type { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import {
  NominateForm,
  type Prefill,
} from '@/app/nominate/_components/NominateForm';

export const metadata: Metadata = {
  title: 'Nominate Yourself — Women’s Speaker Bureau',
  description:
    'Add yourself to the Women’s Speaker Bureau directory. Sign in with LinkedIn to autofill, or enter your details manually.',
};

export default async function NominatePage({
  searchParams,
}: {
  searchParams: Promise<{ linkedin?: string }>;
}) {
  const { linkedin } = await searchParams;

  // If the visitor signed in with LinkedIn, pull name/photo/headline from the
  // session metadata to prefill. (LinkedIn OIDC provides name + picture; a
  // headline isn't part of the standard claims, so designation is usually
  // still entered manually.)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fromLinkedIn = user?.app_metadata?.provider === 'linkedin_oidc';
  const meta = user?.user_metadata ?? {};
  const prefill: Prefill | null = fromLinkedIn
    ? {
        name: (meta.name as string) ?? (meta.full_name as string) ?? '',
        email: user?.email ?? (meta.email as string) ?? '',
        photo_url: (meta.picture as string) ?? (meta.avatar_url as string) ?? '',
        headline: (meta.headline as string) ?? '',
      }
    : null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Nominate Yourself
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Join the Women’s Speaker Bureau directory. Submissions are reviewed
            before they appear publicly.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <NominateForm prefill={prefill} linkedInError={linkedin === 'error'} />
        </div>
      </div>
    </main>
  );
}
