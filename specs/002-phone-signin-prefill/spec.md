# Feature Specification: Phone Sign-In and Remembered Quote Details

**Feature Branch**: `002-phone-signin-prefill`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "When submitting a quote and the user hasn't
signed in yet with their phone number and got verified, it should navigate
them to sign in and verify their phone number; if they already did it
before, skip. Also modify the quote page so the user doesn't have to write
their details many times (remember/prefill details)."

## Clarifications

### Session 2026-09-20

- Q: How long should a visitor stay signed in after verifying their phone before being asked for a code again? → A: 30 days.
- Q: When a sign-in has expired but the browser still holds remembered details, should the quote form still prefill them? → A: No; the form shows no remembered details until the visitor signs in again, and then they fill in.
- Q: Besides pressing Submit, should visitors have another way to sign in and out, such as a header link? → A: No header entry; sign-in is triggered only by Submit, and a signed-in visitor sees a "signed in as <number>" line with Sign out and Clear my details on the quote page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In With Phone When Submitting a Quote (Priority: P1)

A visitor who has built a quote request and presses Submit without having
verified their phone number is taken to a sign-in step where they enter
their phone number and the one-time code sent to it. Once verified, they
land back on their quote request — with everything they had already typed
and their cart intact — and the submission completes without asking them to
verify again.

**Why this priority**: This replaces the current inline, per-submission
phone check with a proper sign-in step, and is the gate that every
submission passes through. The prefill story depends on it, because
remembered details are only offered to a signed-in visitor.

**Independent Test**: In a fresh browser with items in the quote cart,
fill in the quote form and press Submit. Confirm the visitor is sent to
the sign-in step, that completing the code check returns them to the quote
page with all typed values and cart items preserved, and that the request
can then be submitted.

**Acceptance Scenarios**:

1. **Given** a visitor with items in their quote cart who has never
   signed in, **When** they press Submit on the quote form, **Then** they
   are taken to a sign-in step that asks for their phone number, and no
   quote request is sent yet.
2. **Given** the visitor is on the sign-in step, **When** they enter a
   valid phone number and then the correct one-time code they receive,
   **Then** they are signed in and returned to the quote page with their
   cart and previously typed details preserved.
3. **Given** the visitor has just signed in from a submit attempt,
   **When** they arrive back on the quote page, **Then** they can complete
   the submission with a single further action and are not asked to verify
   their phone again.
4. **Given** a visitor who signed in earlier and whose sign-in is still
   valid, **When** they press Submit on a later visit, **Then** the
   sign-in step is skipped entirely and the request is submitted.
5. **Given** a visitor who signed in long enough ago that the sign-in has
   expired, **When** they press Submit, **Then** they are treated as
   signed out and taken to the sign-in step again, with their cart and
   typed details preserved.
6. **Given** the visitor is on the sign-in step, **When** they enter a
   wrong or expired code, **Then** they see a clear translated error, can
   retry or request a new code (with the existing resend wait), and are
   not signed in.
7. **Given** the visitor is on the sign-in step, **When** they choose to
   leave without signing in, **Then** they can return to the quote page
   with their cart and typed details intact.

---

### User Story 2 - Don't Retype Details on the Quote Page (Priority: P1)

A returning visitor who signs in (or is already signed in) sees their name,
email, phone number and shipping address already filled in on the quote
page. They can review and change any of it, and the details they last
submitted are remembered for next time, so they only ever type them once.

**Why this priority**: This is the second half of the request — the direct
reduction in effort for repeat quotes. It is P1 because retyping the same
name, email and full address on every quote is the main friction being
removed.

**Independent Test**: Submit one quote with a full set of details. Start a
second quote in the same browser and confirm the contact and address
fields are already filled in with the previously submitted values, and
that editing them and submitting again updates what is remembered.

**Acceptance Scenarios**:

1. **Given** a signed-in visitor who has previously submitted a quote,
   **When** they open the quote page with items in their cart, **Then**
   name, email, phone and shipping address are prefilled with their last
   submitted values.
2. **Given** prefilled details, **When** the visitor edits any field and
   submits, **Then** the edited values are used for that request and
   become the remembered details for next time.
3. **Given** a visitor who has never submitted a quote, **When** they open
   the quote page, **Then** the form is empty and nothing is prefilled.
