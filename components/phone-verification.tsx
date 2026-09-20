"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { LtrValue } from "@/components/ltr-value";
import {
  Field,
  inputClass,
  secondaryButtonClass as buttonClass,
} from "@/components/form-field";
import {
  sendPhoneCode,
  verifyPhoneCode,
} from "@/app/[locale]/quote/otp-actions";

type Status = "idle" | "sending" | "codeSent" | "verifying" | "verified";

/**
 * Phone number + one-time code. A correct code makes the server set the
 * session cookie; `onSignedIn` then lets the parent navigate onward.
 */
export function PhoneVerification({
  locale,
  onSignedIn,
}: {
  locale: Locale;
  onSignedIn: (phone: string) => void;
}) {
  const t = useTranslations("quoteForm");
  const tSignIn = useTranslations("signIn");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [workingPhone, setWorkingPhone] = useState("");

  const trimmedPhone = phone.trim();

  // Editing the number after a code was sent drops back to the first step
  // (derived, not reset in an effect).
  const stale =
    (status === "codeSent" || status === "verifying") &&
    trimmedPhone !== workingPhone;
  const effectiveStatus: Status = stale ? "idle" : status;

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleSend() {
    setError(null);
    const resumeStatus: Status =
      stale || !normalizedPhone ? "idle" : "codeSent";
    setStatus("sending");
    const result = await sendPhoneCode({ phone: trimmedPhone, locale });
    if (!result.ok) {
      setError(result.error.message);
      setStatus(resumeStatus);
      return;
    }
    setNormalizedPhone(result.phone);
    setWorkingPhone(trimmedPhone);
    setCode("");
    setCooldown(result.resendAfterSeconds);
    setStatus("codeSent");
  }

  async function handleVerify() {
    setError(null);
    setStatus("verifying");
    const result = await verifyPhoneCode({
      phone: trimmedPhone,
      code,
      locale,
    });
    if (!result.ok) {
      setError(result.error.message);
      setStatus("codeSent");
      return;
    }
    setStatus("verified");
    onSignedIn(result.phone);
  }

  const busy = effectiveStatus === "sending" || effectiveStatus === "verifying";
  const codeStep =
    effectiveStatus === "codeSent" || effectiveStatus === "verifying";

  const verified = effectiveStatus === "verified";

  return (
    <div className="flex flex-col gap-4">
      {/* Always mounted so the announcement is reliably read out. */}
      <p
        role="status"
        className={verified ? "text-sm font-semibold text-accent" : "sr-only"}
      >
        {verified ? `✓ ${t("phoneVerified")}` : ""}
      </p>

      {!verified && (
        <>
          <Field
            label={tSignIn("phoneLabel")}
            htmlFor="signInPhone"
            help={tSignIn("phoneHelp")}
          >
            <input
              id="signInPhone"
              type="tel"
              dir="ltr"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </Field>

          {!codeStep && (
            <button
              type="button"
              onClick={handleSend}
              disabled={busy || trimmedPhone.length === 0}
              className={buttonClass}
            >
              {effectiveStatus === "sending" ? t("sendingCode") : t("sendCode")}
            </button>
          )}

          {codeStep && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">
                {t("codeSentTo")} <LtrValue>{normalizedPhone}</LtrValue>
              </p>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="phoneCode"
                  className="font-mono text-xs font-semibold uppercase tracking-widest text-muted"
                >
                  {t("codeLabel")}
                </label>
                <input
                  id="phoneCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  dir="ltr"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (code.length === 6 && !busy) void handleVerify();
                    }
                  }}
                  className="min-h-11 w-40 rounded-md border border-input-border bg-surface-raised px-3 py-2 font-mono tracking-widest text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={busy || code.length !== 6}
                  className={buttonClass}
                >
                  {effectiveStatus === "verifying"
                    ? t("verifyingCode")
                    : t("verifyCode")}
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={busy || cooldown > 0}
                  className={buttonClass}
                >
                  {cooldown > 0
                    ? t("resendIn", { seconds: cooldown })
                    : t("resendCode")}
                </button>
              </div>
            </div>
          )}

          {error && !stale && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
