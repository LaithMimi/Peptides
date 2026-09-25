import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { CartView } from "@/components/store/cart-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return pageMetadata({ title: t("title"), path: "/cart", locale, noindex: true });
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cart");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy sm:text-4xl">
        {t("title")}
      </h1>
      <CartView />
    </div>
  );
}