4. **Given** a visitor who is signed in, **When** they view the quote
   page, **Then** their verified phone number is shown as already
   verified and cannot be edited on the quote form without signing in
   again with the new number.
5. **Given** a visitor typing details while signed out, **When** they are
   sent to sign in and come back, **Then** what they typed is still in
   the form and is not overwritten by older remembered details.
6. **Given** remembered details exist, **When** the visitor chooses to
   clear or forget them, **Then** the stored details are removed and the
   form is empty on the next visit.
7. **Given** the visitor changes the notes field or the acknowledgment
   checkbox, **When** they submit, **Then** notes are not remembered
   between quotes and the 18+/research-use acknowledgment must be given
   again for every submission.

---

### User Story 3 - Sign Out / Use a Different Number (Priority: P3)

A visitor on a shared or borrowed device can end their sign-in so the next
person using that browser does not see their remembered details or submit
quotes under their verified number.

**Why this priority**: A safety and privacy control that matters because
the site now remembers personal details. It is not needed for the core
flow to work, so it ranks below the two stories above.

**Independent Test**: Sign in and submit a quote, choose sign out, then
open the quote page and confirm the form is empty and pressing Submit
leads to the sign-in step again.

**Acceptance Scenarios**:

1. **Given** a signed-in visitor, **When** they choose to sign out,
   **Then** their sign-in ends, their remembered details are removed from
   that browser, and their cart is left untouched.
2. **Given** a signed-out visitor at the sign-in step, **When** they
   verify a different phone number than before, **Then** they are signed
   in as that number and details remembered for the previous number are
   not prefilled.

---

### Edge Cases

- The visitor's cart is empty when they reach the sign-in step: they are
  sent to the catalog/quote summary rather than left in a dead end.
- The visitor opens the sign-in step directly (not from a submit
  attempt): after signing in they are taken to the quote page if their
  cart has items, otherwise to the catalog.
- The visitor is sent to sign in in one language and switches language
  mid-way: the sign-in step, errors, and return trip all keep working in
  the chosen language, and the typed details are preserved.
- The visitor's browser blocks or clears stored data: sign-in and
  submission still work, and the form simply starts empty; nothing breaks.
- The visitor is signed in in one browser tab and signs out in another:
  the next submit attempt in the first tab is treated as signed out and
  leads to sign-in.
- The one-time code cannot be sent (provider failure) or the visitor
  requests codes too often: the existing error and wait-time behavior
  applies and the visitor stays on the sign-in step with a clear message.
- The visitor is signed in but the sign-in expires between page load and
  pressing Submit: the submission is rejected, they are sent to sign in
  again, and nothing typed is lost.
- Remembered details fail validation against current rules (for example
  an old, incomplete address): they are prefilled as-is and the normal
  field errors appear on submit rather than being silently dropped.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A quote request MUST NOT be accepted unless the submitter has
  a valid signed-in session for the exact phone number on the request.
- **FR-002**: When a visitor without a valid signed-in session presses
  Submit, the system MUST take them to a sign-in step instead of showing
  an inline verification control on the quote form.
- **FR-003**: The sign-in step MUST ask for a phone number, send a
  one-time code to it, and sign the visitor in only after the correct
  code is entered; the code rules, resend wait and failure behavior MUST
  match the phone verification already in place.
- **FR-004**: After a successful sign-in the system MUST return the
  visitor to the quote page with their cart and every value they had
  typed preserved.
- **FR-005**: A visitor with a still-valid sign-in MUST NOT be asked to
  verify their phone again when submitting; the sign-in step MUST be
  skipped.
- **FR-006**: A sign-in MUST expire 30 days after the last successful
  code check; an expired sign-in MUST be treated the same as no
  sign-in.
- **FR-007**: The quote form MUST prefill name, email, phone number and
  shipping address from the visitor's most recently submitted request
  only while they have a valid sign-in, and MUST leave the form empty
  when there is nothing to remember or when the sign-in is missing or
  expired. Once the visitor signs in, remembered details fill only the
  fields they have not already typed into.
- **FR-008**: The system MUST remember the details of each successfully
  submitted request as the new prefill values, replacing the previous
  ones.
- **FR-009**: All prefilled fields MUST remain editable, except the
  verified phone number, which MUST only change by signing in with the
  new number.
- **FR-010**: Values the visitor has typed in the current session MUST
  take precedence over remembered details and MUST survive the round trip
  to the sign-in step.
