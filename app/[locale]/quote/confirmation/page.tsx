import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function QuoteConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("confirmation");

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border-strong py-14 text-center">
      <div
        className="flex size-20 -rotate-6 items-center justify-center rounded-full border-4 border-double border-accent text-accent"
        aria-hidden="true"
      >
        <CheckIcon className="size-8" />
      </div>
      <h1 className="font-serif text-2xl font-semibold uppercase tracking-wide text-navy">
        {t("title")}
      </h1>
      <p className="max-w-sm text-muted">{t("body")}</p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-navy px-6 py-2.5 font-serif text-sm font-semibold uppercase tracking-wide text-navy-foreground transition-opacity hover:opacity-90"
      >
        {t("backToCatalog")}
      </Link>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
