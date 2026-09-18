"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  feedbackContactFormSchema,
  type FeedbackContactFormValues,
} from "@/lib/feedback-schema";
import { submitFeedback } from "@/app/[locale]/feedback/actions";
import { Field, inputClass } from "@/components/form-field";

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
    resolver: zodResolver(feedbackContactFormSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onSubmit(values: FeedbackContactFormValues) {
    setSubmitError(null);
    const result = await submitFeedback({ ...values, locale });
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
        className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-border-strong p-6"
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
          {...register("email")}
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
          {...register("message")}
          className={inputClass}
        />
      </Field>

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
