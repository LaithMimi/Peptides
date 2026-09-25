"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import type { z } from "zod";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";
import { customerFormSchema } from "@/lib/schemas/order";
import { clearDraft, readDraft, writeDraft } from "@/lib/checkout-draft";
import { placeOrderAction } from "@/app/[locale]/checkout/actions";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { Field, inputClass, secondaryButtonClass } from "@/components/form-field";
import { CartLines } from "@/components/store/cart-lines";
import { OrderSummary } from "@/components/store/order-summary";
import { usePricedCart } from "@/components/store/use-priced-cart";

type FormInput = z.input<typeof customerFormSchema>;
type FormOutput = z.output<typeof customerFormSchema>;

const FORM_FIELDS = [
  "customerName",
  "customerPhone",
  "deliveryAddress",
  "notes",
  "acknowledged",
] as const;

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as "en" | "ar";
  const router = useRouter();
  const { items } = useCart();
  const cart = usePricedCart();
  // One key per checkout visit: retrying after a lost response returns the same
  // order instead of creating a second one.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [priceChanged, setPriceChanged] = useState(false);

  const errorText = (code?: string) =>
    !code ? undefined : tErrors.has(code) ? tErrors(code) : tErrors("genericSubmit");

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      deliveryAddress: "",
      notes: "",
      acknowledged: false,
    },
  });

  // Restore what was typed before a language switch or reload, and keep saving it.
  useEffect(() => {
    const draft = readDraft();
    if (draft) reset({ ...draft, notes: "", acknowledged: false });
  }, [reset]);
  useEffect(() => {
    const subscription = watch((values) => writeDraft(values));
    return () => subscription.unsubscribe();
  }, [watch]);

  async function onSubmit(values: FormOutput) {
    setSubmitError(null);
    setPriceChanged(false);
    let result;
    try {
      result = await placeOrderAction({
        ...values,
        // The form schema only lets a checked box through; the server re-checks.
        acknowledged: true,
        idempotencyKey,
        locale,
        items,
        // Only used by the server to notice a price change; never as the total.
        expectedTotalMinor: cart.totals.totalMinor,
      });
    } catch {
      setSubmitError(tErrors("networkError"));
      return;
    }

    if (result.ok) {
      clearDraft();
      router.push({
        pathname: `/order/${result.orderNumber}`,
        query: { t: result.accessToken },
      });
      return;
    }

    switch (result.code) {
      case "VALIDATION": {
        let shown = false;
        for (const field of FORM_FIELDS) {
          const code = result.fieldErrors?.[field];
          if (code) {
            setError(field, { message: code });
            shown = true;
          }
        }
        if (!shown) setSubmitError(errorText(Object.values(result.fieldErrors ?? {})[0]) ?? tErrors("genericSubmit"));
        return;
      }
      case "PRICE_CHANGED":
        if (result.cart) cart.adopt(result.cart);
        setPriceChanged(true);
        return;
      case "ITEM_UNPRICED":
      case "ITEM_UNAVAILABLE":
        cart.retry();
        setSubmitError(tErrors(result.code === "ITEM_UNPRICED" ? "itemUnpriced" : "itemUnavailable"));
        return;
      case "EMPTY_CART":
        setSubmitError(tErrors("emptyCart"));
        return;
      case "RATE_LIMITED":
        setSubmitError(tErrors("rateLimited"));
        return;
      default:
        setSubmitError(tErrors("genericSubmit"));
    }
  }

  if (cart.empty) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border-strong px-6 py-12 text-center">
        <h2 className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
          {t("emptyTitle")}
        </h2>
        <p className="text-muted">{t("emptyBody")}</p>
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-6 py-2 font-serif text-sm font-semibold uppercase tracking-wide text-navy-foreground hover:opacity-90"
        >
          {tCart("browse")}
        </Link>
      </div>
    );
  }

  const blocked = cart.lines.some((l) => !l.pending && l.status !== "ok");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_24rem] lg:items-start"
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4" aria-labelledby="checkout-details">
          <h2
            id="checkout-details"
            className="font-serif text-lg font-semibold uppercase tracking-wide text-navy"
          >
            {t("detailsTitle")}
          </h2>

          <Field label={t("nameLabel")} htmlFor="customerName" error={errorText(errors.customerName?.message)}>
            <input
              id="customerName"
              type="text"
              autoComplete="name"
              {...register("customerName")}
              className={inputClass}
            />
          </Field>

          <Field
            label={t("phoneLabel")}
            htmlFor="customerPhone"
            help={t("phoneHelp")}
            error={errorText(errors.customerPhone?.message)}
          >
            <input
              id="customerPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              {...register("customerPhone")}
              className={inputClass}
            />
          </Field>

          <Field
            label={t("addressLabel")}
            htmlFor="deliveryAddress"
            help={t("addressHelp")}
            error={errorText(errors.deliveryAddress?.message)}
          >
            <textarea
              id="deliveryAddress"
              rows={3}
              autoComplete="street-address"
              {...register("deliveryAddress")}
              className={inputClass}
            />
          </Field>

          <Field
            label={`${t("notesLabel")} (${t("optional")})`}
            htmlFor="notes"
            error={errorText(errors.notes?.message)}
          >
            <textarea id="notes" rows={2} {...register("notes")} className={inputClass} />
          </Field>
        </section>

        <section
          aria-labelledby="checkout-payment"
          className="rounded-xl border-2 border-dashed border-border-strong p-4"
        >
          <h2
            id="checkout-payment"
            className="font-serif text-lg font-semibold uppercase tracking-wide text-navy"
          >
            {t("paymentTitle")}
          </h2>
          <p className="mt-1 text-foreground">{t("paymentBody")}</p>
        </section>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-6">
        <h2 className="font-serif text-lg font-semibold uppercase tracking-wide text-navy">
          {t("reviewTitle")}
        </h2>

        {cart.status === "error" && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg bg-danger-bg p-4 text-danger">
            <p className="flex-1">{tCart("loadFailed")}</p>
            <button type="button" onClick={cart.retry} className={secondaryButtonClass}>
              {tCart("retry")}
            </button>
          </div>
        )}

        {blocked && (
          <div role="alert" className="rounded-lg border-2 border-dashed border-border-strong p-4">
            <p className="font-serif text-sm font-semibold uppercase tracking-wide text-navy">
              {tCart("blockedTitle")}
            </p>
            <p className="mt-1 text-sm text-muted">{tCart("blockedBody")}</p>
            <Link href="/cart" className={`${secondaryButtonClass} mt-3`}>
              {t("backToCart")}
            </Link>
          </div>
        )}

        {priceChanged && (
          <div role="alert" className="rounded-lg border-2 border-navy p-4">
            <p className="font-serif text-sm font-semibold uppercase tracking-wide text-navy">
              {t("priceChangedTitle")}
            </p>
            <p className="mt-1 text-sm text-foreground">{t("priceChangedBody")}</p>
          </div>
        )}

        <CartLines lines={cart.lines} maxQuantity={cart.maxLineQuantity} editable={false} />
        <OrderSummary totals={cart.totals} />
        <p className="text-sm text-muted">{tCart("cashOnDelivery")}</p>

        <DisclaimerBanner />

        <label className="flex min-h-11 items-start gap-3 py-1 text-sm text-foreground">
          <input
            type="checkbox"
            {...register("acknowledged")}
            className="mt-1 size-5 shrink-0 rounded border-input-border text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          />
          <span>{t("ackLabel")}</span>
        </label>
        {errors.acknowledged && (
          <p role="alert" className="-mt-2 text-sm text-danger">
            {errorText(errors.acknowledged.message)}
          </p>
        )}

        {submitError && (
          <p role="alert" className="rounded-md bg-danger-bg px-4 py-3 text-sm text-danger">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !cart.canCheckout}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? t("confirming") : t("confirm")}
        </button>
        <Link href="/cart" className={secondaryButtonClass}>
          {t("backToCart")}
        </Link>
      </div>
    </form>
  );
}
