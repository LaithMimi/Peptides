/** Shown while an admin page's data loads: a heading, a toolbar and table rows. */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 motion-safe:animate-pulse" role="status" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true" className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-8 w-48 rounded-md bg-navy/10" />
        <div className="h-11 w-36 rounded-full bg-navy/10" />
      </div>
      <div aria-hidden="true" className="overflow-hidden rounded-xl border border-border-strong">
        <div className="h-11 border-b border-border-strong bg-surface-raised" />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0">
            <div className="h-4 w-1/4 rounded bg-navy/10" />
            <div className="h-4 w-1/3 rounded bg-navy/10" />
            <div className="ms-auto h-4 w-16 rounded bg-navy/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
