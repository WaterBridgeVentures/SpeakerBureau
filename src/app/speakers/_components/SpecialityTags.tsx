/**
 * Renders a speaker's specialities as chips: industries in neutral, domains in
 * the brand red. Values are already display-resolved (see resolveTagLabels), so
 * "Others" arrives as the speaker's custom text.
 */
export function SpecialityTags({
  industries,
  domains,
}: {
  industries: string[];
  domains: string[];
}) {
  if (industries.length === 0 && domains.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {industries.map((label) => (
        <span
          key={`i-${label}`}
          className="rounded-full bg-wbv-slate/20 px-2 py-0.5 text-xs font-medium text-wbv-secondary"
        >
          {label}
        </span>
      ))}
      {domains.map((label) => (
        <span
          key={`d-${label}`}
          className="rounded-full bg-wbv-primary/15 px-2 py-0.5 text-xs font-medium text-wbv-secondary"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
