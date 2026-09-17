# Quickstart: Peptide Storefront

Validation guide for the catalog + order-capture feature. Assumes the
Next.js app scaffolded per plan.md's Project Structure already exists.

## Prerequisites

- Node.js 22+, npm
- A Resend account + API key (for order email delivery)
- Env vars in `.env.local`:
  ```
  RESEND_API_KEY=re_xxx
  ORDER_NOTIFICATION_EMAIL=business-inbox@example.com
  ```

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Manual Validation Scenarios

Each scenario maps to an acceptance scenario in `spec.md`.

1. **Browse catalog (US1)** — Load `/`. Confirm every active product from
   `lib/products.ts` appears with name, image, starting price, and the
   research-use disclaimer is visible on the page. Resize to a narrow
   (≤375px) viewport and confirm no horizontal scroll.

2. **View product & select variant (US2)** — Click a product card. Confirm
   the detail page shows full description, all variants with prices, and
   any COA link. Try adding to cart without selecting a variant — submission
   must be blocked. Select a variant + quantity and add to cart; confirm
   the cart summary reflects the selection and subtotal.

3. **Acknowledgment gate (US3)** — Go to `/order` with at least one item in
   the cart. Attempt to submit without checking the 18+/research-use
   checkbox — confirm the Server Action rejects it (`VALIDATION_ERROR`) and
   the UI highlights the checkbox. Check it and confirm submission is no
   longer blocked for that reason.

4. **Submit an order (US4)** — Fill in valid name/email/shipping address,
   check the acknowledgment, submit. Confirm: (a) the browser navigates to
   `/order/confirmation`, and (b) an email arrives at
   `ORDER_NOTIFICATION_EMAIL` containing all line items, prices, contact
   info, shipping address, and the acknowledgment flag.

5. **Validation errors (FR-008)** — Submit with an invalid email format;
   confirm a field-level error appears and other entered data is retained.

6. **Duplicate submission guard (FR-011)** — Click submit multiple times
   rapidly; confirm only one order email is sent (check Resend dashboard
   logs or a local email-capture tool).

7. **Email failure path (FR-012)** — Temporarily set an invalid
   `RESEND_API_KEY`, submit an order, and confirm the customer sees a clear
   failure message with their data still on screen (not cleared).

## Automated Checks

```bash
npm run test        # Vitest: order-schema validation, cart-store logic
npm run test:e2e    # Playwright: browse → select variant → submit → confirmation
```

Refer to `data-model.md` for field-level validation rules and
`contracts/submit-order.md` for the Server Action's input/output contract.
