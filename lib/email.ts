import { Resend } from "resend";
import type { QuoteRequestEmailData, ResolvedLineItem } from "@/types/catalog";

interface SendQuoteRequestEmailArgs {
  request: QuoteRequestEmailData;
  resolvedLineItems: ResolvedLineItem[];
  submittedAt: string;
}

export async function sendQuoteRequestEmail({
  request,
  resolvedLineItems,
  submittedAt,
}: SendQuoteRequestEmailArgs): Promise<{ ok: true } | { ok: false }> {
  const apiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL;

  const itemsText = resolvedLineItems
    .map((i) => `- ${i.productName} (${i.vialLabel}) x${i.quantity}`)
    .join("\n");

  // Form fields arrive as "" (not null/undefined) when left blank, so an
  // empty string must fall back too, not just null/undefined.
  const orFallback = (value: string | null | undefined, fallback: string) =>
    value && value.trim().length > 0 ? value : fallback;

  const bodyText = [
    `New quote request (submitted ${submittedAt}, locale: ${request.locale})`,
    "",
    "Items:",
    itemsText,
    "",
    `Name: ${request.customerName}`,
    `Email: ${request.customerEmail}`,
    `Phone: ${request.customerPhone} (verified by one-time code)`,
    `Shipping address: ${request.shippingAddress}`,
    `Notes: ${orFallback(request.notes, "(none)")}`,
    `18+/research-use acknowledgment: ${request.ageAndResearchUseAck ? "confirmed" : "NOT confirmed"}`,
    "",
    "No price or payment was collected — this is a quote request only.",
  ].join("\n");

  if (!apiKey || !notificationEmail) {
    // Dev fallback: no Resend credentials configured. Log instead of
    // failing so the flow is fully testable locally (see quickstart.md).
    console.log("[quote-request email — dev fallback, no RESEND_API_KEY]\n" + bodyText);
    return { ok: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Quote Requests <onboarding@resend.dev>",
      to: notificationEmail,
      replyTo: request.customerEmail,
      subject: `New quote request from ${request.customerName}`,
      text: bodyText,
    });
    if (error) {
      console.error("Resend error sending quote-request email", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to send quote-request email", err);
    return { ok: false };
  }
}

interface SendFeedbackEmailArgs {
  name?: string | null;
  email: string;
  message: string;
  locale: string;
  submittedAt: string;
}

export async function sendFeedbackEmail({
  name,
  email,
  message,
  locale,
  submittedAt,
}: SendFeedbackEmailArgs): Promise<{ ok: true } | { ok: false }> {
  const apiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL;

  const senderName = name && name.trim().length > 0 ? name : "(no name given)";
  const bodyText = [
    `New feedback (submitted ${submittedAt}, locale: ${locale})`,
    "",
    `From: ${senderName} <${email}>`,
    "",
    "Message:",
    message,
  ].join("\n");

  if (!apiKey || !notificationEmail) {
    console.log("[feedback email — dev fallback, no RESEND_API_KEY]\n" + bodyText);
    return { ok: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Feedback <onboarding@resend.dev>",
      to: notificationEmail,
      replyTo: email,
      subject: `New feedback from ${senderName}`,
      text: bodyText,
    });
    if (error) {
      console.error("Resend error sending feedback email", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to send feedback email", err);
    return { ok: false };
  }
}
