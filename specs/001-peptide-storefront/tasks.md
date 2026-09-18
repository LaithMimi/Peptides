---
description: "Task list for Peptide Storefront (Catalog + Quote-Request Capture, bilingual)"
---

# Tasks: Peptide Storefront (Catalog + Quote-Request Capture)

**Input**: Design documents from `/specs/001-peptide-storefront/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/submit-quote-request.md, quickstart.md

**Tests**: Not explicitly requested as TDD in spec.md. Dedicated unit/e2e test tasks are included in Polish (Phase 8) using the Vitest/Playwright stack chosen in plan.md.

**Organization**: Tasks are grouped by user story (US1–US4, all P1) from spec.md, in the order a customer moves through the site: browse → view product → acknowledgment gate → submit quote request. Bilingual (EN/AR + RTL) is foundational, not a separate story, since constitution Principle III makes it a first-class requirement of every page.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to US1 (Browse Catalog), US2 (Product Detail & Vial Selection), US3 (Acknowledgment Gate), US4 (Submit Quote Request)
- File paths follow plan.md's Project Structure (single Next.js App Router project, `app/[locale]/...`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Scaffold Next.js 15 App Router project with TypeScript and Tailwind CSS at repository root
- [X] T002 Install feature dependencies: `zod`, `react-hook-form`, `@hookform/resolvers`, `resend`, `next-intl`
- [X] T003 [P] Install dev/test dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom`, `@playwright/test`
- [X] T004 [P] Create `.env.local.example` documenting `RESEND_API_KEY` and `ORDER_NOTIFICATION_EMAIL`
- [X] T005 [P] Configure `vitest.config.ts` and a test setup file for jsdom + Testing Library matchers
- [X] T006 [P] Configure `playwright.config.ts` pointing at `http://localhost:3000`
- [X] T007 Add `test`, `test:e2e` scripts to `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Locale routing, core types, data, validation, and shared components that every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create `i18n/routing.ts` defining supported locales (`en`, `ar`), default locale `en`, and the `next-intl` routing config
- [X] T009 Create `i18n/request.ts` (next-intl request config loading the right message file per locale)
- [X] T010 Create `proxy.ts` at repo root using `next-intl`'s middleware for locale detection/redirect (root `/` → default locale; named `proxy.ts` per the Next.js 16 convention, not the deprecated `middleware.ts`)
- [X] T011 [P] Create `messages/en.json` with all UI strings (nav labels, disclaimer text, form labels/placeholders, button text, error messages, confirmation copy)
- [X] T012 [P] Create `messages/ar.json` with the same keys, Arabic translations, adapted from the research-area phrasing the business provided
- [X] T013 Define `Product`, `ProductTranslation`, `Vial`, `LineItem`, `QuoteRequestInput`, `QuoteRequestResult` types in `types/catalog.ts` per data-model.md field tables (no price field anywhere)
- [X] T014 Create shared Zod schema in `lib/quote-schema.ts` implementing data-model.md's "Validation Summary": `lineItems.length >= 1`; each line item's `productId`/`vialId` must resolve against `lib/products.ts`; `1 <= quantity <= 20`; `customerEmail` valid email format; `customerName` and `country` non-empty; `ageAndResearchUseAck === true` (hard requirement, rejected otherwise)
- [X] T015 Create static catalog data module `lib/products.ts` with the 10 real products (TB-500, Ipamorelin, CJC-1295, Retatrutide, BPC-157, GHK-Cu, MOTS-C, KPV, Selank, Semax), each `active: true`, an image placeholder, `purity` where given (e.g., "≥ 99%" for TB-500/BPC-157), one `Vial` per product (label = the vial size provided, e.g. "10 mg"/"100 mg"), and `translations.en`/`translations.ar` with tagline/description/researchAreas/disclaimer adapted from the business-provided content (research-area framing, no therapeutic claims — Principle I)
- [X] T016 [P] Build `components/disclaimer-banner.tsx` rendering the localized "research/laboratory use only — not for human consumption" disclaimer via next-intl messages (FR-002, Principle I)
- [X] T017 [P] Build `lib/cart-store.ts`: React context + `localStorage`-backed quote-cart state with add/update-quantity/remove-line-item/clear operations (no price/subtotal logic)
- [X] T018 [P] Build `components/locale-switcher.tsx` linking between `/en` and `/ar` equivalents of the current page
- [X] T019 Implement `app/[locale]/layout.tsx`: set `<html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>`, mount `NextIntlClientProvider`, render header (site name, `locale-switcher.tsx`, cart link) and footer, and mount the cart context provider from T017

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Browse Product Catalog (Priority: P1) 🎯 MVP

**Goal**: A visitor can load the site in English or Arabic and see every active product with name, image, research-area tagline, and the research-use disclaimer, correctly laid out for the active direction.

**Independent Test**: Load `/en` and `/ar`; confirm every active product from `lib/products.ts` appears with name, image, tagline, and the disclaimer is visible; confirm RTL mirroring on `/ar` and no horizontal scroll from 320px–1920px on both.

### Implementation for User Story 1

- [X] T020 [P] [US1] Build `components/product-card.tsx` displaying a product's name, image, and localized tagline (uses `translations.<locale>.tagline`)
- [X] T021 [US1] Implement `app/[locale]/page.tsx` catalog page: fetch all `active: true` products from `lib/products.ts`, render via `product-card.tsx` in a responsive grid, and include `disclaimer-banner.tsx` (FR-001, FR-002)
- [X] T022 [US1] Apply responsive, direction-aware grid/spacing to `app/[locale]/page.tsx` using Tailwind logical properties (`ps-`/`pe-`/`text-start`, per research.md's RTL strategy); verify no horizontal scrolling and correct mirroring on `/ar` from 320px–1920px (FR-013, FR-014, SC-005)

**Checkpoint**: Catalog is fully browsable in both languages and independently testable/demoable.

---

## Phase 4: User Story 2 - View Product Details & Select a Vial (Priority: P1)

**Goal**: A visitor can open any product, read the full localized research-area description, and select a vial + quantity to add to their quote request — with no price shown anywhere.

**Independent Test**: Navigate directly to `/[locale]/products/[slug]` for a known product; confirm full description, vial size(s), and purity render in the active language; select a vial and quantity and confirm the selection is reflected; confirm adding without a vial selected is blocked.

### Implementation for User Story 2

- [X] T023 [P] [US2] Build `components/vial-selector.tsx`: vial choice control (radio/select, localized labels where needed) + quantity input constrained to `1 <= quantity <= 20` (data-model.md) — no price/subtotal calculation
- [X] T024 [US2] Implement `app/[locale]/products/[slug]/page.tsx`: look up the product by slug in `lib/products.ts` (not-found state if missing or `active: false`), render localized description, image, `researchAreas` list, `purity`/`coaUrl` when present, `disclaimer-banner.tsx`, and `vial-selector.tsx` (FR-003)
- [X] T025 [US2] Wire an "Add to quote request" action on the product page that calls `lib/cart-store.ts` to add `{ productId, vialId, quantity }`; disable/block the action with a clear inline message when no vial is selected (Acceptance Scenario 3)
- [X] T026 [P] [US2] Build `components/quote-summary.tsx` showing current quote-cart line items (product name, vial label, quantity — no price/subtotal) and item count; mount it from the header (T019) and the product page

**Checkpoint**: Catalog browsing + product detail + quote-cart building are fully functional together, in both languages.

---

## Phase 5: User Story 3 - Age & Research-Use Acknowledgment Gate (Priority: P1)

**Goal**: A customer cannot submit a quote request without explicitly acknowledging they are 18+ and that products are for research/laboratory use only, not for human consumption.

**Independent Test**: With ≥1 item in the quote-cart, go to `/[locale]/quote`, attempt to submit without checking the acknowledgment control, and confirm the action is rejected with a clear localized message; check it and confirm the block is lifted.

### Implementation for User Story 3

- [X] T027 [US3] Implement `app/[locale]/quote/page.tsx` skeleton: render `quote-summary.tsx`, block navigation here with a localized message if the cart is empty (FR-008 empty-request case), and add the 18+/research-use acknowledgment checkbox control
- [X] T028 [US3] Implement `app/[locale]/quote/actions.ts` Server Action `submitQuoteRequest` (stub): parse input through `lib/quote-schema.ts` (T014) and return `{ ok: false, error: { code: "VALIDATION_ERROR", ... } }` per contracts/submit-quote-request.md when `ageAndResearchUseAck` is false/missing or `lineItems` is empty — full email-sending behavior completes in US4
- [X] T029 [US3] Wire the quote page's submit control to call `submitQuoteRequest` and, on a `VALIDATION_ERROR` naming the acknowledgment field, highlight the checkbox and show the required localized message without clearing other form state (Acceptance Scenarios 1–2)

**Checkpoint**: The acknowledgment gate is independently verifiable even before the full contact form exists.

---

## Phase 6: User Story 4 - Submit a Quote Request (Priority: P1)

**Goal**: A customer completes contact details and submits their quote request; the business receives it by email with no price shown or collected anywhere.

**Independent Test**: Add a vial to the quote-cart, fill the form with valid contact data + country, check the acknowledgment, submit, and confirm both an on-screen confirmation and a notification email are delivered per contracts/submit-quote-request.md.

### Implementation for User Story 4

- [X] T030 [US4] Extend `app/[locale]/quote/page.tsx` with the contact form (`customerName`, `customerEmail`, optional `customerPhone`, `country`, optional `notes`) using React Hook Form + `@hookform/resolvers/zod` bound to `lib/quote-schema.ts`
- [X] T031 [US4] Implement `lib/email.ts`: Resend client wrapper `sendQuoteRequestEmail(request, resolvedLineItems)` sending one email to `ORDER_NOTIFICATION_EMAIL` containing line items (product name, vial label, quantity — no price), contact info, country, notes, locale, the acknowledgment flag, and a server-generated `submittedAt` timestamp; if `RESEND_API_KEY` is unset, log the payload to the server console instead of sending (dev fallback per quickstart.md)
- [X] T032 [US4] Complete `app/[locale]/quote/actions.ts` `submitQuoteRequest`: re-resolve every `productId`/`vialId` against `lib/products.ts` server-side (never trust client-submitted labels), call `lib/email.ts` (T031), and return `QuoteRequestResult` per contracts/submit-quote-request.md; map a per-item "no longer available" case to a `VALIDATION_ERROR` naming the affected line item (Edge Cases)
- [X] T033 [US4] Implement `app/[locale]/quote/confirmation/page.tsx` with localized copy explaining the business will follow up with pricing; on successful `submitQuoteRequest` response, clear the cart via `lib/cart-store.ts` and route the customer here
- [X] T034 [US4] Implement duplicate-submission guard on the quote form using `useFormStatus`/`useTransition` pending state to disable the submit control while a request is in flight (FR-011)
- [X] T035 [US4] Handle the `EMAIL_DELIVERY_FAILED` result: show a clear localized retry message and preserve all entered form data on screen (FR-012)
- [X] T036 [US4] Render `fieldErrors` from a `VALIDATION_ERROR` `QuoteRequestResult` as inline, localized field-level messages next to the relevant form controls (FR-008)

**Checkpoint**: All four user stories work together end-to-end in both languages: browse → view/select → acknowledge → submit → confirmation email.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification and hardening across all stories

- [X] T037 [P] Responsive polish pass on `app/[locale]/quote/page.tsx` and `app/[locale]/quote/confirmation/page.tsx` in both directions; verify no horizontal scrolling from 320px–1920px (FR-013, SC-005)
- [X] T038 [P] Accessibility pass across all pages: semantic landmarks, labeled form controls, keyboard-navigable vial selector and checkbox, sufficient color contrast, alt text on product images, correct `lang`/`dir` propagation (Principle III)
- [X] T039 [P] Vitest unit tests for `lib/quote-schema.ts` covering every rule in data-model.md's Validation Summary, in `tests/unit/quote-schema.test.ts`
- [X] T040 [P] Vitest unit tests for `lib/cart-store.ts` (add/update/remove/clear), in `tests/unit/cart-store.test.ts`
- [X] T041 Playwright end-to-end test in `tests/e2e/quote-flow.spec.ts` covering quickstart.md scenarios 1–4, run against both `/en` and `/ar`
- [X] T042 Manual verification of quickstart.md scenarios 5–7 (field validation errors, duplicate-submission guard, email-failure path). Scenarios 5 (invalid-email inline error) and the acknowledgment gate were verified live via browser; the duplicate-submit guard was verified by code review (`disabled={isSubmitting}`); the `EMAIL_DELIVERY_FAILED` path was verified by code review only — it shares the exact same `submitError` rendering path already exercised for validation errors, but was not exercised against a real invalid `RESEND_API_KEY` since no live key was configured this session.
- [X] T043 [P] Add root `README.md` documenting local setup, required env vars, the dev email-fallback behavior, and pointers to `.specify/memory/constitution.md` and `specs/001-peptide-storefront/`
- [ ] T044 Configure `RESEND_API_KEY` and `ORDER_NOTIFICATION_EMAIL` as Vercel project environment variables, deploy a preview, and confirm `npm run build` succeeds and the live preview passes quickstart.md scenario 4 in both locales — **not done**: requires the user's Vercel account/credentials and a real Resend API key.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (locale routing/messages are load-bearing for every page)
- **User Story 1 (Phase 3)**: Depends only on Foundational
- **User Story 2 (Phase 4)**: Depends only on Foundational (can run in parallel with Phase 3 if staffed)
- **User Story 3 (Phase 5)**: Depends on Foundational and on `quote-summary.tsx` from US2 (T026)
- **User Story 4 (Phase 6)**: Depends on User Story 3's `app/[locale]/quote/page.tsx` skeleton and `submitQuoteRequest` stub (T027–T028)
- **Polish (Phase 7)**: Depends on all four user stories being complete

### Within Each User Story

- US1: `product-card.tsx` (T020) before the catalog page that renders it (T021); RTL/responsive polish (T022) last
- US2: `vial-selector.tsx` (T023) before the product page (T024); add-to-quote wiring (T025) after; `quote-summary.tsx` (T026) can be built in parallel with T023–T025
- US3: order page skeleton (T027) and the Server Action stub (T028) can be built in parallel, then wired together (T029)
- US4: form fields (T030) and email wrapper (T031) can be built in parallel, then both feed the completed Server Action (T032); confirmation page, duplicate-guard, and error handling (T033–T036) follow

### Parallel Opportunities

- Setup: T003–T006 in parallel after T001–T002
- Foundational: T011/T012 (message files) in parallel; T016/T017/T018 in parallel after T013–T015
- Once Foundational completes: Phase 3 (US1) and Phase 4 (US2) can proceed in parallel
- Polish: T037–T040 and T043 in parallel; T041–T042 and T044 run after the app is feature-complete

---

## Parallel Example: Foundational Phase

```bash
# After T013-T015 (types, schema, catalog data) land:
Task: "Build components/disclaimer-banner.tsx rendering the localized research-use disclaimer"
Task: "Build lib/cart-store.ts: React context + localStorage-backed quote-cart state"
Task: "Build components/locale-switcher.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Build components/vial-selector.tsx with quantity 1-20, no price/subtotal"
Task: "Build components/quote-summary.tsx showing quote-cart line items"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories; includes i18n plumbing)
3. Complete Phase 3: User Story 1 (Browse Catalog)
4. **STOP and VALIDATE**: Load `/en` and `/ar`, confirm disclaimer + responsive + RTL layout
5. Deploy/demo if ready — this alone proves out hosting, i18n, data model, and design direction

### Incremental Delivery

1. Setup + Foundational → foundation ready (locale routing + data working)
2. Add US1 (Browse Catalog) → validate in both languages → demo
3. Add US2 (Product Detail & Vial Selection) → validate → demo
4. Add US3 (Acknowledgment Gate) → validate the block/unblock behavior → demo
5. Add US4 (Submit Quote Request) → validate end-to-end email delivery → this completes the commercial flow
6. Polish (Phase 7) → responsive/accessibility/test hardening → deploy to Vercel

### Notes

- All four user stories are P1 because each is a mandatory link in the
  single quote-request chain described in spec.md; there is no meaningful
  partial product without all four, but they remain independently testable
  per the Independent Test criteria above.
- Principle I (Legal & Compliance First), Principle II (No Payment
  Processing), Principle III (Bilingual/RTL), and Principle V (no
  published pricing) apply across every phase — no task in this list
  introduces a payment field or a price/subtotal, every page task includes
  both locales, and the acknowledgment gate (US3) is enforced server-side
  (T028/T032), not just in the UI.
