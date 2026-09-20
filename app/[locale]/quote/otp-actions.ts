"use server";

import { cookies, headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { parsePhone } from "@/lib/phone";
import { checkRateLimit, otpLimits } from "@/lib/rate-limit";
import { checkVerification, startVerification } from "@/lib/otp";
import { logSecurityEvent, maskPhone } from "@/lib/security-log";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSession,
} from "@/lib/session";
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
    logSecurityEvent("otp_send_rate_limited", { ip, scope: "ip" });
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
    logSecurityEvent("otp_send_rate_limited", {
      ip,
      scope: "phone",
      phone: maskPhone(phone),
    });
    return {
      ok: false,
      error: { code: "RATE_LIMITED", message: t("otpRateLimited") },
    };
  }

  const result = await startVerification(phone, locale);
  if (result !== "ok") {
    logSecurityEvent("otp_send_failed", { ip, phone: maskPhone(phone) });
    return {
      ok: false,
      error: { code: "SEND_FAILED", message: t("otpSendFailed") },
    };
  }

  logSecurityEvent("otp_send_ok", { ip, phone: maskPhone(phone) });
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
    logSecurityEvent("otp_verify_rate_limited", { ip });
    return {
      ok: false,
      error: { code: "RATE_LIMITED", message: t("otpRateLimited") },
    };
  }

  const phone = parsePhone(String(input.phone ?? ""));
  const code = String(input.code ?? "").trim();
  if (!phone || !/^\d{6}$/.test(code)) {
    logSecurityEvent("otp_verify_failed", { ip, reason: "malformed" });
    return {
      ok: false,
      error: { code: "INVALID_CODE", message: t("otpInvalidCode") },
    };
  }

  const result = await checkVerification(phone, code);
  if (result !== "ok") {
    logSecurityEvent("otp_verify_failed", {
      ip,
      phone: maskPhone(phone),
      reason: result,
    });
  }
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
    const { value } = createSession(phone);
    (await cookies()).set(SESSION_COOKIE, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    logSecurityEvent("otp_verify_ok", { ip, phone: maskPhone(phone) });
    return { ok: true, phone };
  } catch (err) {
    console.error("Failed to create session", err);
    logSecurityEvent("session_create_failed", { ip, phone: maskPhone(phone) });
    return {
      ok: false,
      error: { code: "VERIFY_FAILED", message: t("otpVerifyFailed") },
    };
  }
}

export async function signOut(): Promise<{ ok: true }> {
  logSecurityEvent("sign_out", { ip: await getClientIp() });
  (await cookies()).delete(SESSION_COOKIE);
  return { ok: true };
}
