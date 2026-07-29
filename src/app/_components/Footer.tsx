import { createClient } from '@/lib/supabase/server';
import type { Supporter } from '@/lib/database.types';

function Logo({ supporter }: { supporter: Supporter }) {
  const img = (
    <img
      src={supporter.logo_url}
      alt={supporter.org_name}
      className="h-9 w-auto max-w-[150px] shrink-0 object-contain opacity-80 transition hover:opacity-100"
    />
  );
  if (!supporter.link_url) return img;
  return (
    <a
      href={supporter.link_url}
      target="_blank"
      rel="noopener noreferrer"
      title={supporter.org_name}
    >
      {img}
    </a>
  );
}

/**
 * Public footer supporter logo strip, pulled live from the supporters table
 * (RLS allows anon read), sorted A–Z by organisation name. Wraps on small
 * screens; renders nothing when there are no supporters.
 */
export async function Footer() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('supporters')
    .select('*')
    .order('org_name', { ascending: true });

  const supporters = data ?? [];
  if (supporters.length === 0) return null;

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="mb-5 text-center text-xs font-medium uppercase tracking-wide text-gray-400">
          Supported by
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          {supporters.map((s) => (
            <li key={s.id} className="flex items-center">
              <Logo supporter={s} />
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
