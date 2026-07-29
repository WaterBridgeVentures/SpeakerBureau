import type { Speaker } from '@/lib/database.types';

const SIZES = {
  md: 'h-14 w-14 text-sm',
  lg: 'h-24 w-24 text-2xl',
} as const;

export function Avatar({
  name,
  photoUrl,
  size = 'md',
}: {
  name: Speaker['name'];
  photoUrl: Speaker['photo_url'];
  size?: keyof typeof SIZES;
}) {
  const dim = SIZES[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={`${dim} shrink-0 rounded-full object-cover`}
      />
    );
  }

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-wbv-secondary/10 font-semibold text-wbv-secondary`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
