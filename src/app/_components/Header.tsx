import Link from 'next/link';

/** Public site header: light bar, bureau logo top-left, near-black nav links. */
export function Header() {
  return (
    <header className="border-b border-wbv-slate/40 bg-wbv-ivory">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="India VC&PE Women’s Speaker Collective — home">
          <img
            src="/bureau-logo.png"
            alt="India VC&PE Women’s Speaker Collective"
            className="h-9 w-auto sm:h-10"
          />
        </Link>
        <nav
          className="flex items-center gap-4 text-sm font-medium sm:gap-6"
          aria-label="Primary"
        >
          <Link
            href="/speakers"
            className="text-wbv-secondary/70 hover:text-wbv-secondary"
          >
            Directory
          </Link>
          <Link
            href="/nominate"
            className="text-wbv-secondary/70 hover:text-wbv-secondary"
          >
            Nominate
          </Link>
          <Link
            href="/manage"
            className="text-wbv-secondary/70 hover:text-wbv-secondary"
          >
            Manage profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
