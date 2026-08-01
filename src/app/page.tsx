import Link from 'next/link';

import { Header } from '@/app/_components/Header';
import { Footer } from '@/app/_components/Footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-wbv-ivory">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <h1 className="text-3xl font-semibold text-wbv-secondary sm:text-4xl">
          Women’s Speaker Collective
        </h1>
        <p className="max-w-xl text-pretty text-base font-medium text-wbv-secondary sm:text-lg">
          Knowledge experts from the Indian PE and VC eco-system
        </p>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-gray-500">
          In a quest to end MAN-els, spotlighting women domain knowledge experts
          and enabling warm introductions. Independent and self-hosted, with
          thanks to our supporters.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/speakers"
            className="rounded-md bg-wbv-primary px-4 py-2 text-sm font-medium text-white hover:brightness-95"
          >
            Browse directory
          </Link>
          <Link
            href="/nominate"
            className="rounded-md border border-wbv-slate/40 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-wbv-ivory"
          >
            Nominate yourself
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
