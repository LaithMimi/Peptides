/** Shared values for the few Web Animations API acknowledgments (see "Motion" in globals.css). */
export const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

export function prefersReducedMotion(): boolean {
  return typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
