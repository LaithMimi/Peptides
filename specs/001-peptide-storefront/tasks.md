---
description: "Task list for Peptide Storefront (Catalog + Order Capture)"
---

# Tasks: Peptide Storefront (Catalog + Order Capture)

**Input**: Design documents from `/specs/001-peptide-storefront/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/submit-order.md, quickstart.md

**Tests**: Not explicitly requested as TDD in spec.md. Dedicated unit/e2e test tasks are included in Polish (Phase 8) to validate against quickstart.md, using the Vitest/Playwright stack chosen in plan.md — not as test-first gates for each story.

**Organization**: Tasks are grouped by user story (US1–US4, all P1) from spec.md, in the order a customer moves through the site: browse → view product → acknowledgment gate → submit order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to US1 (Browse Catalog), US2 (Product Detail & Variant), US3 (Acknowledgment Gate), US4 (Submit Order)
- File paths follow plan.md's Project Structure (single Next.js App Router project at repo root)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Scaffold Next.js 15 App Router project with TypeScript and Tailwind CSS at repository root (`npx create-next-app@latest . --typescript --tailwind --app --no-src-dir`)
- [ ] T002 Install feature dependencies: `zod`, `react-hook-form`, `@hookform/resolvers`, `resend`
- [ ] T003 [P] Install dev/test dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom`, `@playwright/test`
- [ ] T004 [P] Create `.env.local.example` documenting `RESEND_API_KEY` and `ORDER_NOTIFICATION_EMAIL` (per quickstart.md Prerequisites)
- [ ] T005 [P] Configure `vitest.config.ts` and a test setup file for jsdom + Testing Library matchers
- [ ] T006 [P] Configure `playwright.config.ts` pointing at `http://localhost:3000`
- [ ] T007 Add `test`, `test:e2e` scripts to `package.json` (per quickstart.md Automated Checks)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, data, validation, and shared components that every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Define `Product`, `Variant`, `LineItem`, `Address`, `OrderInput`, `OrderResult` types in `types/catalog.ts` per data-model.md field tables
- [ ] T009 Create shared Zod schema in `lib/order-schema.ts` implementing the full data-model.md "Validation Summary": `lineItems.length >= 1`; each line item's `productId`/`variantId` must resolve against `lib/products.ts`; `1 <= quantity <= 20` per line item; `customerEmail` valid email format; `ageAndResearchUseAck === true` (hard requirement, request rejected otherwise); all required `Address` fields (`line1`, `city`, `region`, `postalCode`, `country`) non-empty
- [ ] T010 Create static catalog data module `lib/products.ts` with several `Product` entries (each `active: true`, ≥1 image, a `disclaimer` string defaulting to the standard research-use text, optional `coaUrl`, and ≥1 `Variant` with `id`, `label`, `priceCents > 0`) per data-model.md
- [ ] T011 [P] Build `components/disclaimer-banner.tsx` rendering the standard "research/laboratory use only — not for human consumption" disclaimer (FR-002, Principle I)
- [ ] T012 [P] Build `lib/cart-store.ts`: React context + `localStorage`-backed cart state with add/update-quantity/remove-line-item/clear operations, per research.md's client-side cart decision
- [ ] T013 Wire root `app/layout.tsx` with header (site name + cart link), footer, and global Tailwind styles; mount the cart context provider from T012

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Browse Product Catalog (Priority: P1) 🎯 MVP

**Goal**: A visitor can load the site and see every active product with name, image, starting price, and the research-use disclaimer.

**Independent Test**: Load the catalog page directly; confirm every active product from `lib/products.ts` appears with name, image, starting price, and the disclaimer is visible; confirm no horizontal scroll from 320px–1920px.

### Implementation for User Story 1

- [ ] T014 [P] [US1] Build `components/product-card.tsx` displaying a product's name, representative image, short description, and starting price (lowest variant `priceCents`)
- [ ] T015 [US1] Implement `app/page.tsx` catalog page: fetch all `active: true` products from `lib/products.ts`, render via `product-card.tsx` in a responsive grid, and include `disclaimer-banner.tsx` (FR-001, FR-002)
- [ ] T016 [US1] Apply responsive grid/spacing to `app/page.tsx` (mobile single-column → tablet/desktop multi-column) guided by the `/impeccable` design skill; verify no horizontal scrolling and no overlapping content from 320px–1920px (FR-013, SC-005)

**Checkpoint**: Catalog is fully browsable and independently testable/demoable.

---

## Phase 4: User Story 2 - View Product Details & Select a Variant (Priority: P1)

**Goal**: A visitor can open any product, read full details, and select a variant + quantity to add to their order.

**Independent Test**: Navigate directly to `/products/[slug]` for a known product; confirm full description, all variants with prices, and disclaimer render; select a variant and quantity and confirm the line subtotal updates; confirm adding without a variant selected is blocked.

