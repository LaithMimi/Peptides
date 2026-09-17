# Contract: Submit Order (Server Action)

The only server-side interface this feature exposes. Implemented as a
Next.js Server Action (`app/order/actions.ts`), invoked from the order
review form (`app/order/page.tsx`). No public REST/JSON API is exposed
beyond this action boundary.

## `submitOrder(input: OrderInput): Promise<OrderResult>`

### Input: `OrderInput`

```ts
{
  lineItems: Array<{
    productId: string;
    variantId: string;
    quantity: number; // 1–20
  }>;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  ageAndResearchUseAck: boolean;
}
```

Validated server-side against the shared Zod schema in
`lib/order-schema.ts` (see data-model.md "Validation Summary"). The server
MUST NOT trust any client-supplied price or product label — it MUST
re-resolve `productId`/`variantId` against `lib/products.ts` to compute the
authoritative price shown in the order email.

### Output: `OrderResult`

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
    code: "VALIDATION_ERROR" | "EMAIL_DELIVERY_FAILED";
    // Field-level messages when code === "VALIDATION_ERROR"
    fieldErrors?: Record<string, string>;
    message: string; // human-readable, shown to the customer
  }
}
```

### Error Cases

| Case | `code` | Client behavior |
|---|---|---|
| Missing/invalid required field | `VALIDATION_ERROR` | Show inline field error(s); do not clear the form |
| `ageAndResearchUseAck !== true` | `VALIDATION_ERROR` | Block submission; highlight the acknowledgment control (US3) |
| Empty `lineItems` | `VALIDATION_ERROR` | Block submission; show "add at least one item" |
| `productId`/`variantId` no longer resolves (removed/inactive) | `VALIDATION_ERROR` | Identify the affected line item so the customer can adjust (Edge Cases) |
| Resend API call fails/times out | `EMAIL_DELIVERY_FAILED` | Show retry message; preserve form state (FR-012) |

### Side Effects on Success

- Exactly one email is sent to the business notification address
  (`ORDER_NOTIFICATION_EMAIL` env var) containing: all line items (product
  name, variant label, quantity, resolved price, line subtotal, order
  total), customer contact info, shipping address, the recorded
  acknowledgment, and a server-generated `submittedAt` timestamp.
- The client-side cart is cleared and the customer is routed to
  `app/order/confirmation`.

### Idempotency / Duplicate Submission (FR-011)

The client MUST disable the submit control for the duration of the pending
action call (React `useTransition`/`useFormStatus` pending state) so a
double-click cannot fire two overlapping submissions. No server-side
deduplication key is required in v1 given low order volume and no
persisted order store.