- **FR-011**: The system MUST NOT remember the notes field or the
  18+/research-use acknowledgment; the acknowledgment MUST be required
  afresh on every submission (Constitution Principle I).
- **FR-012**: While signed in, the quote page MUST show a line stating
  which phone number the visitor is signed in as, with a Sign out
  control and a Clear my details control. Signing out or clearing MUST
  remove the stored details from that browser. No sign-in or sign-out
  entry is added to the site header.
- **FR-013**: Remembered details and sign-in MUST be scoped to the
  visitor's own browser; one visitor's details MUST NOT be shown to
  another visitor.
- **FR-014**: The sign-in step, its errors, and all new labels and
  messages MUST be available in English and Arabic, with correct
  right-to-left layout in Arabic and Latin values such as phone numbers
  isolated for bidirectional text.
- **FR-015**: The sign-in step and the quote page MUST remain fully usable
  and accessible on mobile, tablet and desktop, with keyboard navigation
  and visible error states.
- **FR-016**: The research-use disclaimer MUST remain visible on the
  quote page and the sign-in step, and the flow MUST continue to present
  itself as a request for a quote, never a purchase.
- **FR-017**: The existing protections on quote submission (spam
  honeypot, per-IP rate limiting, server-side re-validation of every
  field and line item) MUST continue to apply unchanged.
- **FR-018**: No payment fields, prices or totals may be introduced by
  this feature (Constitution Principles II and V).

### Key Entities *(include if feature involves data)*

- **Sign-in Session**: Proof that a browser has verified ownership of one
  specific phone number; has an expiry time; tied to exactly one phone
  number; can be ended by the visitor.
- **Remembered Details**: The name, email, phone number and shipping
  address from the visitor's last submitted request, kept only in that
  visitor's browser and offered as prefill values; never includes notes
  or the acknowledgment.
- **Quote Draft**: The cart plus whatever the visitor has typed on the
  quote form so far, which must survive the trip to sign in and back.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can go from pressing Submit to a
  submitted quote, including phone sign-in, in under 3 minutes, without
  re-entering any detail they had already typed.
- **SC-002**: A returning, still-signed-in visitor can submit a repeat
  quote in under 1 minute, with no verification step and no retyping of
  name, email, phone or address.
- **SC-003**: 100% of submitted quote requests carry a phone number that
  the submitter has verified in a valid sign-in session — submission is
  technically impossible otherwise (preserves the existing SC-008 of the
  storefront spec).
- **SC-004**: In usability testing, at least 90% of returning visitors
  complete a repeat quote without editing any prefilled contact or
  address field.
- **SC-005**: 0 cases in testing where details typed before being sent to
  sign in are lost on return, in either language.
- **SC-006**: After sign-out, 0 remembered details remain visible to the
  next user of that browser.
- **SC-007**: The sign-in step and updated quote page pass the same
  320px–1920px, LTR/RTL layout audit as the rest of the site, with zero
  untranslated strings.

## Assumptions

- This feature intentionally revises the storefront spec's "guest-only; no
  customer accounts, login, or request-history" assumption. Ordering stays
  guest-like: there are still no passwords, no profile page, no order
  history, and no stored user records. "Signed in" means only "this
  browser has verified this phone number recently."
- A sign-in lasts 30 days from the last successful code check, after which
  the visitor verifies again. The existing 30-minute verification window
  is replaced by this longer sign-in period.
- Remembered details live only in the visitor's own browser (per device).
  They are not shared across devices or browsers, and the business does
  not keep them; a submitted request still exists only as the outbound
  email. Syncing across devices would require storing customer records
  server-side, which is out of scope.
- Because sign-in is a lightweight, cookie-style session with no user
  database, it is expected to fit Constitution Principle IV ("no
  database", "no auth systems beyond scope"); the planning step MUST
  confirm this and, if not, propose a constitution amendment rather than
  quietly adding infrastructure.
- Only the most recent set of details is remembered (one profile per
  browser), not multiple saved addresses.
- The sign-in step reuses the existing SMS one-time-code provider and its
  development fallback behavior; no new provider is introduced.
- The 18+/research-use acknowledgment and notes are per-request and never
  remembered.
- The shipping address is a single required free-text field (street, city and country); there is no postal code and no separate city/region/country fields. This supersedes the multi-field address in the storefront spec.
- Email and address are remembered and prefilled but are not themselves
  verified; only the phone number is.
