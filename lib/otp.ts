export type OtpResult = "ok" | "invalid" | "expired" | "error";

const DEV_CODE = "000000";

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  serviceSid: string;
}

type Mode =
  | { kind: "twilio"; config: TwilioConfig }
  | { kind: "dev" }
  | { kind: "unconfigured" };

function getMode(): Mode {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (accountSid && authToken && serviceSid) {
    return { kind: "twilio", config: { accountSid, authToken, serviceSid } };
  }
  // The console fallback exists only outside production and only when no
  // Twilio variable is set; otherwise phone verification fails closed.
  const anyTwilioVar = accountSid || authToken || serviceSid;
  if (process.env.NODE_ENV !== "production" && !anyTwilioVar) {
    return { kind: "dev" };
  }
  return { kind: "unconfigured" };
}

function twilioFetch(
  config: TwilioConfig,
  path: string,
  body: Record<string, string>
) {
  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
    "base64"
  );
  return fetch(
    `https://verify.twilio.com/v2/Services/${config.serviceSid}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body),
    }
  );
}

export async function startVerification(
  phone: string,
  locale: "en" | "ar"
): Promise<"ok" | "error"> {
  const mode = getMode();
  if (mode.kind === "unconfigured") return "error";
  if (mode.kind === "dev") {
    console.log(
      `[phone OTP — dev fallback, no Twilio configured] code for ${phone}: ${DEV_CODE}`
    );
    return "ok";
  }

  try {
    const res = await twilioFetch(mode.config, "Verifications", {
      To: phone,
      Channel: "sms",
      Locale: locale,
    });
    if (!res.ok) {
      console.error("Twilio Verify start failed", res.status);
      return "error";
    }
    return "ok";
  } catch (err) {
    console.error("Twilio Verify start threw", err);
    return "error";
  }
}

export async function checkVerification(
  phone: string,
  code: string
): Promise<OtpResult> {
  const mode = getMode();
  if (mode.kind === "unconfigured") return "error";
  if (mode.kind === "dev") return code === DEV_CODE ? "ok" : "invalid";

  try {
    const res = await twilioFetch(mode.config, "VerificationCheck", {
      To: phone,
      Code: code,
    });
    if (res.status === 404) return "expired";
    if (!res.ok) {
      console.error("Twilio Verify check failed", res.status);
      return "error";
    }
    const data = (await res.json()) as { status?: string };
    if (data.status === "approved") return "ok";
    return "invalid";
  } catch (err) {
    console.error("Twilio Verify check threw", err);
    return "error";
  }
}
