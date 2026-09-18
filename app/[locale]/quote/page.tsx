import { setRequestLocale } from "next-intl/server";
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

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <DisclaimerBanner />
      <QuoteSummary showLink={false} />
      <QuoteForm />
    </div>
  );
}
