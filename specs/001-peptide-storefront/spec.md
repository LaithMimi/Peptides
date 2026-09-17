# Feature Specification: Peptide Storefront (Catalog + Quote-Request Capture)

**Feature Branch**: `001-peptide-storefront`

**Created**: 2026-09-17

**Status**: Draft (amended after real product content was provided)

**Input**: User description: "A responsive, bilingual (English + Arabic, RTL)
website to present research peptides. Multiple products, each with a vial
size. No payment gateway and no published prices — customers submit a quote
request (product(s), vial(s), quantity, contact info); the business receives
it by email, quotes pricing, and fulfills/invoices manually. All products
marketed strictly as research/laboratory use only, not for human
consumption, framed around 'research areas of interest' rather than
therapeutic claims, with an 18+ and research-use acknowledgment required
before submission."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Product Catalog (Priority: P1)

A visitor lands on the site, in either English or Arabic, and browses the
full list of available research peptide products to see what's offered, at
a glance, before deciding what to look at in detail.

**Why this priority**: Without a browsable catalog there is no funnel into
the rest of the site — this is the entry point for every other story.

**Independent Test**: Load the catalog page directly in each supported
language and confirm every active product is listed with name, image, and a
short research-area summary, with the research-use disclaimer visible on
the page and the page laid out correctly for that language's direction
(LTR for English, RTL for Arabic).

**Acceptance Scenarios**:

1. **Given** the catalog page is loaded in English, **When** the page
   finishes rendering, **Then** every active product appears with name,
   image, a short research-area summary, and a visible "research use only,
   not for human consumption" disclaimer, laid out left-to-right.
2. **Given** the catalog page is loaded in Arabic, **When** the page
   finishes rendering, **Then** the same content renders in Arabic with a
   correct right-to-left layout (navigation, cards, and text direction all
   mirrored appropriately, not just text translated).
3. **Given** the catalog page on a mobile-width viewport (either language),
   **When** the visitor scrolls, **Then** the layout remains usable with no
   horizontal scrolling and no overlapping content.

---

### User Story 2 - View Product Details & Select a Vial (Priority: P1)

A visitor opens a specific product to read its full research-area
description and disclaimers, and chooses a vial size and quantity they're
interested in requesting a quote for.

**Why this priority**: Customers cannot form a quote request without first
seeing what's available — this is the second mandatory step in every
journey.

**Independent Test**: Navigate directly to a product detail page (in either
language, without going through the catalog) and confirm the full
description, research areas, vial size(s), purity, and disclaimer are
visible; select a vial and quantity and confirm the selection is reflected
before adding it to the quote request.

**Acceptance Scenarios**:

1. **Given** a product detail page, **When** it loads, **Then** the product
   name, full research-area description, available vial size(s), purity
   (when available), and the research-use disclaimer are displayed in the
   active language.
2. **Given** a product page, **When** the visitor selects a vial size and a
   quantity, **Then** the page reflects the selected vial and quantity
   before it is added to the quote request. No price or subtotal is shown
   anywhere — pricing is provided by the business after reviewing the quote
   request.
3. **Given** no vial has been selected, **When** the visitor attempts to add
   the product to their quote request, **Then** the system blocks the
   action and indicates a vial must be chosen first.

---

### User Story 3 - Age & Research-Use Acknowledgment Gate (Priority: P1)

Before a quote request can be submitted, the customer must explicitly
confirm they are 18 years or older and that they understand the products
are for research/laboratory use only, not for human consumption.

**Why this priority**: This is a non-negotiable legal/compliance
requirement (see project constitution); no submission may bypass it.

**Independent Test**: Attempt to submit a quote request without checking
the acknowledgment control and confirm the submission is blocked with a
clear message; then check the acknowledgment and confirm submission
proceeds.

**Acceptance Scenarios**:

