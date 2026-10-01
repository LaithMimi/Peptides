import { Resend } from "resend";
import { formatMoney } from "@/lib/money";
import { siteUrl } from "@/lib/seo";
import type { Order, OrderItem } from "@/lib/db/schema";

export type EmailResult = { ok: true } | { ok: false; error: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain-text and HTML bodies of the new-order notification (spec: contracts/server-actions.md). */
export function buildOrderEmail(order: Order, items: OrderItem[]) {
  const money = (minor: number) => formatMoney(minor, "en");
  const placed = order.createdAt.toISOString();
  // Links to the dashboard page, which still requires an admin sign-in. Approval
  // is never a one-click link in the email: mail scanners open links on their own.
  const adminUrl = `${siteUrl()}/admin/orders/${order.id}`;
  const tel = `tel:${order.customerPhone.replace(/[^\d+]/g, "")}`;

  const lines = items.map(
    (i) =>
      `- ${i.productNameSnapshot} (${i.brandNameSnapshot}${i.vialSizeSnapshot ? `, ${i.vialSizeSnapshot}` : ""}) x${i.quantity} @ ${money(i.unitPriceMinor)} = ${money(i.lineTotalMinor)}`
  );

  const text = [
    `New order ${order.orderNumber}: ${money(order.totalMinor)}, cash on delivery`,
    "",
    "Before dispatching:",
    `1. Check the order details below.`,
    `2. Call the customer at ${order.customerPhone} to confirm they placed it.`,
    `3. Approve it (or cancel it) in the dashboard: ${adminUrl}`,
    "",
    `Placed: ${placed} (customer language: ${order.locale})`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Delivery address: ${order.deliveryAddress}`,
    `Notes: ${order.notes && order.notes.trim() ? order.notes : "(none)"}`,
    "",
    "Items:",
    ...lines,
    "",
    `Subtotal: ${money(order.subtotalMinor)}`,
    `Delivery fee: ${order.deliveryFeeMinor === 0 ? "Free" : money(order.deliveryFeeMinor)}`,
    `Total: ${money(order.totalMinor)}`,
    "Payment method: Cash on delivery",
    "18+/research-use acknowledgment: confirmed",
  ].join("\n");

  const rows = items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.productNameSnapshot)}<br><small>${escapeHtml(i.brandNameSnapshot)}${i.vialSizeSnapshot ? ` · ${escapeHtml(i.vialSizeSnapshot)}` : ""}</small></td><td align="right">${i.quantity}</td><td align="right">${money(i.unitPriceMinor)}</td><td align="right">${money(i.lineTotalMinor)}</td></tr>`
    )
    .join("");
  const html = `<h2>New order ${escapeHtml(order.orderNumber)}: ${money(order.totalMinor)}</h2>
<div style="border:1px solid #1f2a52;border-radius:8px;padding:12px 16px;margin:0 0 16px">
<p style="margin:0 0 8px"><strong>Before dispatching:</strong></p>
<ol style="margin:0;padding-left:20px">
<li>Check the order details below.</li>
<li>Call the customer to confirm they placed it: <a href="${escapeHtml(tel)}"><strong>${escapeHtml(order.customerPhone)}</strong></a></li>
<li>Approve it (or cancel it) in the dashboard: <a href="${escapeHtml(adminUrl)}">Open order ${escapeHtml(order.orderNumber)}</a></li>
</ol>
</div>
<p>Placed ${escapeHtml(placed)}</p>
<p><strong>${escapeHtml(order.customerName)}</strong><br>${escapeHtml(order.customerPhone)}<br>${escapeHtml(order.deliveryAddress)}</p>
<p>Notes: ${order.notes && order.notes.trim() ? escapeHtml(order.notes) : "(none)"}</p>
<table cellpadding="6" cellspacing="0" border="1"><thead><tr><th align="left">Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
<p>Subtotal: ${money(order.subtotalMinor)}<br>Delivery fee: ${order.deliveryFeeMinor === 0 ? "Free" : money(order.deliveryFeeMinor)}<br><strong>Total: ${money(order.totalMinor)}</strong><br>Payment: Cash on delivery</p>`;

  return {
    subject: `New order ${order.orderNumber} (${money(order.totalMinor)}): call to confirm`,
    text,
    html,
  };
}

/**
 * Sends the notification to the store. The recipient is the store email from
 * settings, falling back to ORDER_NOTIFICATION_EMAIL. Without RESEND_API_KEY the
 * email is logged in development; in production a missing key is a failure the
 * admin can see (and retry), never a silent success.
 */
export async function sendOrderEmail(
  order: Order,
  items: OrderItem[],
  storeEmail: string | null
): Promise<EmailResult> {
  const to = storeEmail?.trim() || process.env.ORDER_NOTIFICATION_EMAIL?.trim();
  const apiKey = process.env.RESEND_API_KEY;
  const { subject, text, html } = buildOrderEmail(order, items);

  if (!apiKey || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[order email — dev fallback, no RESEND_API_KEY or recipient]\nSubject: ${subject}\n${text}`);
      return { ok: true };
    }
    return { ok: false, error: !to ? "no_recipient" : "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.ORDER_EMAIL_FROM ?? "Orders <onboarding@resend.dev>",
      to,
      subject,
      text,
      html,
    });
    if (error) {
      console.error("Resend error sending order email", error);
      return { ok: false, error: "provider_error" };
    }
    return { ok: true };
  } catch (error) {
    console.error("Failed to send order email", error);
    return { ok: false, error: "send_failed" };
  }
}
