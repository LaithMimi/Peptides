import { cloneElement, isValidElement } from "react";

// The border uses --input-border (>=3:1 against the field fill and the card
// surface) so the control's edge is findable; --border-strong stays for cards.
export const inputClass =
  "min-h-11 w-full rounded-md border border-input-border bg-surface-raised px-3 py-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

// Secondary (outlined) action, sized to a 44px touch target.
export const secondaryButtonClass =
  "inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-border-strong px-5 py-2 font-serif text-xs font-semibold uppercase tracking-wide text-navy transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50";

export function Field({
  label,
  htmlFor,
  help,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const helpId = `${htmlFor}-help`;
  const errorId = `${htmlFor}-error`;
  const describedBy =
    [help && !error ? helpId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  // Link the hint/error to the control and mark it invalid so assistive tech
  // announces them when the field receives focus, not only when they appear.
  const control = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, {
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="font-mono text-xs font-semibold uppercase tracking-widest text-muted"
      >
        {label}
      </label>
      {control}
      {help && !error && (
        <p id={helpId} className="text-xs text-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
