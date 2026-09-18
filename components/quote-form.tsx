"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useCart } from "@/lib/cart-store";
import {
  quoteContactFormSchema,
  type QuoteContactFormValues,
} from "@/lib/quote-schema";
import { submitQuoteRequest } from "@/app/[locale]/quote/actions";

export function QuoteForm() {
  const t = useTranslations("quoteForm");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { items, clear } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Both the client-side Zod schema and the server action's field errors
  // use short codes ("required", "invalidEmail", "ackRequired", ...) as
  // their `message`, so every error string rendered below must be passed
  // through this before it reaches the page — otherwise the raw code
  // leaks into the UI untranslated.
  const knownErrorCodes = new Set([
    "required",
    "invalidEmail",
    "emptyCart",
    "ackRequired",
  ]);
  function translateFieldError(message: string | undefined): string | undefined {
    if (!message) return undefined;
    return knownErrorCodes.has(message) ? tErrors(message) : message;
  }

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuoteContactFormValues>({
    resolver: zodResolver(quoteContactFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      country: "",
      notes: "",
      ageAndResearchUseAck: undefined as unknown as true,
    },
  });

  // The quote-cart summary above this form already shows the "empty" state
  // with a link back to the catalog (see components/quote-summary.tsx), so
  // the form itself simply doesn't render when there's nothing to submit.
  if (items.length === 0) {
    return null;
  }

  async function onSubmit(values: QuoteContactFormValues) {
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError(tErrors("emptyCart"));
      return;
    }

    const result = await submitQuoteRequest({
      ...values,
      lineItems: items,
      locale,
    });

    if (result.ok) {
      clear();
      router.push("/quote/confirmation");
      return;
    }

    if (result.error.code === "VALIDATION_ERROR" && result.error.fieldErrors) {
      const formFields = new Set<keyof QuoteContactFormValues>([
        "customerName",
        "customerEmail",
        "customerPhone",
        "country",
        "notes",
        "ageAndResearchUseAck",
      ]);
      for (const [field, message] of Object.entries(result.error.fieldErrors)) {
        if (formFields.has(field as keyof QuoteContactFormValues)) {
          setError(field as keyof QuoteContactFormValues, { message });
        }
      }
    }
    setSubmitError(result.error.message);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-border-strong bg-surface p-5 sm:p-6"
    >
      <div>
        <h2 className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-muted">{t("intro")}</p>
      </div>

      <Field
        label={t("nameLabel")}
        htmlFor="customerName"
        error={translateFieldError(errors.customerName?.message)}
      >
        <input
          id="customerName"
          type="text"
          {...register("customerName")}
          className={inputClass}
        />
      </Field>

      <Field
        label={t("emailLabel")}
        htmlFor="customerEmail"
        error={translateFieldError(errors.customerEmail?.message)}
      >
        <input
          id="customerEmail"
          type="email"
          {...register("customerEmail")}
          className={inputClass}
        />
      </Field>

      <Field
        label={`${t("phoneLabel")} (${t("phoneOptional")})`}
        htmlFor="customerPhone"
        error={translateFieldError(errors.customerPhone?.message)}
      >
        <input
          id="customerPhone"
          type="tel"
          {...register("customerPhone")}
          className={inputClass}
        />
      </Field>

      <Field
        label={t("countryLabel")}
        htmlFor="country"
        help={t("countryHelp")}
        error={translateFieldError(errors.country?.message)}
      >
        <input id="country" type="text" {...register("country")} className={inputClass} />
      </Field>

      <Field
        label={`${t("notesLabel")} (${t("notesOptional")})`}
        htmlFor="notes"
        error={translateFieldError(errors.notes?.message)}
      >
        <textarea
          id="notes"
          rows={3}
          placeholder={t("notesPlaceholder")}
          {...register("notes")}
          className={inputClass}
        />
      </Field>

      <label className="flex items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          {...register("ageAndResearchUseAck")}
          className="mt-1 size-4 shrink-0 rounded border-border-strong text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        />
        <span>{t("ackLabel")}</span>
      </label>
      {errors.ageAndResearchUseAck && (
        <p role="alert" className="-mt-3 text-sm text-danger">
          {translateFieldError(errors.ageAndResearchUseAck.message)}
        </p>
      )}

      {submitError && (
        <p role="alert" className="rounded-md bg-danger-bg px-4 py-3 text-sm text-danger">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-fit items-center justify-center rounded-full bg-accent px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-border-strong bg-surface-raised px-3 py-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

function Field({
  label,
  htmlFor,
  help,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="font-mono text-xs font-semibold uppercase tracking-widest text-muted"
      >
        {label}
      </label>
      {children}
      {help && !error && <p className="text-xs text-muted">{help}</p>}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
