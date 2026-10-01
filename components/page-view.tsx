import { ViewTransition } from "react";

/**
 * Wraps a storefront page's content so it racks into focus when a navigation
 * brings it on screen (mounted from app/[locale]/template.tsx, which remounts
 * per navigation; a layout persists and would never enter). `default="none"`
 * keeps it still during unrelated transitions (result swaps, the nav
 * underline). Initial page loads do not animate; browsers without View
 * Transitions just swap instantly.
 */
export function PageView({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" default="none">
      {children}
    </ViewTransition>
  );
}

/**
 * A result set that swaps in place (pagination, research-area selection):
 * keyed by the query so React treats old and new results as an exit/enter
 * pair and crossfades them under the controls that stay put.
 */
export function ResultsView({ swapKey, children }: { swapKey: string; children: React.ReactNode }) {
  return (
    <ViewTransition key={swapKey} enter="results-swap" exit="results-swap" default="none">
      {children}
    </ViewTransition>
  );
}
