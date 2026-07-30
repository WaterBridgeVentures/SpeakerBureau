import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database, Speaker, SpeakerWithTags } from '@/lib/database.types';
import { DOMAINS, INDUSTRIES } from '@/lib/constants';

type Client = SupabaseClient<Database>;

const industryRank = new Map(INDUSTRIES.map((v, i) => [v as string, i]));
const domainRank = new Map(DOMAINS.map((v, i) => [v as string, i]));

function sortByRank(values: string[], rank: Map<string, number>): string[] {
  return [...values].sort(
    (a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999)
  );
}

/**
 * Attach each speaker's multi-select industries/domains (from the join tables)
 * as `industries` / `domains` string arrays. Two grouped queries, no N+1.
 * The caller's client governs visibility (RLS): the public client only sees
 * approved+unpaused speakers' tags; an admin/service client sees all.
 */
export async function attachTags(
  client: Client,
  speakers: Speaker[]
): Promise<SpeakerWithTags[]> {
  const ids = speakers.map((s) => s.id);
  if (ids.length === 0) return speakers.map((s) => ({ ...s, industries: [], domains: [] }));

  const [indRes, domRes] = await Promise.all([
    client.from('speaker_industries').select('speaker_id, industry').in('speaker_id', ids),
    client.from('speaker_domains').select('speaker_id, domain').in('speaker_id', ids),
  ]);

  const industriesById = new Map<string, string[]>();
  const domainsById = new Map<string, string[]>();
  const push = (m: Map<string, string[]>, id: string, value: string) => {
    const list = m.get(id);
    if (list) list.push(value);
    else m.set(id, [value]);
  };
  for (const row of indRes.data ?? []) push(industriesById, row.speaker_id, row.industry);
  for (const row of domRes.data ?? []) push(domainsById, row.speaker_id, row.domain);

  return speakers.map((s) => ({
    ...s,
    industries: sortByRank(industriesById.get(s.id) ?? [], industryRank),
    domains: sortByRank(domainsById.get(s.id) ?? [], domainRank),
  }));
}

/** Convenience for a single speaker. */
export async function attachTagsOne(
  client: Client,
  speaker: Speaker
): Promise<SpeakerWithTags> {
  const [withTags] = await attachTags(client, [speaker]);
  return withTags;
}
