import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSessionPhone } from "@/lib/session";
import { QuoteSummary } from "@/components/quote-summary";
import { QuoteForm } from "@/components/quote-form";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sessionPhone = await getSessionPhone();
  const t = await getTranslations("nav");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <h1 className="sr-only">{t("quote")}</h1>
      <DisclaimerBanner />
      <QuoteSummary showLink={false} />
      <QuoteForm sessionPhone={sessionPhone} />
    </div>
  );
}
