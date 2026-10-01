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
      <header>
        <h1 className="text-balance font-serif text-4xl font-semibold uppercase leading-[1.02] tracking-tight text-navy sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
      </header>
      <CartView />
    </div>
  );
}
