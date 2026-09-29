/**
 * The brand's seal mark: a cylindrical crimp-cap vial silhouette (matching
 * the real seeded product photography's vial shape, not a flask) with a
 * small peptide-chain accent echoing the logo's dot-chain "P" — used
 * wherever a product has no photo of its own.
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
      {/* crimp cap */}
      <rect x="14" y="6.5" width="12" height="4.5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.4 8.75h11.2" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
      {/* neck */}
      <path d="M16.6 11v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M23.4 11v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* cylindrical body */}
      <rect x="12.5" y="14.4" width="15" height="15.6" rx="2.6" stroke="currentColor" strokeWidth="1.6" />
      {/* fill line */}
      <path d="M13 23.4h14" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* peptide dot-chain accent */}
      <circle cx="17.6" cy="19" r="1" fill="currentColor" />
      <path d="M17.6 19h2.6" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="21" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}
