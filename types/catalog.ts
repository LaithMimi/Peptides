export type Locale = "en" | "ar";

export interface Vial {
  id: string;
  label: string;
}

export interface ProductTranslation {
  tagline: string;
  description: string;
  researchAreas: string[];
}

export interface Product {
  id: string;
  name: string;
  image: string;
  purity: string | null;
  coaUrl: string | null;
  vials: Vial[];
  active: boolean;
  translations: Record<Locale, ProductTranslation>;
}

export interface LineItem {
  productId: string;
  vialId: string;
  quantity: number;
}

export interface ResolvedLineItem extends LineItem {
  productName: string;
  vialLabel: string;
}

export interface QuoteRequestInput {
  lineItems: LineItem[];
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  notes?: string | null;
  ageAndResearchUseAck: boolean;
  website?: string;
  locale: Locale;
}

/** A validated request plus the phone taken from the signed session cookie. */
export type QuoteRequestEmailData = QuoteRequestInput & {
  customerPhone: string;
};

export type SendPhoneCodeResult =
  | { ok: true; phone: string; resendAfterSeconds: number }
  | {
      ok: false;
      error: {
        code: "INVALID_PHONE" | "RATE_LIMITED" | "SEND_FAILED";
        message: string;
      };
    };

export type VerifyPhoneCodeResult =
  | { ok: true; phone: string }
  | {
      ok: false;
      error: {
        code: "INVALID_CODE" | "CODE_EXPIRED" | "RATE_LIMITED" | "VERIFY_FAILED";
        message: string;
      };
    };

export type QuoteRequestErrorCode =
  | "VALIDATION_ERROR"
  | "EMAIL_DELIVERY_FAILED"
  | "RATE_LIMITED"
  | "NOT_SIGNED_IN";

export interface QuoteRequestError {
  code: QuoteRequestErrorCode;
  fieldErrors?: Record<string, string>;
  message: string;
}

export type QuoteRequestResult =
  | { ok: true }
  | { ok: false; error: QuoteRequestError };
