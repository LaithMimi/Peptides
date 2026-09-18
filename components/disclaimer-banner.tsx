import { useTranslations } from "next-intl";

export function DisclaimerBanner({ variant = "default" }: { variant?: "default" | "compact" }) {
  const t = useTranslations("disclaimer");

  if (variant === "compact") {
    return (
      <p className="text-sm text-muted flex items-start gap-2">
        <FlaskIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>{t("short")}</span>
      </p>
    );
  }

  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground"
    >
      <FlaskIcon className="mt-0.5 size-5 shrink-0 text-primary" />
      <div>
        <p className="font-medium">{t("short")}</p>
        <p className="mt-1 text-muted">{t("long")}</p>
      </div>
    </div>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 3h6" />
      <path d="M10 3v6.2a2 2 0 0 1-.4 1.2L4.9 17.7A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.6-3.3l-4.7-7.3a2 2 0 0 1-.4-1.2V3" />
      <path d="M7.5 15h9" />
    </svg>
  );
}
