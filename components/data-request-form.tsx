"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  DATA_REQUEST_TYPES,
  dataRequestFormSchema,
  type DataRequestFormValues,
} from "@/lib/data-request-schema";
import { submitDataRequest } from "@/app/[locale]/data-request/actions";
import { Field, inputClass } from "@/components/form-field";

export function DataRequestForm() {
  const t = useTranslations("dataRequest");
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
    formState: { errors, isSubmitting },
  } = useForm<DataRequestFormValues>({
    resolver: zodResolver(dataRequestFormSchema),
    defaultValues: { type: "delete", email: "", phone: "", details: "", website: "" },
  });

  async function onSubmit(values: DataRequestFormValues) {
    setSubmitError(null);
    let result;
    try {
      result = await submitDataRequest({ ...values, locale });
    } catch {
      // The request never got an answer (offline, dropped connection): keep
      // what they typed and say so, rather than silently doing nothing.
      setSubmitError(tErrors("networkError"));
      return;
    }
    if (result.ok) {
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
        <h2 className="font-serif text-xl font-semibold uppercase tracking-wide text-navy">
          {t("successTitle")}
        </h2>
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
      <fieldset
        className="flex flex-col gap-1"
        aria-describedby={errors.type ? "request-type-error" : undefined}
      >
        <legend className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
          {t("typeLabel")}
        </legend>
        {DATA_REQUEST_TYPES.map((type) => (
          <label key={type} className="flex min-h-11 items-center gap-3 text-sm text-foreground">
            <input
              type="radio"
              value={type}
              {...register("type")}
              aria-describedby={errors.type ? "request-type-error" : undefined}
              className="size-4 shrink-0 accent-[var(--accent)]"
            />
            {t(`types.${type}`)}
          </label>
        ))}
        {errors.type && (
          <p id="request-type-error" className="status-in text-sm text-danger">
            {translateFieldError(errors.type.message)}
          </p>
        )}
      </fieldset>

      <Field
        label={t("emailLabel")}
        htmlFor="requestEmail"
        help={t("emailHelp")}
        error={translateFieldError(errors.email?.message)}
      >
        <input
          id="requestEmail"
          type="email"
          autoComplete="email"
          {...register("email")}
          className={inputClass}
        />
      </Field>

      <Field
        label={`${t("phoneLabel")} (${t("optional")})`}
        htmlFor="requestPhone"
        help={t("phoneHelp")}
      >
        <input
          id="requestPhone"
          type="tel"
          autoComplete="tel"
          {...register("phone")}
          className={inputClass}
        />
      </Field>

      <Field label={`${t("detailsLabel")} (${t("optional")})`} htmlFor="requestDetails">
        <textarea
          id="requestDetails"
          rows={3}
          {...register("details")}
          className={inputClass}
        />
      </Field>

      <div
        aria-hidden="true"
        className="absolute -start-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="requestWebsite">Website</label>
        <input
          id="requestWebsite"
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
