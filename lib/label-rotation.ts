/**
 * Deterministic, decorative-only tilt for a label card, as if pinned
 * slightly askew on a shelf. Same id always yields the same angle so
 * server and client render identically (no hydration mismatch).
 */
export function labelRotation(id: string, maxDegrees = 1.4): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (hash % 200) / 100 - 1; // -1..1
  return Number((normalized * maxDegrees).toFixed(2));
}
