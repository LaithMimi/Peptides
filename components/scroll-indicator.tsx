/**
 * 40px ring with a floating arrow-down (Lucide `arrow-down` paths, inlined so
 * no icon package is needed). Points at the next section of the page.
 */
export function ScrollIndicator({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} aria-label={label} className="scroll-indicator mx-auto">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="scroll-indicator-icon"
      >
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
      </svg>
    </a>
  );
}
