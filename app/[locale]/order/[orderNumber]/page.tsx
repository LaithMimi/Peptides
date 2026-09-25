import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getOrderForConfirmation } from "@/lib/orders";
import { formatMoney } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { LtrValue } from "@/components/ltr-value";
import { ClearCartOnMount } from "@/components/store/clear-cart-on-mount";

type Props = {
  params: Promise<{ locale: string; orderNumber: string }>;
  searchParams: Promise<{ t?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, orderNumber } = await params;
  const t = await getTranslations({ locale, namespace: "confirmation" });
  return pageMetadata({
    title: t("title"),
    path: `/order/${orderNumber}`,
    locale,
    noindex: true,
  });
}

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const { locale, orderNumber } = await params;
  setRequestLocale(locale);
  const { t: token } = await searchParams;
  // The secret token in the link is required: an order number alone shows nothing.
  const data = await getOrderForConfirmation(orderNumber, token);
  if (!data) notFound();

  const { order, items } = data;
  const t = await getTranslations("confirmation");
  const tCart = await getTranslations("cart");
  const format = await getFormatter();
  const money = (minor: number) => (
    <bdi dir="ltr" className="font-mono">
      {formatMoney(minor, locale)}
    </bdi>
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <ClearCartOnMount />
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-border-strong p-6 text-center">
        <h1 className="font-serif text-3xl font-semibold uppercase tracking-wide text-navy">
          {t("title")}
        </h1>
        <p className="text-foreground">{t("body", { name: order.customerName })}</p>
        <p className="font-mono text-sm uppercase tracking-widest text-muted">
          {t("orderNumber")}: <LtrValue className="font-semibold text-navy">{order.orderNumber}</LtrValue>
        </p>
        <p className="text-sm text-muted">
          {format.dateTime(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>

      <section aria-labelledby="order-items" className="flex flex-col gap-3">
        <h2
          id="order-items"
          className="font-serif text-lg font-semibold uppercase tracking-wide text-navy"
        >
          {t("itemsTitle")}
        </h2>
        <ul className="flex flex-col divide-y divide-dashed divide-border-strong rounded-xl border border-border-strong bg-surface">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 p-3">
              <div className="min-w-0">
                <p className="font-serif font-semibold uppercase tracking-wide text-navy">
                  {item.productNameSnapshot}
                </p>
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  {item.brandNameSnapshot}
                  {item.vialSizeSnapshot && (
                    <>
                      {" · "}
                      <LtrValue>{item.vialSizeSnapshot}</LtrValue>
                    </>
                  )}
                  {" · "}×{item.quantity}
                </p>
              </div>
              <span className="text-navy">{money(item.lineTotalMinor)}</span>
            </li>
          ))}
        </ul>

        <dl className="flex flex-col gap-2 rounded-xl border border-border-strong bg-surface-raised p-4">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{tCart("subtotal")}</dt>
            <dd>{money(order.subtotalMinor)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{tCart("deliveryFee")}</dt>
            <dd>
              {order.deliveryFeeMinor === 0 ? tCart("freeDelivery") : money(order.deliveryFeeMinor)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-dashed border-border-strong pt-2">
            <dt className="font-serif font-semibold uppercase tracking-wide text-navy">
              {tCart("total")}
            </dt>
            <dd className="text-lg font-semibold text-navy">{money(order.totalMinor)}</dd>
          </div>
        </dl>
      </section>

      <dl className="grid grid-cols-1 gap-4 rounded-xl border border-border-strong bg-surface p-4 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
            {t("payment")}
          </dt>
          <dd className="mt-1 text-foreground">{t("paymentValue")}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
            {t("deliveryTo")}
          </dt>
          <dd className="mt-1 whitespace-pre-line text-foreground">{order.deliveryAddress}</dd>
        </div>
      </dl>

      <DisclaimerBanner />

      <Link
        href="/shop"
        className="inline-flex min-h-11 w-fit items-center justify-center self-center rounded-full bg-navy px-6 py-2 font-serif text-sm font-semibold uppercase tracking-wide text-navy-foreground hover:opacity-90"
      >
        {t("continueShopping")}
      </Link>
    </div>
  );
}