### Implementation for User Story 2

- [ ] T017 [P] [US2] Build `components/variant-selector.tsx`: variant choice control (radio/select) + quantity input constrained to `1 <= quantity <= 20` (data-model.md), computing `lineSubtotalCents = variant.priceCents * quantity`
- [ ] T018 [US2] Implement `app/products/[slug]/page.tsx`: look up the product by slug in `lib/products.ts` (404/not-found state if missing or `active: false`), render full description, images, `coaUrl` link when present, `disclaimer-banner.tsx`, and `variant-selector.tsx` (FR-003)
- [ ] T019 [US2] Wire an "Add to order" action on the product page that calls `lib/cart-store.ts` to add the selected `{ productId, variantId, quantity }`; disable/block the action with a clear inline message when no variant is selected (Acceptance Scenario 3)
- [ ] T020 [P] [US2] Build `components/cart-summary.tsx` showing current cart line items (product name, variant label, quantity, subtotal) and running total; mount it from the header (T013) and the product page

**Checkpoint**: Catalog browsing + product detail + cart-building are fully functional together.

---

## Phase 5: User Story 3 - Age & Research-Use Acknowledgment Gate (Priority: P1)

**Goal**: A customer cannot submit an order without explicitly acknowledging they are 18+ and that products are for research/laboratory use only, not for human consumption.

**Independent Test**: With ≥1 item in the cart, go to `/order`, attempt to submit without checking the acknowledgment control, and confirm the action is rejected with a clear message; check it and confirm the acknowledgment-specific block is lifted.

### Implementation for User Story 3

- [ ] T021 [US3] Implement `app/order/page.tsx` skeleton: render `cart-summary.tsx`, block navigation here with a message if the cart is empty (FR-008 empty-order case), and add the 18+/research-use acknowledgment checkbox control
- [ ] T022 [US3] Implement `app/order/actions.ts` Server Action `submitOrder` (stub): parse input through `lib/order-schema.ts` (T009) and return `{ ok: false, error: { code: "VALIDATION_ERROR", ... } }` per contracts/submit-order.md when `ageAndResearchUseAck` is false/missing or `lineItems` is empty — full email-sending behavior completes in US4
- [ ] T023 [US3] Wire the order page's submit control to call `submitOrder` and, on a `VALIDATION_ERROR` naming the acknowledgment field, highlight the checkbox and show the required message without clearing other form state (Acceptance Scenarios 1–2)

**Checkpoint**: The acknowledgment gate is independently verifiable even before the full contact/shipping form exists.

---

## Phase 6: User Story 4 - Submit an Order Request (Priority: P1)

**Goal**: A customer completes contact/shipping details and submits their order; the business receives it by email; no payment is processed anywhere.

**Independent Test**: Add a variant to the cart, fill the order form with valid contact/shipping data, check the acknowledgment, submit, and confirm both an on-screen confirmation and an order email are delivered per contracts/submit-order.md.

### Implementation for User Story 4

- [ ] T024 [US4] Extend `app/order/page.tsx` with the contact/shipping form (`customerName`, `customerEmail`, optional `customerPhone`, `shippingAddress.{line1,line2,city,region,postalCode,country}`) using React Hook Form + `@hookform/resolvers/zod` bound to `lib/order-schema.ts`
- [ ] T025 [US4] Implement `lib/email.ts`: Resend client wrapper `sendOrderEmail(order, resolvedLineItems)` sending one email to `ORDER_NOTIFICATION_EMAIL` containing line items (name, variant label, quantity, resolved price, subtotal, order total), contact info, shipping address, the acknowledgment flag, and a server-generated `submittedAt` timestamp (contracts/submit-order.md "Side Effects on Success")
- [ ] T026 [US4] Complete `app/order/actions.ts` `submitOrder`: re-resolve every `productId`/`variantId` against `lib/products.ts` server-side (never trust client-submitted price/labels), compute authoritative totals, call `lib/email.ts` (T025), and return `OrderResult` per contracts/submit-order.md; map a per-item "no longer available" case to a `VALIDATION_ERROR` naming the affected line item (Edge Cases)
- [ ] T027 [US4] Implement `app/order/confirmation/page.tsx`; on successful `submitOrder` response, clear the cart via `lib/cart-store.ts` and route the customer here (contracts/submit-order.md)
- [ ] T028 [US4] Implement duplicate-submission guard on the order form using `useFormStatus`/`useTransition` pending state to disable the submit control while a request is in flight (FR-011)
- [ ] T029 [US4] Handle the `EMAIL_DELIVERY_FAILED` result: show a clear retry message and preserve all entered form data on screen (FR-012)
- [ ] T030 [US4] Render `fieldErrors` from a `VALIDATION_ERROR` `OrderResult` as inline, field-level messages next to the relevant form controls (FR-008)

