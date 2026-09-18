# Phase 1 Data Model: Peptide Storefront (Quote-Request Model)

No database exists in v1 (see research.md). These are the in-memory /
static-data / transient types the application uses, derived from spec.md's
Key Entities section. **No field in this document stores a price.**

## Product

Static, defined in `lib/products.ts` (committed data, not user-editable at
runtime). Content is per-locale for translatable fields.

| Field | Type | Rules |
|---|---|---|
| `id` | string (slug) | Unique, URL-safe (used as `/[locale]/products/[slug]`) |
| `name` | string | Required, non-empty; NOT translated (e.g., "TB-500", "BPC-157") |
| `image` | string | Required — representative image path/URL |
| `purity` | string \| null | e.g., "≥ 99%"; optional |
| `coaUrl` | string \| null | Optional link/reference to a certificate of analysis |
| `vials` | `Vial[]` | At least 1 vial size required |
| `active` | boolean | Only `active: true` products appear in the catalog (FR-001) |
| `translations.en` | `ProductTranslation` | Required |
| `translations.ar` | `ProductTranslation` | Required |

### ProductTranslation (nested under `Product.translations.<locale>`)

| Field | Type | Rules |
|---|---|---|
| `tagline` | string | Short one-line research-area summary shown on the catalog card |
| `description` | string | Full research-area description for the product page; MUST NOT contain human-dosage or medical-use/therapeutic-claim language (Principle I — content-review enforced) |
| `researchAreas` | string[] | Bullet list of research areas (e.g., "Tissue repair and regeneration research"); at least 1 |
| `disclaimer` | string | Defaults to the standard localized research-use disclaimer; may be product-specific but must not weaken it |

## Vial

Nested under a `Product`. No price field.

| Field | Type | Rules |
|---|---|---|
| `id` | string | Unique within the parent product |
| `label` | string | e.g., "10 mg", "100 mg" — required, not translated (a unit label) |

## Line Item

Client-side quote-cart entry; not persisted server-side except as part of
the quote-request email payload.

| Field | Type | Rules |
|---|---|---|
| `productId` | string | Must reference an existing active product |
| `vialId` | string | Must reference an existing vial of that product |
| `quantity` | integer | 1 ≤ quantity ≤ 10 (per-line max, clarified 2026-09-18) |

One line per `productId`+`vialId` pair: re-adding an existing pair merges
into the existing line (quantities summed, capped at 10). The list persists
in browser storage until a successful submission clears it.

No subtotal is derived — there is no price to multiply.

## Quote Request (submission payload)

Constructed at submit time from the quote-cart + contact form; validated by
the shared Zod schema (`lib/quote-schema.ts`) on both client and server.
Never persisted — exists only as the payload sent to the email step.

| Field | Type | Rules |
|---|---|---|
| `lineItems` | `LineItem[]` | At least 1 (FR-008: cannot submit an empty request) |
| `customerName` | string | Required, non-empty |
| `customerEmail` | string | Required, valid email format |
| `customerPhone` | string | Required; a valid international number, stored/sent in E.164 form (e.g. `+15550100`), parsed and validated with `libphonenumber-js` (the business ships directly once a quote is accepted and needs a reachable number) |
| `phoneVerificationToken` | string | Required; signed token proving `customerPhone` passed OTP verification (see Phone Verification Token). Server rejects the request if missing, tampered, expired, or issued for a different number (FR-007a). Not included in the emailed payload |
| `shippingAddress` | `Address` | Required (see below) |
| `notes` | string \| null | Optional free-text note from the customer |
| `ageAndResearchUseAck` | boolean | Must be `true` — server rejects the request if `false`/missing (FR-006, Principle I) |
| `website` | string | Honeypot field, rendered hidden; MUST be empty. Non-empty means bot: request is silently discarded, never emailed (FR-011a). Not part of the emailed payload |
| `locale` | "en" \| "ar" | The language the request was submitted in, included so the business can reply in kind |
| `submittedAt` | ISO datetime string | Set server-side at processing time, not client-supplied |

### Address (embedded in Quote Request as `shippingAddress`)

| Field | Type | Rules |
|---|---|---|
| `line1` | string | Required, non-empty |
| `line2` | string \| null | Optional |
| `city` | string | Required, non-empty |
| `region` | string | Required, non-empty (state/province) |
| `postalCode` | string | Required, non-empty |
| `country` | string | Required, non-empty |

## Phone Verification Token (transient, never stored)

Minted by `verifyPhoneCode` after Twilio reports `approved`; held in client
form state only; checked by `submitQuoteRequest`. Format:
`base64url(JSON payload) + "." + base64url(HMAC-SHA256(PHONE_TOKEN_SECRET, payload))`.

| Field | Type | Rules |
|---|---|---|
| `p` | string | E.164 phone number that was verified; MUST equal the submitted `customerPhone` |
| `exp` | integer | Unix seconds; `now + 30 min` at issue; expired tokens are rejected |

Code generation, expiry (Twilio default 10 min) and wrong-attempt limits live
in Twilio Verify, not in this app. Rate-limit counters (send per IP, send per
phone, check per IP) are in-memory only in `lib/rate-limit.ts`.

## Validation Summary (enforced in `lib/quote-schema.ts`, shared client+server)

- `lineItems.length >= 1`
- Every `lineItems[].productId` + `vialId` resolves to a real, active
  product/vial in `lib/products.ts` (re-checked server-side)
- `1 <= quantity <= 10` per line item, and no duplicate `productId`+`vialId` pairs
- `customerEmail` matches standard email format
- `customerName` non-empty
- `customerPhone` is a valid international number (E.164) AND
  `phoneVerificationToken` is valid, unexpired, and issued for exactly that
  number (server-side enforcement of FR-007a)
- `shippingAddress.{line1,city,region,postalCode,country}` all non-empty
  (`line2` is the only optional address field)
- `ageAndResearchUseAck === true` (hard requirement; request rejected
  otherwise — this is the server-side enforcement of Principle I, not just
  a disabled button in the UI)

## State

There is no persisted state machine — a quote request either (a) fails
validation client-side and is never sent, (b) fails validation or email
delivery server-side and returns an error to the client (FR-012, entered
data stays on screen), or (c) succeeds and the client shows the
confirmation page (`app/[locale]/quote/confirmation`).
