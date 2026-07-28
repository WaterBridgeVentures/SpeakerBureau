import { requireSuperAdmin } from '@/lib/dal';
import { createClient } from '@/lib/supabase/server';
import { SpeakerEditor } from '@/app/admin/_components/SpeakerEditor';

export default async function AllSpeakersPage() {
  await requireSuperAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">Failed to load: {error.message}</p>;
  }
  const speakers = data ?? [];

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-gray-900">All Speakers</h2>
        <span className="text-sm text-gray-500">{speakers.length} total</span>
      </div>

      {speakers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No speakers yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {speakers.map((s) => (
            <SpeakerEditor key={s.id} speaker={s} />
          ))}
        </ul>
      )}
    </section>
  );
}
