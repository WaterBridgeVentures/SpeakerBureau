import Link from 'next/link';

/** Public site header: Midnight Indigo bar, WBV logo top-left, white nav links. */
export function Header() {
  return (
    <header className="bg-wbv-secondary">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="WaterBridge Ventures — home">
          <img
            src="/wbv-logo.png"
            alt="WaterBridge Ventures"
            className="h-auto max-w-[140px] sm:max-w-[160px]"
          />
        </Link>
        <nav
          className="flex items-center gap-4 text-sm font-medium sm:gap-6"
          aria-label="Primary"
        >
          <Link href="/speakers" className="text-white/80 hover:text-white">
            Directory
          </Link>
          <Link href="/nominate" className="text-white/80 hover:text-white">
            Nominate
          </Link>
        </nav>
      </div>
    </header>
  );
}
