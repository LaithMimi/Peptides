import { Link } from "@/i18n/navigation";
import { VialGlyph } from "@/components/vial-glyph";

/**
 * Friendly state for anything that is not publicly visible (unpublished
 * product, inactive brand or area, missing item). Never reveals why.
 */
export function Unavailable({
  title,
  body,
  actionLabel,
  actionHref = "/shop",
}: {
  title: string;
  body: string;
  actionLabel: string;
  actionHref?: string;
}) {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border-strong bg-surface px-6 py-12 text-center"
    >
      <VialGlyph className="size-14 text-muted" />
      <h1 className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
        {title}
      </h1>
      <p className="text-muted">{body}</p>
      <Link
        href={actionHref}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-6 py-2 font-serif text-sm font-semibold uppercase tracking-wide text-navy-foreground hover:opacity-90"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
