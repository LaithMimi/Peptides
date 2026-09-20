// Business identity shown in the footer and the legal pages. Values come from
// environment variables so the owner fills them in without touching code.
// Anything left unset renders as a visible "to be completed" marker instead of
// being silently omitted — see docs/legal-compliance.md.

export const TO_COMPLETE = "[to be completed before launch]";

export interface Business {
  tradeName: string;
  legalName: string;
  address: string;
  email: string;
  phone: string;
  jurisdiction: string;
  /** True when every identity field was supplied. */
  complete: boolean;
}

export function getBusiness(): Business {
  const env = (name: string) => process.env[name]?.trim() || "";
  const legalName = env("BUSINESS_LEGAL_NAME");
  const address = env("BUSINESS_ADDRESS");
  const email = env("BUSINESS_CONTACT_EMAIL");
  const phone = env("BUSINESS_PHONE");
  const jurisdiction = env("BUSINESS_JURISDICTION");
  return {
    tradeName: "Pep Club",
    legalName: legalName || TO_COMPLETE,
    address: address || TO_COMPLETE,
    email: email || TO_COMPLETE,
    phone: phone || TO_COMPLETE,
    jurisdiction: jurisdiction || TO_COMPLETE,
    complete: Boolean(legalName && address && email && phone && jurisdiction),
  };
}
