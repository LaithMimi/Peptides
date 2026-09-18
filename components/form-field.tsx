export const inputClass =
  "w-full rounded-md border border-border-strong bg-surface-raised px-3 py-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

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
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="font-mono text-xs font-semibold uppercase tracking-widest text-muted"
      >
        {label}
      </label>
      {children}
      {help && !error && <p className="text-xs text-muted">{help}</p>}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
