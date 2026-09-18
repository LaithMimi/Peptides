import { useTranslations } from "next-intl";

export function DisclaimerBanner({ variant = "default" }: { variant?: "default" | "compact" }) {
  const t = useTranslations("disclaimer");

  if (variant === "compact") {
    return (
      <p className="flex items-start gap-2 font-mono text-xs uppercase tracking-wide text-muted">
        <SealIcon className="mt-0.5 size-4 shrink-0 text-accent" />
        <span>{t("short")}</span>
      </p>
    );
  }

  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded border-2 border-dashed border-border-strong bg-surface px-4 py-3"
    >
      <SealIcon className="mt-0.5 size-5 shrink-0 text-accent" />
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-navy">
          {t("short")}
        </p>
        <p className="mt-1 text-sm text-muted">{t("long")}</p>
      </div>
    </div>
  );
}

function SealIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
