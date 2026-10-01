"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import type { FeedbackContactFormValues } from "@/lib/feedback-schema";
import { submitFeedback } from "@/app/[locale]/feedback/actions";
import { Field, inputClass } from "@/components/form-field";
import { LegalNote } from "@/components/legal-note";

// This form sits at the bottom of the homepage, so it validates with plain
// react-hook-form rules instead of zodResolver: pulling Zod into the client
// cost the homepage ~40 KB gzipped of JavaScript for two checks. The server
// action still validates the full feedbackSchema, which stays the source of
// truth. Same regex as Zod's z.email(), same error codes.
const EMAIL =
  /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

export function FeedbackForm() {
  const t = useTranslations("feedback");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const knownErrorCodes = new Set(["required", "invalidEmail"]);
  function translateFieldError(message: string | undefined): string | undefined {
    if (!message) return undefined;
    return knownErrorCodes.has(message) ? tErrors(message) : message;
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackContactFormValues>({
    defaultValues: { name: "", email: "", message: "", website: "" },
  });

  async function onSubmit(values: FeedbackContactFormValues) {
    setSubmitError(null);
    let result;
    try {
      result = await submitFeedback({ ...values, locale });
    } catch {
      // The request never got an answer (offline, dropped connection): keep
      // what they typed and say so, rather than silently doing nothing.
      setSubmitError(tErrors("networkError"));
      return;
    }
    if (result.ok) {
      reset();
      setSent(true);
      return;
    }
    setSubmitError(result.message);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col gap-2 rounded-xl border border-border-strong bg-surface-raised p-6"
      >
        <h3 className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
          {t("successTitle")}
        </h3>
        <p className="text-muted">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-border-strong bg-surface p-5 sm:p-6"
    >
      <Field
        label={`${t("nameLabel")} (${t("nameOptional")})`}
        htmlFor="feedbackName"
        error={translateFieldError(errors.name?.message)}
      >
        <input
          id="feedbackName"
          type="text"
          autoComplete="name"
          {...register("name")}
          className={inputClass}
        />
      </Field>

      <Field
        label={t("emailLabel")}
        htmlFor="feedbackEmail"
        error={translateFieldError(errors.email?.message)}
      >
        <input
          id="feedbackEmail"
          type="email"
          autoComplete="email"
          {...register("email", {
            validate: (v) => EMAIL.test(v.trim()) || "invalidEmail",
          })}
          className={inputClass}
        />
      </Field>

      <Field
        label={t("messageLabel")}
        htmlFor="feedbackMessage"
        error={translateFieldError(errors.message?.message)}
      >
        <textarea
          id="feedbackMessage"
          rows={4}
          placeholder={t("messagePlaceholder")}
          {...register("message", {
            validate: (v) => v.trim().length > 0 || "required",
          })}
          className={inputClass}
        />
      </Field>

      <LegalNote purpose="feedback" />

      <div
        aria-hidden="true"
        className="absolute -start-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="feedbackWebsite">Website</label>
        <input
          id="feedbackWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {submitError && (
        <p role="alert" className="rounded-md bg-danger-bg px-4 py-3 text-sm text-danger">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="btn-glass inline-flex w-fit items-center justify-center rounded-full px-6 py-3 font-serif text-sm font-semibold uppercase tracking-wide disabled:opacity-60"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
