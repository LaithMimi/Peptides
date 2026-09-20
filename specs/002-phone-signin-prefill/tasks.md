---
description: "Task list for Phone Sign-In and Remembered Quote Details"
---

# Tasks: Phone Sign-In and Remembered Quote Details

**Input**: Design documents from `/specs/002-phone-signin-prefill/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/session-actions.md, contracts/browser-storage.md, quickstart.md

**Tests**: Not requested as TDD in spec.md. plan.md names Vitest (session, storage, schema) and Playwright (sign-in gate, prefill, sign-out) as the testing approach, so test tasks sit inside each story phase, written alongside the implementation.

**Organization**: Grouped by user story from spec.md: US1 (Sign in when submitting, P1), US2 (Don't retype details, P1), US3 (Sign out / use a different number, P3). Every new string goes into both `messages/en.json` and `messages/ar.json` (parity test enforces it). Load `~/.claude/skills/impeccable/reference/craft-floor.md` and read `DESIGN.md` before any UI task (CLAUDE.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3
- Paths follow plan.md's Project Structure (single Next.js App Router project)

---

## Phase 1: Setup

**Purpose**: Configuration only; no new dependencies are added.

- [X] T001 [P] Update `.env.local.example` to document that `PHONE_TOKEN_SECRET` now also signs the 30-day `pepclub_session` cookie (required in production, dev fallback allowed only when `NODE_ENV !== "production"`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The session module, storage helpers, and shared type/schema changes that every story builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Create `lib/session.ts` replacing `lib/phone-token.ts`: reuse the existing HMAC-SHA256 sign + timing-safe compare with secret `PHONE_TOKEN_SECRET` (throw in production if unset, dev fallback otherwise). Export `SESSION_COOKIE = "pepclub_session"`, `SESSION_TTL_SECONDS = 30 * 24 * 60 * 60`, `createSession(phone, now?) → { value, expiresAt }` (payload `{ p: E.164 phone, exp: unix seconds }`, wire format `<base64url(JSON)>.<signature>`), `readSession(value, now?) → { phone } | null` (null when malformed, badly signed, or `exp <= now`; never throws), and `getSessionPhone() → string | null` reading the cookie via `cookies()` from `next/headers`
- [X] T003 [P] Create `tests/unit/session.test.ts` (migrate cases from `tests/unit/phone-token.test.ts`): fresh session reads back its phone; expired at `exp` boundary (30 days) is null; tampered payload, tampered signature and malformed values are null; production without `PHONE_TOKEN_SECRET` does not accept sessions. Then delete `lib/phone-token.ts` and `tests/unit/phone-token.test.ts`
- [X] T004 [P] Create `lib/quote-storage.ts` per contracts/browser-storage.md: `readProfile/writeProfile/clearProfile` on `localStorage["pepclub.profile"]` and `readDraft/writeDraft/takeDraft/clearDraft` on `sessionStorage["pepclub.quoteDraft"]`. Shapes: profile `{ version: 1, phone, customerName, customerEmail, shippingAddress: { line1, line2?, city, region, postalCode, country } }`; draft `{ version: 1, customerName, customerEmail, shippingAddress, notes }`. Never store notes or the acknowledgment in the profile; never store the acknowledgment or phone in the draft. Every read/write wrapped in try/catch; corrupt or wrong-`version` data is treated as absent; nothing throws when storage is blocked
- [X] T005 [P] Create `tests/unit/quote-storage.test.ts`: round-trip profile and draft; `takeDraft` deletes after reading; corrupt JSON and wrong `version` return null; storage that throws (stub `Storage.prototype`) yields null/no-op; profile never contains `notes` or an acknowledgment key
- [X] T006 Update `types/catalog.ts`: remove `customerPhone` and `phoneVerificationToken` from `QuoteRequestInput`; change `VerifyPhoneCodeResult` success to `{ ok: true; phone: string }`; add `"NOT_SIGNED_IN"` to the `QuoteRequestResult` error codes
- [X] T007 Update `lib/quote-schema.ts`: remove `customerPhone` and `phoneVerificationToken` from `quoteRequestSchema` (the server injects the session phone), and make `quoteContactFormSchema` omit only `lineItems` and `locale`. Update `tests/unit/quote-schema.test.ts` for the removed fields and confirm `ageAndResearchUseAck` is still `ackRequired` when unchecked. Adjust the `lib/email.ts` request type so it still receives `customerPhone` (from the session) alongside the parsed data
- [X] T008 Add `errors.notSignedIn` and the new `signIn` namespace skeleton keys to `messages/en.json` and `messages/ar.json` (titles/labels filled in by T012 and T017); keep `tests/unit/messages-parity.test.ts` green

**Checkpoint**: Session + storage libraries exist and are unit-tested; types and schema compile with the new shapes (`npx tsc --noEmit -p tsconfig.json` will still fail until US1 updates the callers).

---

## Phase 3: User Story 1 - Sign In With Phone When Submitting a Quote (Priority: P1) 🎯 MVP

**Goal**: Submitting while signed out sends the visitor to a phone + code sign-in step, then back to the quote page with cart and typed values intact; a valid 30-day session skips the step. Server accepts a quote only with a valid session.

**Independent Test**: Quickstart scenarios 1, 2, 6, 7 — fresh browser with a cart, fill the form, Submit → land on `/signin`, verify with `000000` → back on `/quote` with values preserved and acknowledgment unchecked → Submit succeeds without another code.

### Implementation for User Story 1

- [X] T009 [US1] Update `app/[locale]/quote/otp-actions.ts`: on a correct code in `verifyPhoneCode`, call `createSession(phone)` and set cookie `SESSION_COOKIE` via `cookies()` with `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"`, `maxAge: SESSION_TTL_SECONDS`; return `{ ok: true, phone }` (no token). Failure paths and rate limits unchanged and must not set or alter the cookie. Replace the `lib/phone-token` import
- [X] T010 [US1] Update `app/[locale]/quote/actions.ts` `submitQuoteRequest`: after the rate-limit and honeypot checks, call `getSessionPhone()`; if null return `{ ok: false, error: { code: "NOT_SIGNED_IN", message: t("notSignedIn") } }`; validate the input with the updated `quoteRequestSchema`; build the email payload with `customerPhone` = the session phone. Remove the `verifyPhoneToken` / `phoneVerificationToken` logic and the `phoneNotVerified` entry from `translateErrorCode` only if no longer referenced
- [X] T011 [US1] Rework `components/phone-verification.tsx` into the sign-in step's core: it now owns its phone input (`type="tel"`, `dir="ltr"`, `autoComplete="tel"`, label `signIn.phoneLabel`), keeps the existing send/verify/resend-cooldown/error behavior, drops the `onVerified(token, …)`/`onReset` token plumbing in favor of `onSignedIn(phone)`, and no longer needs the 30-minute expiry timer. Show the number via `components/ltr-value.tsx`
- [X] T012 [US1] Create `components/signin-form.tsx` and `app/[locale]/signin/page.tsx`. The page (server component, `setRequestLocale`) renders `DisclaimerBanner`, the sign-in form, and a "Back to quote request" link; if `getSessionPhone()` is non-null it redirects to `/quote`. `SigninForm` (client) wraps `PhoneVerification`; on success it navigates with the localized router from `@/i18n/navigation` to `/quote` when `useCart().items.length > 0`, else `/`. No query parameters. Sign-in copy states the number is used only to verify the request, not to create an account, and that a cookie keeps them signed in for 30 days. Add all `signIn.*` strings to `messages/en.json` and `messages/ar.json`
- [X] T013 [US1] Update `app/[locale]/quote/page.tsx` to read `getSessionPhone()` and pass `sessionPhone: string | null` to `QuoteForm` (page becomes dynamically rendered; other routes stay static)
- [X] T014 [US1] Update `components/quote-form.tsx`: accept `sessionPhone` prop; remove the phone field, `PhoneVerification`, `verifiedPhone` state and `phoneToken` logic; when signed out show a short note `quoteForm.phoneVerifiedOnSubmit`, when signed in show a "Signed in as `<LtrValue phone>`" line (`quoteForm.signedInAs`). In `onSubmit`, after zod validation: if `sessionPhone` is null → `writeDraft({ customerName, customerEmail, shippingAddress, notes })` (never the acknowledgment) and `router.push("/signin")`; otherwise call `submitQuoteRequest` (no phone/token). If the result is `NOT_SIGNED_IN`, treat it the same way (save draft, navigate to `/signin`). On mount, `takeDraft()` and reset the form with it (acknowledgment stays unchecked). Update `knownErrorCodes`/`knownFieldPaths` for removed fields; add new strings to both message files
- [X] T015 [US1] Update `tests/e2e/quote-flow.spec.ts` for the new flow (no inline phone verification; Submit → `/en/signin` → code `000000` → back to quote → acknowledgment → submit → confirmation) in English and Arabic, and add `tests/e2e/signin-prefill.spec.ts` covering: values and cart preserved across the round trip, acknowledgment unchecked on return, wrong code shows a translated error and does not sign in, second Submit while signed in goes straight to confirmation, deleting the `pepclub_session` cookie then Submit returns to sign-in with values kept, visiting `/en/signin` while signed in redirects to `/en/quote`
- [X] T016 [US1] Run `npx tsc --noEmit -p tsconfig.json`, `npm run lint`, `npm run test` and fix fallout from the removed phone fields (including any remaining `phone-token` imports)

