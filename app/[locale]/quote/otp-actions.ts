"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { parsePhone } from "@/lib/phone";
import { checkRateLimit, otpLimits } from "@/lib/rate-limit";
import { checkVerification, startVerification } from "@/lib/otp";
import { signPhoneToken } from "@/lib/phone-token";
import type {
  SendPhoneCodeResult,
  VerifyPhoneCodeResult,
} from "@/types/catalog";

const RESEND_AFTER_SECONDS = 60;

async function getClientIp(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function sendPhoneCode(input: {
  phone: string;
  locale: "en" | "ar";
}): Promise<SendPhoneCodeResult> {
  const locale = input.locale === "ar" ? "ar" : "en";
  const t = await getTranslations({ locale, namespace: "errors" });
  const ip = await getClientIp();

  if (!checkRateLimit(`otp-send-ip:${ip}`, otpLimits.sendPerIp())) {
    return {
      ok: false,
      error: { code: "RATE_LIMITED", message: t("otpRateLimited") },
    };
  }

  const phone = parsePhone(String(input.phone ?? ""));
  if (!phone) {
    return {
      ok: false,
      error: { code: "INVALID_PHONE", message: t("invalidPhone") },
    };
  }

  if (!checkRateLimit(`otp-send-phone:${phone}`, otpLimits.sendPerPhone())) {
    return {
      ok: false,
      error: { code: "RATE_LIMITED", message: t("otpRateLimited") },
    };
  }

  const result = await startVerification(phone, locale);
  if (result !== "ok") {
    return {
      ok: false,
      error: { code: "SEND_FAILED", message: t("otpSendFailed") },
    };
  }

  return { ok: true, phone, resendAfterSeconds: RESEND_AFTER_SECONDS };
}

export async function verifyPhoneCode(input: {
  phone: string;
  code: string;
  locale: "en" | "ar";
}): Promise<VerifyPhoneCodeResult> {
  const locale = input.locale === "ar" ? "ar" : "en";
  const t = await getTranslations({ locale, namespace: "errors" });
  const ip = await getClientIp();

  if (!checkRateLimit(`otp-check-ip:${ip}`, otpLimits.checkPerIp())) {
    return {
      ok: false,
      error: { code: "RATE_LIMITED", message: t("otpRateLimited") },
    };
  }

  const phone = parsePhone(String(input.phone ?? ""));
  const code = String(input.code ?? "").trim();
  if (!phone || !/^\d{6}$/.test(code)) {
    return {
      ok: false,
      error: { code: "INVALID_CODE", message: t("otpInvalidCode") },
    };
  }

  const result = await checkVerification(phone, code);
  if (result === "invalid") {
    return {
      ok: false,
      error: { code: "INVALID_CODE", message: t("otpInvalidCode") },
    };
  }
  if (result === "expired") {
    return {
      ok: false,
      error: { code: "CODE_EXPIRED", message: t("otpCodeExpired") },
    };
  }
  if (result === "error") {
    return {
      ok: false,
      error: { code: "VERIFY_FAILED", message: t("otpVerifyFailed") },
    };
  }

  try {
    const { token, expiresAt } = signPhoneToken(phone);
    return { ok: true, token, expiresAt };
  } catch (err) {
    console.error("Failed to sign phone token", err);
    return {
      ok: false,
      error: { code: "VERIFY_FAILED", message: t("otpVerifyFailed") },
    };
  }
}
