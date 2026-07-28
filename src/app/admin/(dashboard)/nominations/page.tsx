import { requireAdmin } from '@/lib/dal';
import { createClient } from '@/lib/supabase/server';
import { SPEAKER_COLUMNS } from '@/lib/constants';
import { SpeakerSummary } from '@/app/admin/_components/SpeakerSummary';
import { NominationActions } from '@/app/admin/_components/NominationActions';

export default async function NominationsPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('speakers')
    .select(SPEAKER_COLUMNS)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return <p className="text-sm text-red-600">Failed to load: {error.message}</p>;
  }
  const speakers = data ?? [];

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Pending Nominations
        </h2>
        <span className="text-sm text-gray-500">{speakers.length} pending</span>
      </div>

      {speakers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No pending nominations right now.
        </p>
      ) : (
        <ul className="space-y-3">
          {speakers.map((speaker) => (
            <li
              key={speaker.id}
              className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <SpeakerSummary speaker={speaker} />
              <NominationActions speakerId={speaker.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
