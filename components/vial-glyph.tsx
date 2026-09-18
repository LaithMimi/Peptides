/**
 * The brand's seal mark: a vial silhouette with a small peptide-chain
 * accent (echoing the logo's dot-chain "P"), used wherever a product's
 * photography would normally sit — there is no real product photography
 * on hand, so this authored glyph carries that role instead.
 */
export function VialGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
      <path
        d="M16 8h8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17 8v6.4c0 .5-.15.98-.43 1.38l-4.2 6.02A2.6 2.6 0 0 0 14.5 26h11a2.6 2.6 0 0 0 2.13-4.2l-4.2-6.02a2.4 2.4 0 0 1-.43-1.38V8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14.6 22h10.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="19" cy="18.5" r="1" fill="currentColor" />
      <path d="M19 18.5h2.4" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="22.2" cy="18.5" r="1" fill="currentColor" />
    </svg>
  );
}
