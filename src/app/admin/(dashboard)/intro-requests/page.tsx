import { requireAdmin } from '@/lib/dal';
import { createClient } from '@/lib/supabase/server';
import { IntroRequestActions } from '@/app/admin/_components/IntroRequestActions';

export default async function IntroRequestsPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('intro_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return <p className="text-sm text-red-600">Failed to load: {error.message}</p>;
  }
  const requests = data ?? [];

  // Resolve the referenced speakers in one query (kept separate to avoid
  // relying on typed PostgREST embeds).
  const speakerIds = [...new Set(requests.map((r) => r.speaker_id))];
  const speakerById = new Map<string, { name: string; designation: string }>();
  if (speakerIds.length > 0) {
    const { data: speakers } = await supabase
      .from('speakers')
      .select('*')
      .in('id', speakerIds);
    for (const s of speakers ?? []) {
      speakerById.set(s.id, { name: s.name, designation: s.designation });
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Pending Intro Requests
        </h2>
        <span className="text-sm text-gray-500">{requests.length} pending</span>
      </div>

      {requests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No pending intro requests right now.
        </p>
      ) : (
        <ul className="space-y-3">
          {requests.map((req) => {
            const speaker = speakerById.get(req.speaker_id);
            return (
              <li
                key={req.id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-2 text-sm">
                  <p className="text-gray-900">
                    <span className="font-medium">{req.requester_name}</span>
                    {req.requester_org && (
                      <span className="text-gray-500"> · {req.requester_org}</span>
                    )}
                  </p>
                  <p className="text-gray-500">
                    <a
                      href={`mailto:${req.requester_email}`}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {req.requester_email}
                    </a>
                  </p>
                  <p className="text-gray-700">
                    Wants an intro to{' '}
                    <span className="font-medium text-gray-900">
                      {speaker ? speaker.name : 'Unknown speaker'}
                    </span>
                    {speaker && (
                      <span className="text-gray-500"> — {speaker.designation}</span>
                    )}
                  </p>
                  {req.reason && (
                    <p className="rounded-md bg-gray-50 p-3 text-gray-600">
                      “{req.reason}”
                    </p>
                  )}
                </div>
                <IntroRequestActions requestId={req.id} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
