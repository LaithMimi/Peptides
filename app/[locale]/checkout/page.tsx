import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { CheckoutForm } from "@/components/store/checkout-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return pageMetadata({ title: t("title"), path: "/checkout", locale, noindex: true });
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy sm:text-4xl">
        {t("title")}
      </h1>
      <CheckoutForm />
    </div>
  );
}
