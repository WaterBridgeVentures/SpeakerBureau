import Link from 'next/link';

import { Footer } from '@/app/_components/Footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Women’s Speaker Bureau
        </h1>
        <p className="max-w-md text-sm text-gray-500">
          A free, India-focused directory of women speakers. Browse the
          directory or add yourself.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/speakers"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Browse directory
          </Link>
          <Link
            href="/nominate"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Nominate yourself
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
