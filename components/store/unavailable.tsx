import { Link } from "@/i18n/navigation";
import { VialGlyph } from "@/components/vial-glyph";

/**
 * The storefront's full-page state panel: the vial mark, a heading, a line of
 * explanation and the way forward. `absent` (dashed, like the empty cart) is
 * for something that isn't there; `failed` (a solid card) is for something
 * that went wrong and can be retried.
 */
export function StatePanel({
  tone,
  title,
  body,
  headingRef,
  children,
}: {
  tone: "absent" | "failed";
  title: string;
  body: string;
  /** Lets an error boundary move focus to the heading on arrival. */
  headingRef?: React.Ref<HTMLHeadingElement>;
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "failed" ? "alert" : "status"}
      className={`mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-surface px-6 py-12 text-center ${
        tone === "failed" ? "border border-border-strong shadow-sm" : "border-2 border-dashed border-border-strong"
      }`}
    >
      <VialGlyph className="size-14 text-muted" />
      <h1
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        className="text-balance font-serif text-xl font-semibold uppercase tracking-wide text-navy"
      >
        {title}
      </h1>
      <p className="text-pretty text-muted">{body}</p>
      {children}
    </div>
  );
}

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
    <StatePanel tone="absent" title={title} body={body}>
      <Link
        href={actionHref}
        className="btn-glass inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2 font-serif text-sm font-semibold uppercase tracking-wide"
      >
        {actionLabel}
      </Link>
    </StatePanel>
  );
}
