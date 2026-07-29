import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getAdmin } from '@/lib/dal';
import { LoginForm } from '@/app/admin/_components/LoginForm';

export const metadata: Metadata = {
  title: 'Admin sign in — Women’s Speaker Bureau',
};

export default async function AdminLoginPage() {
  // Already signed in as an admin? Skip the form.
  const admin = await getAdmin();
  if (admin) redirect('/admin');

  return (
    <main className="flex min-h-screen items-center justify-center bg-wbv-ivory px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-wbv-slate/30 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-lg font-semibold text-wbv-secondary">
          Women’s Speaker Bureau
        </h1>
        <p className="mt-1 text-sm text-gray-500">Admin dashboard sign in</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
