import type { Speaker } from '@/lib/database.types';

export function SpecialityTags({
  industry,
  domain,
}: {
  industry: Speaker['industry_speciality'];
  domain: Speaker['domain_speciality'];
}) {
  if (!industry && !domain) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {industry && (
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
          {industry}
        </span>
      )}
      {domain && (
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
          {domain}
        </span>
      )}
    </div>
  );
}
