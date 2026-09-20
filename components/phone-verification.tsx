"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { LtrValue } from "@/components/ltr-value";
import {
  sendPhoneCode,
  verifyPhoneCode,
} from "@/app/[locale]/quote/otp-actions";

type Status = "idle" | "sending" | "codeSent" | "verifying" | "verified";

const buttonClass =
  "inline-flex w-fit items-center justify-center rounded-full border border-border-strong px-4 py-2 font-serif text-xs font-semibold uppercase tracking-wide text-navy transition-opacity hover:opacity-80 disabled:opacity-50";

export function PhoneVerification({
  phone,
  locale,
  onVerified,
  onReset,
}: {
  phone: string;
  locale: Locale;
  onVerified: (token: string, expiresAt: string, phone: string) => void;
  onReset: () => void;
}) {
  const t = useTranslations("quoteForm");
  const [status, setStatus] = useState<Status>("idle");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [workingPhone, setWorkingPhone] = useState("");
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmedPhone = phone.trim();

  function reset() {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    setStatus("idle");
    setCode("");
    setError(null);
    setCooldown(0);
    setNormalizedPhone("");
    setWorkingPhone("");
    onReset();
  }

  // Editing the number after a code was sent or verified drops back to the
  // idle step (derived, not reset in an effect); the parent only honors a
  // token issued for the exact number currently in the field.
  const stale = status !== "idle" && trimmedPhone !== workingPhone;
  const effectiveStatus: Status = stale ? "idle" : status;

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(
    () => () => {
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
    },
    []
  );

  async function handleSend() {
    setError(null);
    const resumeStatus: Status = stale || !normalizedPhone ? "idle" : "codeSent";
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
    const msUntilExpiry = new Date(result.expiresAt).getTime() - Date.now();
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    expiryTimer.current = setTimeout(reset, Math.max(0, msUntilExpiry));
    onVerified(result.token, result.expiresAt, trimmedPhone);
  }

  if (effectiveStatus === "verified") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p role="status" className="text-sm font-semibold text-accent">
          <span aria-hidden="true">✓ </span>
          {t("phoneVerified")}
        </p>
        <button type="button" onClick={reset} className={buttonClass}>
          {t("changeNumber")}
        </button>
      </div>
    );
  }

  const busy = effectiveStatus === "sending" || effectiveStatus === "verifying";
  const codeStep =
    effectiveStatus === "codeSent" || effectiveStatus === "verifying";

  return (
    <div className="flex flex-col gap-3">
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
              className="w-40 rounded-md border border-border-strong bg-surface-raised px-3 py-2 font-mono tracking-widest text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
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
    </div>
  );
}
