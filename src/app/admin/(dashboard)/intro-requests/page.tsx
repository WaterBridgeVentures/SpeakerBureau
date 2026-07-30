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
      .select('id, name, designation')
      .in('id', speakerIds);
    for (const s of speakers ?? []) {
      speakerById.set(s.id, { name: s.name, designation: s.designation });
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-wbv-secondary">
          Pending Intro Requests
        </h2>
        <span className="text-sm text-gray-500">{requests.length} pending</span>
      </div>

      {requests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-wbv-slate/40 bg-white p-8 text-center text-sm text-gray-500">
          No pending intro requests right now.
        </p>
      ) : (
        <ul className="space-y-3">
          {requests.map((req) => {
            const speaker = speakerById.get(req.speaker_id);
            return (
              <li
                key={req.id}
                className="flex flex-col gap-4 rounded-lg border border-wbv-slate/30 bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 space-y-2 text-sm">
                  <p className="text-wbv-secondary">
                    <span className="font-medium">{req.requester_name}</span>
                    {req.requester_org && (
                      <span className="text-gray-500"> · {req.requester_org}</span>
                    )}
                  </p>
                  <p className="text-gray-500">
                    <a
                      href={`mailto:${req.requester_email}`}
                      className="text-wbv-accent hover:brightness-90"
                    >
                      {req.requester_email}
                    </a>
                  </p>
                  <p className="text-gray-700">
                    Wants an intro to{' '}
                    <span className="font-medium text-wbv-secondary">
                      {speaker ? speaker.name : 'Unknown speaker'}
                    </span>
                    {speaker && (
                      <span className="text-gray-500"> — {speaker.designation}</span>
                    )}
                  </p>
                  {req.reason && (
                    <p className="rounded-md bg-wbv-ivory p-3 text-gray-600">
                      “{req.reason}”
                    </p>
                  )}
                  {(req.event_name ||
                    req.event_month ||
                    req.audience_size) && (
                    <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      {req.event_name && (
                        <div>
                          <dt className="inline font-medium text-gray-600">
                            Event:{' '}
                          </dt>
                          <dd className="inline">{req.event_name}</dd>
                        </div>
                      )}
                      {req.event_month && (
                        <div>
                          <dt className="inline font-medium text-gray-600">
                            Month:{' '}
                          </dt>
                          <dd className="inline">{req.event_month}</dd>
                        </div>
                      )}
                      {req.audience_size && (
                        <div>
                          <dt className="inline font-medium text-gray-600">
                            Audience:{' '}
                          </dt>
                          <dd className="inline">{req.audience_size}</dd>
                        </div>
                      )}
                    </dl>
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
