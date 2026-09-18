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
  ageAndResearchUseAck: boolean;
  locale: Locale;
}

export type QuoteRequestErrorCode = "VALIDATION_ERROR" | "EMAIL_DELIVERY_FAILED";

export interface QuoteRequestError {
  code: QuoteRequestErrorCode;
  fieldErrors?: Record<string, string>;
  message: string;
}

export type QuoteRequestResult =
  | { ok: true }
  | { ok: false; error: QuoteRequestError };