**Checkpoint**: US1 is fully functional and demonstrable on its own — the unverified-phone path is gone, sign-in gates every submission, and returning visitors skip it.

---

## Phase 4: User Story 2 - Don't Retype Details on the Quote Page (Priority: P1)

**Goal**: A signed-in visitor sees name, email and address prefilled from their last submitted quote; edits are respected and become the new remembered details.

**Independent Test**: Quickstart scenario 3 — submit one quote, start another in the same browser and confirm the fields are prefilled, then edit a field, submit, and confirm the edit is remembered.

**Depends on**: US1 (session cookie and the reworked quote form).

### Implementation for User Story 2

- [X] T017 [US2] In `components/quote-form.tsx`, on mount when `sessionPhone` is set: `readProfile()` and, only if `profile.phone === sessionPhone`, prefill `customerName`, `customerEmail` and `shippingAddress` — only fields the visitor has not already typed and that were not restored from a draft (draft values win, FR-010). Notes stay empty and the acknowledgment unchecked. When signed out, or the profile is missing/mismatched/corrupt, leave the form empty (remembered details are never shown to a signed-out visitor, clarification Q2)
- [X] T018 [US2] In `components/quote-form.tsx` `onSubmit`, on a successful `submitQuoteRequest`: `writeProfile({ version: 1, phone: sessionPhone, customerName, customerEmail, shippingAddress })` (replacing the previous profile; no notes, no acknowledgment) and `clearDraft()` before `clear()` and navigating to `/quote/confirmation`
- [X] T019 [P] [US2] Extend `tests/e2e/signin-prefill.spec.ts`: after a first submission a second quote is prefilled (name, email, full address; notes empty; acknowledgment unchecked); editing a field and submitting updates what the third quote prefills; a signed-out visitor with a stored profile sees an empty form; a profile for a different number is not prefilled (quickstart scenarios 3 and 4, prefill half)
- [X] T020 [P] [US2] Add a component test `tests/unit/quote-form-prefill.test.tsx` (Vitest + Testing Library, mocking `next-intl` and the server actions): prefill applies only when `sessionPhone` matches `profile.phone`; draft values override profile values; corrupt profile leaves the form empty and renders without throwing; remember to call `__resetCartStoreForTests()` in `beforeEach`

