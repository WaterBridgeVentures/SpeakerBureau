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

  // Prefill from the signed-in identity's metadata. LinkedIn OIDC populates
  // name / picture / email — including when the LinkedIn identity is linked to
  // an existing account, in which case app_metadata.provider can still read
  // 'email'. So we don't gate on the provider; we prefill whenever the
  // metadata is present. (Headline isn't a standard OIDC claim, so designation
  // is usually still entered manually.)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const name = (meta.name as string) ?? (meta.full_name as string) ?? '';
  const photoUrl =
    (meta.picture as string) ?? (meta.avatar_url as string) ?? '';
  const prefill: Prefill | null =
    user && (name || photoUrl)
      ? {
          name,
          email: user.email ?? (meta.email as string) ?? '',
          photo_url: photoUrl,
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
