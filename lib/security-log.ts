export type SecurityEvent =
  | "otp_send_ok"
  | "otp_send_failed"
  | "otp_send_rate_limited"
  | "otp_verify_ok"
  | "otp_verify_failed"
  | "otp_verify_rate_limited"
  | "session_create_failed"
  | "sign_out"
  | "quote_rate_limited"
  | "quote_honeypot_hit"
  | "quote_not_signed_in"
  | "quote_submitted"
  | "data_request_rate_limited";

type Fields = Record<string, string | number | boolean | undefined>;

/** Keep only the country prefix and last two digits: "+96279***45". */
export function maskPhone(phone: string): string {
  if (phone.length <= 6) return "***";
  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
}

/**
 * Emit one JSON line per security-relevant event to stdout so the host's log
 * drain can filter on `"type":"security"`. Never pass codes, cookies or full
 * phone numbers; use `maskPhone` for phones.
 */
export function logSecurityEvent(event: SecurityEvent, fields: Fields = {}) {
  console.warn(
    JSON.stringify({
      type: "security",
      event,
      at: new Date().toISOString(),
      ...fields,
    })
  );
}
