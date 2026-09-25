import { Resend } from "resend";

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

interface SendDataRequestEmailArgs {
  type: "delete" | "access" | "correct";
  email: string;
  phone?: string | null;
  details?: string | null;
  locale: string;
  submittedAt: string;
}

/**
 * Privacy request (deletion / access / correction) for the business to act on.
 * The reply-to is the requester, so the owner can verify identity by replying
 * to the address the request came from.
 */
export async function sendDataRequestEmail({
  type,
  email,
  phone,
  details,
  locale,
  submittedAt,
}: SendDataRequestEmailArgs): Promise<{ ok: true } | { ok: false }> {
  const apiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL;

  const bodyText = [
    `New privacy/data request (submitted ${submittedAt}, locale: ${locale})`,
    "",
    `Request: ${type.toUpperCase()}`,
    `Email: ${email}`,
    `Phone number used on orders: ${phone && phone.trim() ? phone : "(not given)"}`,
    `Details: ${details && details.trim() ? details : "(none)"}`,
    "",
    "Verify the requester by replying to this email address before acting, then respond within 30 days.",
  ].join("\n");

  if (!apiKey || !notificationEmail) {
    console.log("[data request email — dev fallback, no RESEND_API_KEY]\n" + bodyText);
    return { ok: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Data Requests <onboarding@resend.dev>",
      to: notificationEmail,
      replyTo: email,
      subject: `Data request (${type}) from ${email}`,
      text: bodyText,
    });
    if (error) {
      console.error("Resend error sending data-request email", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to send data-request email", err);
    return { ok: false };
  }
}
