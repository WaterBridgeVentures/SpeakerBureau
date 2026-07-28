import Link from 'next/link';

import { Avatar } from '@/app/speakers/_components/Avatar';
import { SpecialityTags } from '@/app/speakers/_components/SpecialityTags';
import type { Speaker } from '@/lib/database.types';

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <Link
      href={`/speakers/${speaker.id}`}
      className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex items-start gap-3">
        <Avatar name={speaker.name} photoUrl={speaker.photo_url} />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900 group-hover:text-indigo-600">
            {speaker.name}
          </h3>
          <p className="text-sm text-gray-600">{speaker.designation}</p>
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

      <span className="mt-auto pt-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-500">
        View profile →
      </span>
    </Link>
  );
}
