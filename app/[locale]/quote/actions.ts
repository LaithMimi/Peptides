"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { quoteRequestSchema } from "@/lib/quote-schema";
import { checkRateLimit, submitLimit } from "@/lib/rate-limit";
import { getSessionPhone } from "@/lib/session";
import { getProductById } from "@/lib/products";
import { sendQuoteRequestEmail } from "@/lib/email";
import { logSecurityEvent, maskPhone } from "@/lib/security-log";
import type {
  QuoteRequestInput,
  QuoteRequestResult,
  ResolvedLineItem,
} from "@/types/catalog";

export async function submitQuoteRequest(
  input: QuoteRequestInput
): Promise<QuoteRequestResult> {
  const t = await getTranslations({ locale: input.locale, namespace: "errors" });

  const forwardedFor = (await headers()).get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`submit:${ip}`, submitLimit())) {
    logSecurityEvent("quote_rate_limited", { ip });
    return {
      ok: false,
      error: { code: "RATE_LIMITED", message: t("rateLimited") },
    };
  }

  // Honeypot: real users never see this field. Answer as if it succeeded so
  // bots get no signal, but send nothing.
  if (input.website && input.website.trim().length > 0) {
    logSecurityEvent("quote_honeypot_hit", { ip });
    return { ok: true };
  }

  // The verified phone comes only from the signed session cookie, never
  // from the client. Missing/expired => the client sends the visitor to sign in.
  const sessionPhone = await getSessionPhone();
  if (!sessionPhone) {
    logSecurityEvent("quote_not_signed_in", { ip });
    return {
      ok: false,
      error: { code: "NOT_SIGNED_IN", message: t("notSignedIn") },
    };
  }

  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.length > 0 ? issue.path.join(".") : "form";
      const code = typeof issue.message === "string" ? issue.message : "required";
      fieldErrors[key] = translateErrorCode(code, t);
    }
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors,
        message: t("genericSubmit"),
      },
    };
  }

  const data = { ...parsed.data, customerPhone: sessionPhone };

  const resolvedLineItems: ResolvedLineItem[] = [];
  for (const item of data.lineItems) {
    const product = getProductById(item.productId);
    const vial = product?.vials.find((v) => v.id === item.vialId);
    if (!product || !vial) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          fieldErrors: { lineItems: t("itemUnavailable", { name: item.productId }) },
          message: t("itemUnavailable", { name: item.productId }),
        },
      };
    }
    resolvedLineItems.push({
      ...item,
      productName: product.name,
      vialLabel: vial.label,
    });
  }

  const submittedAt = new Date().toISOString();
  const emailResult = await sendQuoteRequestEmail({
    request: data,
    resolvedLineItems,
    submittedAt,
  });

  if (!emailResult.ok) {
    return {
      ok: false,
      error: {
        code: "EMAIL_DELIVERY_FAILED",
        message: t("emailFailed"),
      },
    };
  }

  logSecurityEvent("quote_submitted", { ip, phone: maskPhone(sessionPhone) });
  return { ok: true };
}

function translateErrorCode(
  code: string,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const known = [
    "required",
    "invalidEmail",
    "emptyCart",
    "ackRequired",
  ];
  if (known.includes(code)) {
    return t(code);
  }
  // itemUnavailable and any unrecognized code need context this helper
  // doesn't have — callers handle those cases explicitly before reaching here.
  return t("genericSubmit");
}