1. **Given** a quote request ready for submission, **When** the customer
   has not checked the 18+/research-use acknowledgment, **Then** the system
   prevents submission and clearly indicates the acknowledgment is
   required.
2. **Given** the customer has checked the acknowledgment, **When** they
   submit the request, **Then** the acknowledgment is recorded as part of
   the submitted request and submission proceeds.

---

### User Story 4 - Submit a Quote Request (Priority: P1)

A customer who has selected one or more products/vials reviews their full
request (items, vials, quantities), enters their contact details, and
submits it so the business can follow up with pricing and next steps — no
payment or price is collected or shown on the site.

**Why this priority**: This is the site's core conversion action and its
entire commercial purpose; without it the site delivers no business value.

**Independent Test**: Add at least one vial selection to a quote request,
fill in the contact form with valid data, submit it, and confirm both (a)
an on-screen confirmation is shown to the customer and (b) the request
details are delivered to the business by email — with no price or payment
step anywhere in the flow.

**Acceptance Scenarios**:

1. **Given** a quote request with at least one line item and a checked
   acknowledgment, **When** the customer fills in valid contact details and
   submits, **Then** the system shows an on-screen confirmation and sends
   the full request (items, vials, quantities, contact info, and any notes)
   to the business by email.
2. **Given** the quote-request form, **When** a required field is missing
   or invalid (e.g., malformed email), **Then** the system blocks
   submission and shows a clear, field-level error without discarding the
   customer's other entered data.
3. **Given** a submission is in progress, **When** the customer clicks
   submit multiple times in quick succession, **Then** only one request is
   sent.
4. **Given** the notification email fails to send, **When** submission is
   attempted, **Then** the customer sees a clear failure message and their
   entered data remains on screen so they can retry.

### Edge Cases

- What happens when a visitor tries to submit a quote request with no
  selected items? System MUST block submission and indicate at least one
  item is required.
- How does the system handle a product or vial that has been removed or is
  unavailable while a customer is mid-request? System MUST surface which
  item is affected and let the customer adjust before resubmitting.
- What happens if a customer navigates away and returns before submitting?
  In-progress selections are not guaranteed to persist across a full page
  reload (see Assumptions).
- How does the system handle extremely large quantities entered for a
  line item? System MUST enforce a sane minimum (1) and reasonable maximum
  per line item and reject out-of-range values with a clear message.
- What happens on very narrow (≥320px) or very wide (up to 1920px)
  viewports, in either language? Layout MUST remain fully usable with no
  horizontal scrolling or overlapping content at any breakpoint in that
  range, including RTL layouts.
- What happens if a visitor's browser/OS language doesn't match either
  supported locale? System MUST fall back to a defined default locale
  (English) rather than erroring.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a catalog page listing every active
  product with name, representative image, and a short research-area
  summary.
- **FR-002**: System MUST display a "research/laboratory use only — not for
  human consumption" disclaimer on the catalog page, every product detail
  page, and the quote-request page.
- **FR-003**: Users MUST be able to open a product detail page showing the
  full research-area description, available vial size(s), and any
  available purity information.
- **FR-004**: Users MUST be able to select a vial size and a quantity and
  add that selection as a line item to their quote request.
- **FR-005**: Users MUST be able to review their full quote request (all
  line items, vials, and quantities) before submitting it. No price or
  subtotal is calculated or displayed anywhere in the product or
  quote-request flow.
- **FR-006**: System MUST require an affirmative acknowledgment that the
  customer is 18 years or older and understands the products are for
  research/laboratory use only, not for human consumption, and MUST block
  submission until this acknowledgment is given.
- **FR-007**: System MUST collect customer contact information (name,
  email; phone optional), a country/region (for shipping feasibility), and
  an optional free-text note, as part of quote-request submission.
- **FR-008**: System MUST validate required fields (non-empty required
  fields, valid email format, at least one line item) and block submission
  with clear, field-level errors when validation fails.
