import Link from 'next/link';

// Placeholder landing page. The public site (directory, nomination form,
// speaker profiles) is built in later phases; for now this just points the
// operator to the admin dashboard.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">
        Women’s Speaker Bureau
      </h1>
      <p className="max-w-md text-sm text-gray-500">
        A free, India-focused directory of women speakers. The public directory
        is coming soon — in the meantime, add yourself.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/nominate"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Nominate yourself
        </Link>
        <Link
          href="/admin"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Admin dashboard
        </Link>
      </div>
    </main>
  );
}
