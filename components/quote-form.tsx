"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
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
import { signOut } from "@/app/[locale]/quote/otp-actions";
import {
  clearDraft,
  clearProfile,
  readProfile,
  takeDraft,
  writeDraft,
  writeProfile,
} from "@/lib/quote-storage";
import { Field, inputClass } from "@/components/form-field";
import { LtrValue } from "@/components/ltr-value";
import { LegalNote } from "@/components/legal-note";
import { hasOptionalConsent } from "@/lib/consent";

const emptyValues = {
  customerName: "",
  customerEmail: "",
  shippingAddress: "",
  notes: "",
  website: "",
};

const noAck = undefined as unknown as true;

const buttonClass =
  "inline-flex w-fit items-center justify-center rounded-full border border-border-strong px-4 py-2 font-serif text-xs font-semibold uppercase tracking-wide text-navy transition-opacity hover:opacity-80 disabled:opacity-50";

export function QuoteForm({ sessionPhone }: { sessionPhone: string | null }) {
  const t = useTranslations("quoteForm");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { items, clear } = useCart();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [detailsCleared, setDetailsCleared] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const restored = useRef(false);

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
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<QuoteContactFormValues>({
    resolver: zodResolver(quoteContactFormSchema),
    defaultValues: { ...emptyValues, ageAndResearchUseAck: noAck },
  });

  // Restore what the visitor had typed before being sent to sign in (the
  // draft wins), then fill any still-empty field from the remembered
  // details — but only for a signed-in visitor whose session phone owns that
  // profile. The ref keeps React StrictMode's double effect from consuming
  // the draft twice.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const draft = takeDraft();
    const profile = sessionPhone && hasOptionalConsent() ? readProfile() : null;
    const saved = profile && profile.phone === sessionPhone ? profile : null;
    if (!draft && !saved) return;
    const pick = (
      typed: string | null | undefined,
      remembered: string | null | undefined
    ) => (typed && typed.trim() ? typed : (remembered ?? ""));
    reset({
      ...emptyValues,
      customerName: pick(draft?.customerName, saved?.customerName),
      customerEmail: pick(draft?.customerEmail, saved?.customerEmail),
      shippingAddress: pick(draft?.shippingAddress, saved?.shippingAddress),
      notes: draft?.notes ?? "",
      ageAndResearchUseAck: noAck,
    });
  }, [sessionPhone, reset]);

  function goToSignIn(values: QuoteContactFormValues) {
    // Never the acknowledgment: it must be given afresh on every submission.
    writeDraft({
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      shippingAddress: values.shippingAddress,
      notes: values.notes ?? null,
    });
    router.push("/signin");
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    clearProfile();
    clearDraft();
    reset({ ...emptyValues, ageAndResearchUseAck: noAck });
    setDetailsCleared(false);
    router.refresh();
    setSigningOut(false);
  }

  function handleClearDetails() {
    clearProfile();
    reset({ ...emptyValues, ageAndResearchUseAck: noAck });
    setDetailsCleared(true);
  }

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

    if (!sessionPhone) {
      goToSignIn(values);
      return;
    }

    const result = await submitQuoteRequest({
      ...values,
      lineItems: items,
      locale,
    });

    if (result.ok) {
      // Remembering details is optional storage: only with the visitor's
      // consent from the cookie notice.
      if (hasOptionalConsent()) {
        writeProfile({
          phone: sessionPhone,
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          shippingAddress: values.shippingAddress,
        });
      }
      clearDraft();
      clear();
      router.push("/quote/confirmation");
      return;
    }

    // The session expired or was ended elsewhere: keep what was typed and
    // send the visitor back through sign-in.
    if (result.error.code === "NOT_SIGNED_IN") {
      goToSignIn(getValues());
      return;
    }

    if (result.error.code === "VALIDATION_ERROR" && result.error.fieldErrors) {
      const knownFieldPaths = new Set([
        "customerName",
        "customerEmail",
        "shippingAddress",
        "notes",
        "ageAndResearchUseAck",
      ]);
      for (const [field, message] of Object.entries(result.error.fieldErrors)) {
        if (knownFieldPaths.has(field)) {
          setError(field as FieldPath<QuoteContactFormValues>, { message });
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

      {sessionPhone ? (
        <div className="flex flex-col gap-3 rounded-md border border-dashed border-border-strong px-4 py-3">
          <p role="status" className="text-sm font-semibold text-accent">
            <span aria-hidden="true">✓ </span>
            {t("signedInAs")} <LtrValue>{sessionPhone}</LtrValue>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className={buttonClass}
            >
              {t("signOut")}
            </button>
            <button
              type="button"
              onClick={handleClearDetails}
              className={buttonClass}
            >
              {t("clearDetails")}
            </button>
          </div>
          {detailsCleared && (
            <p role="status" className="text-sm text-muted">
              {t("detailsCleared")}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">{t("phoneVerifiedOnSubmit")}</p>
      )}

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
        label={t("addressLabel")}
        htmlFor="shippingAddress"
        help={t("addressHelp")}
        error={translateFieldError(errors.shippingAddress?.message)}
      >
        <input
          id="shippingAddress"
          type="text"
          autoComplete="street-address"
          {...register("shippingAddress")}
          className={inputClass}
        />
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

      <div
        aria-hidden="true"
        className="absolute -start-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

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

      <LegalNote purpose="quote" />

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
