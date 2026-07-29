import type { IntroRequestStatus, SpeakerStatus } from '@/lib/database.types';

const STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-200 text-gray-700',
  declined: 'bg-red-100 text-red-800',
  introduced: 'bg-wbv-secondary/10 text-wbv-secondary',
};

export function StatusBadge({
  status,
}: {
  status: SpeakerStatus | IntroRequestStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        STYLES[status] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}
