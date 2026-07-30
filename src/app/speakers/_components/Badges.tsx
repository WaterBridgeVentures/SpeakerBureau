export function VerifiedBadge() {
  return (
    <span
      title="Verified via LinkedIn sign-in"
      className="inline-flex items-center gap-1 rounded-full bg-wbv-slate/20 px-2 py-0.5 text-[11px] font-medium text-wbv-secondary"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3 fill-wbv-secondary">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM13.7 8.3a1 1 0 00-1.4-1.4L9 10.2 7.7 8.9a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span
      title="Featured speaker"
      className="inline-flex items-center gap-1 rounded-full bg-wbv-primary/20 px-2 py-0.5 text-[11px] font-medium text-wbv-black"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3 fill-wbv-primary">
        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
      </svg>
      Featured
    </span>
  );
}