- **FR-009**: Upon successful submission, System MUST deliver the complete
  quote request (line items, vials, quantities, contact info, country, any
  notes, and the recorded acknowledgment) to the business via email, and
  MUST show the customer an on-screen confirmation explaining the business
  will follow up with pricing. System MUST NOT process any payment or
  display any price as part of this flow.
- **FR-010**: System MUST NOT collect, store, transmit, or display any
  payment card, other payment credential, or product price anywhere in the
  product or quote-request flow.
- **FR-011**: System MUST prevent duplicate submissions resulting from
  repeated/rapid submit actions on the same request.
- **FR-012**: If notification email delivery fails, System MUST inform the
  customer clearly and preserve their entered data on screen so they can
  retry without re-entering everything.
- **FR-013**: The catalog, product detail, and quote-request pages MUST
  render correctly and remain fully usable across mobile, tablet, and
  desktop viewport widths, with no horizontal scrolling, in both supported
  languages.
- **FR-014**: The entire site (navigation, catalog, product pages,
  quote-request flow, confirmation, and all disclaimers) MUST be available
  in both English and Arabic, with a visible language switcher, and Arabic
  MUST render in correct right-to-left layout.

### Key Entities

- **Product**: A research peptide presented on the site — name (shared
  across languages), localized research-area description/tagline, image(s),
  research-use disclaimer, optional purity reference, and one or more vial
  sizes. No price field exists on this entity.
- **Vial**: A specific size/strength option of a product (e.g., "10 mg").
  No price field exists on this entity.
- **Quote Request**: A single submitted request — customer contact info
  (name, email, optional phone), country/region, optional note, one or more
  line items (product + vial + quantity), the recorded 18+/research-use
  acknowledgment, and a submission timestamp. Contains no payment or
  pricing information.
- **Line Item**: A single product/vial/quantity selection within a quote
  request.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new visitor can reach any product's detail page within 2
  clicks of landing on the catalog, in either supported language.
- **SC-002**: A customer can go from selecting a product/vial to a
  submitted quote request in under 3 minutes.
- **SC-003**: 0% of submitted quote requests are missing the
  18+/research-use acknowledgment — submission is technically impossible
  without it.
- **SC-004**: 100% of successfully submitted quote requests are delivered
  to the business by email within 1 minute of submission.
- **SC-005**: The catalog, product, and quote-request pages remain fully
  usable (no horizontal scrolling, no overlapping/clipped content) across
  viewport widths from 320px to 1920px, in both LTR (English) and RTL
  (Arabic) layouts.
- **SC-006**: An audit of the site finds zero payment-card,
  payment-credential, or price/subtotal fields anywhere in the product or
  quote-request flow.
- **SC-007**: Every page and UI string is available in both English and
  Arabic — zero untranslated strings found in a full-site audit.

## Assumptions

- Ordering is guest-only; no customer accounts, login, or request-history
  view are in scope for v1.
- No real-time inventory/stock tracking in v1 — all listed products and
  vials are treated as available.
- No catalog search or filtering in v1, given a small, multi-product
  catalog that visitors can browse in full.
- No pricing, subtotal, shipping cost, or tax is calculated or displayed
  in-app; the business determines and communicates pricing after reviewing
  a submitted quote request, consistent with the no-payment-gateway,
  no-published-price scope.
- Full shipping address (street/city/postal code) is not collected at
  quote-request time — only country/region, to gauge shipping feasibility;
  the business collects a full address later once a quote is accepted.
- Notification emails are delivered via a transactional email service to
  the business; the specific provider is an implementation detail decided
  during planning.
- Two supported locales in v1: English and Arabic (RTL). Single currency
  is not applicable since no prices are shown.
- No admin dashboard or request database in v1 — the business's sole record
  of a quote request is the notification email (per current scope; see
  constitution Principle IV).
- Product names (e.g., "TB-500", "BPC-157") are not translated; research-area
  descriptions, taglines, and UI copy are localized per language.
