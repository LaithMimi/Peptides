# Quickstart: Peptide Storefront

Validation guide for the catalog + quote-request feature. Assumes the
Next.js app scaffolded per plan.md's Project Structure already exists.

## Prerequisites

- Node.js 22+, npm
- A Resend account + API key (for quote-request email delivery) — optional
  in local dev; if `RESEND_API_KEY` is unset, `lib/email.ts` logs the
  request to the server console instead of sending, so the flow is fully
  testable without a real key.
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

Open http://localhost:3000 (redirects to `/en`). Try `/ar` for the Arabic,
RTL version.

## Manual Validation Scenarios

Each scenario maps to an acceptance scenario in `spec.md`. Run each in both
`/en` and `/ar` at least once.

1. **Browse catalog (US1)** — Load `/en` and `/ar`. Confirm every active
   product from `lib/products.ts` appears with name, image, and a
   research-area tagline, and the research-use disclaimer is visible. On
   `/ar`, confirm the layout is mirrored (nav, cards, text alignment) —
   not just translated text in an LTR layout. Resize to a narrow (≤375px)
   viewport and confirm no horizontal scroll in either language.

2. **View product & select vial (US2)** — Click a product card. Confirm
   the detail page shows the full research-area description, vial size(s),
   and purity when available — and confirm no price appears anywhere. Try
   adding to the quote-cart without selecting a vial — must be blocked.
   Select a vial + quantity and add; confirm the cart summary reflects the
   selection (no subtotal shown).

3. **Acknowledgment gate (US3)** — Go to `/[locale]/quote` with at least one
   item in the cart. Attempt to submit without checking the
   18+/research-use checkbox — confirm the Server Action rejects it
   (`VALIDATION_ERROR`) and the UI highlights the checkbox. Check it and
   confirm submission is no longer blocked for that reason.

4. **Submit a quote request (US4)** — Fill in valid name/email/country,
   check the acknowledgment, submit. Confirm: (a) the browser navigates to
   `/[locale]/quote/confirmation` with copy explaining the business will
   follow up with pricing, and (b) an email arrives at
   `ORDER_NOTIFICATION_EMAIL` (or is logged to console in dev) containing
   all line items, contact info, country, notes, locale, and the
   acknowledgment flag — with no price anywhere.

5. **Validation errors (FR-008)** — Submit with an invalid email format;
   confirm a field-level error appears and other entered data is retained.

6. **Duplicate submission guard (FR-011)** — Click submit multiple times
   rapidly; confirm only one request is sent/logged.

7. **Email failure path (FR-012)** — Temporarily set an invalid
   `RESEND_API_KEY` (with a value present, so the real send path is
   exercised instead of the dev console fallback), submit a request, and
   confirm the customer sees a clear failure message with their data still
   on screen.

## Automated Checks

```bash
npm run test        # Vitest: quote-schema validation, cart-store logic
npm run test:e2e    # Playwright: browse → select vial → submit → confirmation
```

Refer to `data-model.md` for field-level validation rules and
`contracts/submit-quote-request.md` for the Server Action's input/output
contract.
