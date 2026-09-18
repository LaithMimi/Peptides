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
  TWILIO_ACCOUNT_SID=ACxxx
  TWILIO_AUTH_TOKEN=xxx
  TWILIO_VERIFY_SERVICE_SID=VAxxx
  PHONE_TOKEN_SECRET=<long random string>
  ```
- Phone OTP in local dev: leave the three `TWILIO_*` variables unset and the
  code is printed to the server console; enter `000000`. This fallback only
  works when `NODE_ENV` is not `production` — production and Vercel previews
  need the real variables, otherwise phone verification (and so submission)
  is blocked by design. For a real-SMS test, create a Twilio Verify service
  and use a number verified on a Twilio trial account.

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

7. **Spam guard (FR-011a)** — Using devtools, fill the hidden `website`
   field and submit: confirm a normal-looking success but no email/console
   log. Then submit valid requests repeatedly from one client until the
   limit is hit and confirm the localized retry-later message appears with
   form data retained.

8. **Quantity cap and merge (FR-004)** — Set quantity to 11: blocked. Add the
   same product+vial twice (e.g., 6 then 6): the cart shows one line with
   quantity 10 (capped). Reload the page: the cart is still there; after a
   successful submit it is empty.

9. **Phone OTP (FR-007a)** — On the quote form, enter a valid international
   number (e.g. `+15550100`) and press "Send code"; confirm the code step
   appears (and, in dev, the code is logged to the server console). Try
   submitting the form without verifying: it must be blocked with a
   "verify your phone number" message. Enter a wrong code: error, still
   blocked. Enter the right code: the number shows as verified and submit
   works; the business email shows the phone marked verified. Edit the phone
   after verifying: verification is cleared. Press "Send code" again within
   60 s: blocked by the cooldown; send more than 3 codes in 10 minutes from
   one client: `RATE_LIMITED` message. Enter an invalid number such as
   `123`: inline error, no code sent. Repeat in `/ar` and confirm the
   digits stay left-to-right inside the RTL layout.

10. **Phone verification fails closed (FR-007a)** — With
   `NODE_ENV=production` (`npm run build && npm start`) and no Twilio
   variables set, press "Send code": a clear failure message is shown and
   the form cannot be submitted; the `000000` fallback must NOT be accepted.

11. **Email failure path (FR-012)** — Temporarily set an invalid
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
