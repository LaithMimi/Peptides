/**
 * The brand's seal mark: a cylindrical crimp-cap vial silhouette (matching
 * the real seeded product photography's vial shape, not a flask) with a
 * small peptide-chain accent echoing the logo's dot-chain "P" — used
 * wherever a product has no photo of its own.
 *
 * `variant="empty"` drops the fill line and the chain (an empty cart);
 * `variant="sealed"` fills the vial to its line (a placed order). The parts
 * carry `vial-ring` / `vial-liquid` / `vial-bond-*` classes so a `.vial-sealing`
 * ancestor can play the confirmation sequence (app/globals.css); without it,
 * the final state renders directly.
 */
export function VialGlyph({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "empty" | "sealed";
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        className="vial-ring"
        pathLength={1}
        cx="20"
        cy="20"
        r="18.5"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.35"
      />
      {/* crimp cap */}
      <rect x="14" y="6.5" width="12" height="4.5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.4 8.75h11.2" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
      {/* neck */}
      <path d="M16.6 11v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M23.4 11v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* contents, up to the fill line */}
      {variant === "sealed" && (
        <rect
          className="vial-liquid"
          x="13.3"
          y="23.4"
          width="13.4"
          height="5.8"
          rx="1.9"
          fill="currentColor"
          opacity="0.2"
        />
      )}
      {/* cylindrical body */}
      <rect x="12.5" y="14.4" width="15" height="15.6" rx="2.6" stroke="currentColor" strokeWidth="1.6" />
      {variant !== "empty" && (
        <>
          {/* fill line */}
          <path d="M13 23.4h14" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          {/* peptide dot-chain accent */}
          <circle className="vial-bond vial-bond-1" cx="17.6" cy="19" r="1" fill="currentColor" />
          <path className="vial-bond vial-bond-2" d="M17.6 19h2.6" stroke="currentColor" strokeWidth="1.1" />
          <circle className="vial-bond vial-bond-3" cx="21" cy="19" r="1" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
