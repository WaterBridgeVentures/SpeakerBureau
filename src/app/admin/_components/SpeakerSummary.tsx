import { VerifiedBadge } from '@/app/speakers/_components/Badges';
import { resolveTagLabels } from '@/lib/constants';
import type { Speaker, SpeakerWithTags } from '@/lib/database.types';

function Avatar({ speaker }: { speaker: Speaker }) {
  if (speaker.photo_url) {
    return (
      <img
        src={speaker.photo_url}
        alt=""
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
    );
  }
  const initials = speaker.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-wbv-secondary/10 text-sm font-semibold text-wbv-secondary">
      {initials}
    </div>
  );
}

export function SpeakerSummary({ speaker }: { speaker: SpeakerWithTags }) {
  const industries = resolveTagLabels(
    speaker.industries,
    speaker.industry_other_text
  );
  const domains = resolveTagLabels(speaker.domains, speaker.domain_other_text);
  return (
    <div className="flex gap-3">
      <Avatar speaker={speaker} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-wbv-secondary">{speaker.name}</p>
          {speaker.verified && <VerifiedBadge />}
        </div>
        <p className="text-sm text-gray-600">{speaker.designation}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {industries.map((label) => (
            <span
              key={`i-${label}`}
              className="rounded-full bg-wbv-slate/20 px-2 py-0.5 text-xs text-wbv-secondary"
            >
              {label}
            </span>
          ))}
          {domains.map((label) => (
            <span
              key={`d-${label}`}
              className="rounded-full bg-wbv-primary/15 px-2 py-0.5 text-xs text-wbv-secondary"
            >
              {label}
            </span>
          ))}
        </div>
        {speaker.bio && (
          <p className="mt-2 line-clamp-3 text-sm text-gray-500">{speaker.bio}</p>
        )}
        <a
          href={speaker.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-wbv-accent hover:brightness-90"
        >
          LinkedIn ↗
        </a>
      </div>
    </div>
  );
}
