import type { Speaker } from '@/lib/database.types';

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
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
      {initials}
    </div>
  );
}

export function SpeakerSummary({ speaker }: { speaker: Speaker }) {
  return (
    <div className="flex gap-3">
      <Avatar speaker={speaker} />
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{speaker.name}</p>
        <p className="text-sm text-gray-600">{speaker.designation}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {speaker.industry_speciality && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800">
              {speaker.industry_speciality}
            </span>
          )}
          {speaker.domain_speciality && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-800">
              {speaker.domain_speciality}
            </span>
          )}
        </div>
        {speaker.bio && (
          <p className="mt-2 line-clamp-3 text-sm text-gray-500">{speaker.bio}</p>
        )}
        <a
          href={speaker.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-500"
        >
          LinkedIn ↗
        </a>
      </div>
    </div>
  );
}
