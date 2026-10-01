import { ViewTransition } from "react";

/** Shown instantly while a storefront page's data loads, so navigation never feels frozen. */
export default function Loading() {
  return (
    // When the page resolves, the skeleton fades out of the way before the
    // real content racks into focus (see .skeleton-exit / .page-enter).
    <ViewTransition exit="skeleton-exit" default="none">
      <div className="flex animate-pulse flex-col gap-6" role="status" aria-busy="true">
        <span className="sr-only">Loading…</span>
        <div className="h-10 w-2/3 max-w-md rounded-lg bg-navy/10" />
        <div className="h-5 w-1/2 max-w-sm rounded bg-navy/10" />
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-navy/10" />
          ))}
        </div>
      </div>
    </ViewTransition>
  );
}
