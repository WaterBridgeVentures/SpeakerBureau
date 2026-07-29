import Link from 'next/link';

import { Avatar } from '@/app/speakers/_components/Avatar';
import { SpecialityTags } from '@/app/speakers/_components/SpecialityTags';
import { FeaturedBadge, VerifiedBadge } from '@/app/speakers/_components/Badges';
import { SPEAKING_FORMAT_LABELS } from '@/lib/constants';
import type { Speaker } from '@/lib/database.types';

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <Link
      href={`/speakers/${speaker.id}`}
      className="group flex h-full flex-col rounded-xl border border-wbv-slate/30 bg-white p-4 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-wbv-accent"
    >
      <div className="flex items-start gap-3">
        <Avatar name={speaker.name} photoUrl={speaker.photo_url} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-wbv-secondary group-hover:text-wbv-accent">
              {speaker.name}
            </h3>
            {speaker.featured && <FeaturedBadge />}
          </div>
          <p className="text-sm text-gray-600">{speaker.designation}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            {speaker.verified && <VerifiedBadge />}
            {speaker.location && <span>📍 {speaker.location}</span>}
            {speaker.in_person_or_virtual && (
              <span>{SPEAKING_FORMAT_LABELS[speaker.in_person_or_virtual]}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <SpecialityTags
          industry={speaker.industry_speciality}
          domain={speaker.domain_speciality}
        />
      </div>

      {speaker.bio && (
        <p className="mt-3 line-clamp-3 text-sm text-gray-500">{speaker.bio}</p>
      )}

      <span className="mt-auto pt-4 text-sm font-medium text-wbv-accent group-hover:brightness-90">
        View profile →
      </span>
    </Link>
  );
}
