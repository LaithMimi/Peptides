"use client";

import {
  createContext,
  useActionState,
  useContext,
  useTransition,
  type ReactNode,
} from "react";
import { INITIAL_STATE, type ActionState } from "@/app/admin/actions/shared";

const FormStateContext = createContext<ActionState>(INITIAL_STATE);

export const adminInput =
  "min-h-11 w-full rounded-md border border-input-border bg-surface-raised px-3 py-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";
export const adminButton =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-6 py-2 font-serif text-xs font-semibold uppercase tracking-wide text-navy-foreground transition-opacity hover:opacity-90 disabled:opacity-50";
export const adminGhostButton =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-border-strong px-5 py-2 font-serif text-xs font-semibold uppercase tracking-wide text-navy transition-opacity hover:border-navy disabled:opacity-50";

/** Plain-English text for the short error codes actions return. */
export const ADMIN_ERRORS: Record<string, string> = {
  required: "This field is required.",
  tooLong: "This is too long.",
  taken: "This is already in use.",
  invalidSlug: "Use lowercase letters, numbers and single hyphens (2 to 60 characters).",
  invalidPrice: "Enter a price from 0.01 to 100,000.00, or leave it empty for no price.",
  invalidImageUrl: "Use an uploaded image or a file in /public (for example /products/name.jpeg).",
  tooManyImages: "A product can have at most 10 images.",
  invalidWhatsapp: "Enter digits with the country code, for example 972501234567.",
  invalidEmail: "Enter a valid email address.",
  defaultNotSupported: "The default language must be one of the supported languages.",
};

const CODE_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Your session has ended. Sign in again.",
  NOT_FOUND: "That item no longer exists.",
  VALIDATION: "Please fix the highlighted fields.",
  HAS_ORDERS: "This product has been ordered, so it cannot be deleted. Unpublish it instead.",
  INVALID_TRANSITION: "That status change is not allowed from the current status.",
  EMAIL_FAILED: "The email could not be sent. Check the email settings and try again.",
  INVALID_CREDENTIALS: "The email or password is incorrect.",
  LOCKED: "Too many failed attempts. Try again in 15 minutes.",
  RATE_LIMITED: "Too many attempts. Please wait a few minutes.",
};

export function errorMessage(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return ADMIN_ERRORS[code] ?? CODE_MESSAGES[code] ?? "Something went wrong. Please try again.";
}

/**
 * Form wrapper for admin Server Actions. Shows the result ("Saved" or the
 * problem) and passes field errors to `AdminField` children through context.
 */
export function AdminForm({
  action,
  submitLabel = "Save",
  children,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [, startTransition] = useTransition();

  return (
    <FormStateContext.Provider value={state}>
      {/*
        Submitted through onSubmit rather than the form `action` prop: React 19
        resets an uncontrolled form after an `action` finishes, which would wipe
        what the admin typed whenever validation fails.
      */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => formAction(data));
        }}
        className="flex flex-col gap-5"
      >
        {children}
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending} className={adminButton}>
            {pending ? "Saving…" : submitLabel}
          </button>
          <div role="status" aria-live="polite" className="text-sm">
            {state.ok && <span className="font-semibold text-navy">Saved.</span>}
            {!state.ok && state.code && !state.fieldErrors && (
              <span className="text-danger">{errorMessage(state.code)}</span>
            )}
            {!state.ok && state.fieldErrors && (
              <span className="text-danger">{errorMessage("VALIDATION")}</span>
            )}
          </div>
        </div>
      </form>
    </FormStateContext.Provider>
  );
}

/** A labelled field; shows the error for `name` from the surrounding `AdminForm`. */
export function AdminField({
  name,
  label,
  help,
  children,
}: {
  name: string;
  label: string;
  help?: string;
  children: ReactNode;
}) {
  const state = useContext(FormStateContext);
  const code = state.fieldErrors?.[name];
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
        {label}
      </label>
      {children}
      {help && !code && <p className="text-xs text-muted">{help}</p>}
      {code && (
        <p role="alert" className="text-sm text-danger">
          {errorMessage(code)}
        </p>
      )}
    </div>
  );
}