**Checkpoint**: All four user stories work together end-to-end: browse → view/select → acknowledge → submit → confirmation email.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification and hardening across all stories

- [ ] T031 [P] Responsive polish pass on `app/order/page.tsx` and `app/order/confirmation/page.tsx` per `/impeccable` guidance; verify no horizontal scrolling from 320px–1920px (FR-013, SC-005)
- [ ] T032 [P] Accessibility pass across `app/page.tsx`, `app/products/[slug]/page.tsx`, and `app/order/page.tsx`: semantic landmarks, labeled form controls, keyboard-navigable variant selector and checkbox, sufficient color contrast, alt text on product images (Principle III)
- [ ] T033 [P] Vitest unit tests for `lib/order-schema.ts` covering every rule in data-model.md's Validation Summary, in `tests/unit/order-schema.test.ts`
- [ ] T034 [P] Vitest unit tests for `lib/cart-store.ts` (add/update/remove/clear), in `tests/unit/cart-store.test.ts`
- [ ] T035 Playwright end-to-end test in `tests/e2e/order-flow.spec.ts` covering quickstart.md scenarios 1–4 (browse → product detail → acknowledgment gate → submit → confirmation)
- [ ] T036 Manual verification of quickstart.md scenarios 5–7 (field validation errors, duplicate-submission guard, email-failure path with an invalid `RESEND_API_KEY`)
- [ ] T037 [P] Add root `README.md` documenting local setup, required env vars, and pointers to `.specify/memory/constitution.md` and `specs/001-peptide-storefront/`
- [ ] T038 Configure `RESEND_API_KEY` and `ORDER_NOTIFICATION_EMAIL` as Vercel project environment variables, deploy a preview, and confirm `npm run build` succeeds and the live preview passes quickstart.md scenario 4

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends only on Foundational
- **User Story 2 (Phase 4)**: Depends only on Foundational (T017–T020 touch different files than US1; can run in parallel with Phase 3 if staffed)
- **User Story 3 (Phase 5)**: Depends on Foundational (needs `lib/cart-store.ts`, `lib/order-schema.ts`) and on `cart-summary.tsx` from US2 (T020) to render the order page's cart view
- **User Story 4 (Phase 6)**: Depends on User Story 3's `app/order/page.tsx` skeleton and `submitOrder` stub (T021–T022)
- **Polish (Phase 7)**: Depends on all four user stories being complete

### Within Each User Story

- US1: `product-card.tsx` (T014) before the catalog page that renders it (T015); responsive polish (T016) last
- US2: `variant-selector.tsx` (T017) before the product page (T018); add-to-order wiring (T019) after; `cart-summary.tsx` (T020) can be built in parallel with T017–T019
- US3: order page skeleton (T021) and the Server Action stub (T022) can be built in parallel, then wired together (T023)
- US4: form fields (T024) and email wrapper (T025) can be built in parallel, then both feed the completed Server Action (T026); confirmation page, duplicate-guard, and error handling (T027–T030) follow

### Parallel Opportunities

- Setup: T003, T004, T005, T006 in parallel after T001–T002
- Foundational: T011 and T012 in parallel after T008–T010
- Once Foundational completes: Phase 3 (US1) and Phase 4 (US2) can proceed in parallel
- Polish: T031–T034 and T037 in parallel; T035–T036 and T038 run after the app is feature-complete

---

## Parallel Example: Foundational Phase

```bash
# After T008-T010 (types, schema, catalog data) land:
Task: "Build components/disclaimer-banner.tsx rendering the standard research-use disclaimer"
Task: "Build lib/cart-store.ts: React context + localStorage-backed cart state"
```

## Parallel Example: User Story 2

```bash
Task: "Build components/variant-selector.tsx with quantity 1-20 and subtotal calculation"
Task: "Build components/cart-summary.tsx showing cart line items and running total"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Browse Catalog)
4. **STOP and VALIDATE**: Load the catalog, confirm disclaimer + responsive layout
5. Deploy/demo if ready — this alone proves out hosting, data model, and design direction

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add US1 (Browse Catalog) → validate → demo
3. Add US2 (Product Detail & Variant Selection) → validate → demo
4. Add US3 (Acknowledgment Gate) → validate the block/unblock behavior → demo
5. Add US4 (Submit Order) → validate end-to-end email delivery → this completes the commercial flow
6. Polish (Phase 7) → responsive/accessibility/test hardening → deploy to Vercel

### Notes

- All four user stories are P1 because each is a mandatory link in the single
  purchase-request chain described in spec.md; there is no meaningful partial
  product without all four, but they remain independently testable per the
  Independent Test criteria above.
- Principle I (Legal & Compliance First) and Principle II (No Payment
  Processing) apply across every phase — no task in this list introduces a
  payment field, and the acknowledgment gate (US3) is enforced server-side
  (T022/T026), not just in the UI.
