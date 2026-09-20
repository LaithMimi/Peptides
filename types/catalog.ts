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

export interface Address {
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface QuoteRequestInput {
  lineItems: LineItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  notes?: string | null;
  phoneVerificationToken: string;
  ageAndResearchUseAck: boolean;
  website?: string;
  locale: Locale;
}

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
  | { ok: true; token: string; expiresAt: string }
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
  | "RATE_LIMITED";

export interface QuoteRequestError {
  code: QuoteRequestErrorCode;
  fieldErrors?: Record<string, string>;
  message: string;
}

export type QuoteRequestResult =
  | { ok: true }
  | { ok: false; error: QuoteRequestError };
