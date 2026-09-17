# Phase 1 Data Model: Peptide Storefront

No database exists in v1 (see research.md). These are the in-memory /
static-data / transient types the application uses, derived from spec.md's
Key Entities section.

## Product

Static, defined in `lib/products.ts` (committed data, not user-editable at
runtime).

| Field | Type | Rules |
|---|---|---|
| `id` | string (slug) | Unique, URL-safe (used as `/products/[slug]`) |
| `name` | string | Required, non-empty |
| `description` | string | Required, non-empty; must not contain human-dosage or medical-use language (Principle I — enforced by content review, not code) |
| `images` | string[] | At least 1 image path/URL |
| `disclaimer` | string | Defaults to the standard research-use disclaimer; product-level override allowed but must not weaken it |
| `coaUrl` | string \| null | Optional link/reference to a certificate of analysis |
| `variants` | `Variant[]` | At least 1 variant required |
| `active` | boolean | Only `active: true` products appear in the catalog (FR-001) |

## Variant

Nested under a `Product`.

| Field | Type | Rules |
|---|---|---|
| `id` | string | Unique within the parent product |
| `label` | string | e.g., "5mg vial", "10mg vial" — required |
| `priceCents` | integer | Required, > 0 (store as integer cents to avoid float rounding) |

No stock/inventory field in v1 (Assumptions: no real-time inventory
tracking).

## Line Item

Client-side cart entry; not persisted server-side except as part of the
order email payload.

| Field | Type | Rules |
|---|---|---|
| `productId` | string | Must reference an existing active product |
| `variantId` | string | Must reference an existing variant of that product |
| `quantity` | integer | 1 ≤ quantity ≤ 20 (sane per-line max, edge case in spec.md) |

Derived (not stored): `lineSubtotalCents = variant.priceCents * quantity`.

## Order (submission payload)

Constructed at submit time from the cart + contact form; validated by the
shared Zod schema (`lib/order-schema.ts`) on both client and server. Never
persisted — exists only as the payload sent to the email step.

| Field | Type | Rules |
|---|---|---|
| `lineItems` | `LineItem[]` | At least 1 (FR-008: cannot submit an empty order) |
| `customerName` | string | Required, non-empty |
| `customerEmail` | string | Required, valid email format |
| `customerPhone` | string \| null | Optional |
| `shippingAddress` | `Address` | Required, all sub-fields required (see below) |
| `ageAndResearchUseAck` | boolean | Must be `true` — server rejects the request if `false`/missing (FR-006, Principle I) |
| `submittedAt` | ISO datetime string | Set server-side at processing time, not client-supplied |

### Address (embedded in Order)

| Field | Type | Rules |
|---|---|---|
| `line1` | string | Required |
| `line2` | string \| null | Optional |
| `city` | string | Required |
| `region` | string | Required (state/province) |
| `postalCode` | string | Required |
| `country` | string | Required |

## Validation Summary (enforced in `lib/order-schema.ts`, shared client+server)

- `lineItems.length >= 1`
- Every `lineItems[].productId` + `variantId` resolves to a real, active
  product/variant in `lib/products.ts` (re-checked server-side — never
  trust client-submitted price/labels)
- `1 <= quantity <= 20` per line item
- `customerEmail` matches standard email format
- `ageAndResearchUseAck === true` (hard requirement; request rejected
  otherwise — this is the server-side enforcement of Principle I, not just
  a disabled button in the UI)
- All required `Address` fields non-empty

## State

There is no persisted state machine — an order either (a) fails validation
client-side and is never sent, (b) fails validation or email delivery
server-side and returns an error to the client (FR-012, order data stays
on screen), or (c) succeeds and the client shows the confirmation page
(`app/order/confirmation`).
