# Contract: Submit Quote Request (Server Action)

The only server-side interface this feature exposes. Implemented as a
Next.js Server Action (`app/[locale]/quote/actions.ts`), invoked from the
quote-request form (`app/[locale]/quote/page.tsx`). No public REST/JSON API
is exposed beyond this action boundary. **No field here is or contains a
price.**

## `submitQuoteRequest(input: QuoteRequestInput): Promise<QuoteRequestResult>`

### Input: `QuoteRequestInput`

```ts
{
  lineItems: Array<{
    productId: string;
    vialId: string;
    quantity: number; // 1–10
  }>;
  customerName: string;
  customerEmail: string;
  customerPhone: string; // valid international number (E.164)
  phoneVerificationToken: string; // from verifyPhoneCode, see phone-verification.md
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  notes?: string | null;
  ageAndResearchUseAck: boolean;
  website?: string; // honeypot: must be empty/absent
  locale: "en" | "ar";
}
```

Validated server-side against the shared Zod schema in
`lib/quote-schema.ts` (see data-model.md "Validation Summary"). The server
MUST NOT trust any client-supplied product/vial label — it MUST re-resolve
`productId`/`vialId` against `lib/products.ts` to compute the authoritative
product name and vial label shown in the notification email.

### Output: `QuoteRequestResult`

Success:

```ts
{ ok: true }
```

Failure (validation or email-delivery failure — both surfaced the same way
to the client per FR-012, so the form can show a single error state and
preserve entered data):

```ts
{
  ok: false;
  error: {
    code: "VALIDATION_ERROR" | "EMAIL_DELIVERY_FAILED" | "RATE_LIMITED";
    fieldErrors?: Record<string, string>; // when code === "VALIDATION_ERROR"
    message: string; // human-readable, localized, shown to the customer
  }
}
```

### Error Cases

| Case | `code` | Client behavior |
|---|---|---|
| Missing/invalid required field | `VALIDATION_ERROR` | Show inline field error(s); do not clear the form |
| `ageAndResearchUseAck !== true` | `VALIDATION_ERROR` | Block submission; highlight the acknowledgment control (US3) |
| Empty `lineItems` | `VALIDATION_ERROR` | Block submission; show "add at least one item" |
| `productId`/`vialId` no longer resolves (removed/inactive) | `VALIDATION_ERROR` | Identify the affected line item so the customer can adjust (Edge Cases) |
| Resend API call fails/times out | `EMAIL_DELIVERY_FAILED` | Show retry message; preserve form state (FR-012) |
| `phoneVerificationToken` missing, tampered, expired, or issued for a different number than `customerPhone` | `VALIDATION_ERROR` (field `customerPhone`, code `phoneNotVerified`) | Show "verify your phone number"; reopen the code step; keep other data (FR-007a) |
| Per-IP rate limit exceeded (checked first, before validation) | `RATE_LIMITED` | Show localized retry-later message; preserve form state (FR-011a) |
| Honeypot `website` non-empty | `{ ok: true }` (no email sent) | Behaves like success so bots get no signal; nothing is sent (FR-011a) |

### Side Effects on Success

- Exactly one email is sent to the business notification address
  (`ORDER_NOTIFICATION_EMAIL` env var) containing: all line items (product
  name, vial label, quantity — no price), customer contact info (name,
  email, phone marked as verified by one-time code), the full shipping address, any notes, the recorded
  acknowledgment, the submission locale, and a server-generated
  `submittedAt` timestamp.
- No email is sent to the customer; the business is the only recipient.
- The client-side quote-cart is cleared and the customer is routed to
  `app/[locale]/quote/confirmation`.

### Idempotency / Duplicate Submission (FR-011)

The client MUST disable the submit control for the duration of the pending
action call (React `useTransition`/`useFormStatus` pending state) so a
double-click cannot fire two overlapping submissions. No server-side
deduplication key is required in v1 given low request volume and no
persisted request store.
