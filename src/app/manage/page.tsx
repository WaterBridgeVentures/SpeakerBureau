import type { Metadata } from 'next';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Header } from '@/app/_components/Header';
import { Footer } from '@/app/_components/Footer';
import { RequestLinkForm } from '@/app/manage/_components/RequestLinkForm';
import { ManageProfileForm } from '@/app/manage/_components/ManageProfileForm';
import { signOutManage } from '@/app/manage/actions';

export const metadata: Metadata = {
  title: 'Manage your profile — Women’s Speaker Collective',
  description:
    'Listed speakers can sign in with a secure link to update their bio, photo, and location, or pause their listing.',
};

function ilikeLiteral(s: string): string {
  return s.replace(/([\\%_])/g, '\\$1');
}

export default async function ManagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let body: React.ReactNode;

  if (!user?.email) {
    body = <RequestLinkForm />;
  } else {
    // Service role: it alone can match against the private email column.
    const svc = createAdminClient();
    const { data: rows } = await svc
      .from('speakers')
      .select('id, name, designation, photo_url, location, bio, paused')
      .ilike('email', ilikeLiteral(user.email))
      .eq('status', 'approved')
      .limit(1);
    const speaker = rows?.[0] ?? null;

    if (!speaker) {
      body = (
        <div className="rounded-2xl border border-wbv-slate/30 bg-white p-6 text-center sm:p-8">
          <h1 className="text-xl font-semibold text-wbv-secondary">
            No listing found
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You’re signed in as{' '}
            <span className="font-medium">{user.email}</span>, but that email
            isn’t linked to an approved speaker profile. If you believe this is a
            mistake, contact the collective.
          </p>
          <form action={signOutManage} className="mt-4">
            <button
              type="submit"
              className="text-sm font-medium text-wbv-accent hover:brightness-90"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/nominate"
            className="mt-2 inline-block text-sm text-gray-500 hover:text-gray-700"
          >
            Nominate yourself →
          </Link>
        </div>
      );
    } else {
      body = <ManageProfileForm speaker={speaker} email={user.email} />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-wbv-ivory">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-4 py-8 sm:py-10">{body}</div>
      </main>
      <Footer />
    </div>
  );
}