**Checkpoint**: US1 and US2 both work — repeat quotes need only the acknowledgment.

---

## Phase 5: User Story 3 - Sign Out / Use a Different Number (Priority: P3)

**Goal**: A visitor on a shared device can end their sign-in and wipe remembered details; signing in with a different number never shows the previous person's details.

**Independent Test**: Quickstart scenarios 4 and 5 — sign in and submit, press Sign out, confirm the form is empty and Submit leads to `/signin` with the cart untouched; press Clear my details and confirm fields are empty while still signed in.

**Depends on**: US1 (signed-in line) and US2 (profile exists to clear).

### Implementation for User Story 3

- [X] T021 [US3] Add `signOut()` to `app/[locale]/quote/otp-actions.ts`: delete `SESSION_COOKIE` via `cookies()`, idempotent, always returns `{ ok: true }`
- [X] T022 [US3] In `components/quote-form.tsx`, extend the signed-in line with two buttons (styled like the existing `buttonClass` in `components/phone-verification.tsx`, ≥44px touch targets, visible focus): **Sign out** → `await signOut()`, `clearProfile()`, `clearDraft()`, reset the form to empty, `router.refresh()` so the server re-reads the cookie (cart untouched); **Clear my details** → `clearProfile()`, reset the form to empty, announce `quoteForm.detailsCleared` in a `role="status"` region, remain signed in. Add `quoteForm.signOut`, `quoteForm.clearDetails`, `quoteForm.detailsCleared` to both message files. No sign-in/sign-out entry is added to `components/site-header.tsx` (FR-012)
- [X] T023 [US3] Extend `tests/e2e/signin-prefill.spec.ts`: Sign out empties the form, removes the `pepclub_session` cookie and `pepclub.profile`, keeps the cart, and the next Submit goes to `/signin`; Clear my details empties the form but the visitor stays signed in; after signing out and verifying a second number the first number's details are not prefilled

