import { Resend } from "resend";
import type { QuoteRequestInput, ResolvedLineItem } from "@/types/catalog";

interface SendQuoteRequestEmailArgs {
  request: QuoteRequestInput;
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

  const addr = request.shippingAddress;
  const addressLines = [
    addr.line1,
    addr.line2,
    `${addr.city}, ${addr.region} ${addr.postalCode}`,
    addr.country,
  ].filter((line): line is string => !!line && line.trim().length > 0);

  const bodyText = [
    `New quote request (submitted ${submittedAt}, locale: ${request.locale})`,
    "",
    "Items:",
    itemsText,
    "",
    `Name: ${request.customerName}`,
    `Email: ${request.customerEmail}`,
    `Phone: ${request.customerPhone}`,
    "Shipping address:",
    ...addressLines.map((line) => `  ${line}`),
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