**Checkpoint**: All three stories work independently and together.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T024 [P] Apply `DESIGN.md` and the `/impeccable` craft-floor to the new sign-in page and the signed-in line: white/off-white ground, label-shaped card, no kicker/eyebrow lines above headings, correct spacing, focus order and screen-reader announcements in both directions
- [X] T025 [P] RTL and responsive audit of `/en/signin`, `/ar/signin`, `/en/quote`, `/ar/quote` at 320px, 768px and 1920px: no horizontal scroll; phone numbers isolated with `components/ltr-value.tsx`; disclaimer visible on both pages (quickstart scenarios 9 and 10; extend `tests/e2e/responsive.spec.ts`)
- [X] T026 [P] Update `CLAUDE.md` "No database — a few Server Actions" and the OTP paragraph: sign-in is now a signed 30-day cookie via `lib/session.ts` (replacing `lib/phone-token.ts`), the server reads the phone from the cookie, and remembered details/draft live in the browser (`lib/quote-storage.ts`). Update 001's `spec.md` assumption "guest-only; no customer accounts, login…" with a pointer to `specs/002-phone-signin-prefill/spec.md`
- [ ] T027 Run the full quickstart (scenarios 1–10 in both locales) plus `npx tsc --noEmit -p tsconfig.json`, `npm run lint`, `npm run test`, `npm run test:e2e`; record results in `quickstart.md`
- [ ] T028 Preview-deploy check (needs the user's Vercel account and Twilio/Resend credentials, same blocker as 001's T044): confirm `pepclub_session` is `HttpOnly` and `Secure`, sign-in fails closed with `PHONE_TOKEN_SECRET` unset, and the compliance review covers whether a cookie notice is needed in the markets served

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: none
- **Foundational (Phase 2)**: after Setup; blocks all stories
- **US1 (Phase 3)**: after Foundational
- **US2 (Phase 4)**: after US1 (needs the session and reworked form)
- **US3 (Phase 5)**: after US1; best after US2 so there is a profile to clear
- **Polish (Phase 6)**: after the stories you intend to ship

### Within phases

- T002 before T003 and T009/T010; T006 and T007 before T010 and T014
- T008 before any task that adds strings (T012, T014, T022)
- T009 and T010 (different files) can run in parallel; T011 before T012; T013 before T014
- T014 is the largest edit to `components/quote-form.tsx`; T017, T018 and T022 also edit it, so they run sequentially in that order

### Parallel opportunities

- Foundational: T003, T004/T005 in parallel after T002 (T004 is independent of T002)
- US1: T009 ∥ T010; T011 ∥ T013 once T009 is done
- US2: T019 ∥ T020
- Polish: T024, T025, T026 in parallel

### Parallel example: Foundational

```text
T002 lib/session.ts
then in parallel:
  T003 tests/unit/session.test.ts
  T004 lib/quote-storage.ts  →  T005 tests/unit/quote-storage.test.ts
  T006 types/catalog.ts  →  T007 lib/quote-schema.ts
```

## Implementation Strategy

### MVP first (US1 only)

1. Phases 1–2 (foundation), then Phase 3 (US1).
2. Stop and validate quickstart scenarios 1, 2, 6, 7. At this point every submission requires a verified phone via the new sign-in step and returning visitors skip it — the first half of the request is delivered.

### Incremental delivery

1. Foundation → US1 (MVP) → validate.
2. US2 (prefill) → validate scenarios 3–4.
3. US3 (sign out / clear) → validate scenario 5; ship US2 and US3 together if the shared-device risk of remembering details matters at launch (recommended: do not ship US2 without US3).
4. Polish and the preview-deploy check.

## Notes

- Removing the phone field from the quote form is deliberate (plan D2): the phone number comes only from the session.
- Never persist the acknowledgment or notes in the profile, and never persist the acknowledgment in the draft (FR-011, Constitution Principle I).
- The `getServerSnapshot` caching rule in CLAUDE.md applies if any task ends up adding a `useSyncExternalStore` store; the plan currently doesn't need one.
