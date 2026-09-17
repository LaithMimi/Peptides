# Feature Specification: Peptide Storefront (Catalog + Order Capture)

**Feature Branch**: `001-peptide-storefront`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "A responsive website to sell research peptides. Multiple products with variants (dosage/vial size/quantity). No payment gateway — customers submit an order request; the business receives it by email and fulfills/invoices manually. All products marketed strictly as research/laboratory use only, not for human consumption, with an 18+ and research-use acknowledgment required before order submission."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Product Catalog (Priority: P1)

A visitor lands on the site and browses the full list of available research
peptide products to see what's offered, at a glance, before deciding what to
look at in detail.

**Why this priority**: Without a browsable catalog there is no funnel into
the rest of the site — this is the entry point for every other story.

**Independent Test**: Load the catalog page directly and confirm every
active product is listed with name, image, short description, and starting
price, with the research-use disclaimer visible on the page.

**Acceptance Scenarios**:

1. **Given** the catalog page is loaded, **When** the page finishes
   rendering, **Then** every active product appears with name, image,
   starting price, and a visible "research use only, not for human
   consumption" disclaimer.
2. **Given** the catalog page on a mobile-width viewport, **When** the
   visitor scrolls, **Then** the layout remains usable with no horizontal
   scrolling and no overlapping content.

---

### User Story 2 - View Product Details & Select a Variant (Priority: P1)

A visitor opens a specific product to read its full description and
research-use disclaimers, and chooses a variant (e.g., dosage/vial size) and
quantity they're interested in ordering.

**Why this priority**: Customers cannot form an order without first seeing
variant options and pricing — this is the second mandatory step in every
purchase journey.

**Independent Test**: Navigate directly to a product detail page (without
going through the catalog) and confirm the full description, all variants
with their prices, and the disclaimer are visible; select a variant and
quantity and confirm the selection is reflected before adding to the order.

**Acceptance Scenarios**:

1. **Given** a product detail page, **When** it loads, **Then** the product
   name, full description, all purchasable variants with per-variant price,
   any available purity/COA information, and the research-use disclaimer are
   displayed.
2. **Given** a product with multiple variants, **When** the visitor selects
   a variant and a quantity, **Then** the page reflects the selected variant,
   quantity, and computed line subtotal before it is added to the order.
3. **Given** no variant has been selected, **When** the visitor attempts to
   add the product to their order, **Then** the system blocks the action and
   indicates a variant must be chosen first.

---

### User Story 3 - Age & Research-Use Acknowledgment Gate (Priority: P1)

Before an order can be submitted, the customer must explicitly confirm they
are 18 years or older and that they understand the products are for
research/laboratory use only, not for human consumption.

**Why this priority**: This is a non-negotiable legal/compliance
requirement (see project constitution); no order may bypass it.

**Independent Test**: Attempt to submit an order without checking the
acknowledgment control(s) and confirm the submission is blocked with a clear
message; then check the acknowledgment and confirm submission proceeds.

**Acceptance Scenarios**:

1. **Given** an order ready for submission, **When** the customer has not
   checked the 18+/research-use acknowledgment, **Then** the system prevents
   submission and clearly indicates the acknowledgment is required.
2. **Given** the customer has checked the acknowledgment, **When** they
   submit the order, **Then** the acknowledgment is recorded as part of the
   submitted order and submission proceeds.

---

### User Story 4 - Submit an Order Request (Priority: P1)

A customer who has selected one or more product variants reviews their full
order (items, variants, quantities, subtotal), enters their contact and
shipping details, and submits the order for the business to fulfill and
invoice manually — no payment is collected on the site.

**Why this priority**: This is the site's core conversion action and its
entire commercial purpose; without it the site delivers no business value.

**Independent Test**: Add at least one variant to an order, fill in the
order review and contact form with valid data, submit it, and confirm both
(a) an on-screen confirmation is shown to the customer and (b) the order
details are delivered to the business by email — with no payment step
anywhere in the flow.

**Acceptance Scenarios**:

1. **Given** an order with at least one line item and a checked
   acknowledgment, **When** the customer fills in valid contact and shipping
   details and submits, **Then** the system shows an on-screen confirmation
   and sends the full order (items, variants, quantities, contact info,
   shipping address) to the business by email.
2. **Given** the order form, **When** a required field is missing or
   invalid (e.g., malformed email), **Then** the system blocks submission
   and shows a clear, field-level error without discarding the customer's
   other entered data.
3. **Given** a submission is in progress, **When** the customer clicks
   submit multiple times in quick succession, **Then** only one order is
   sent.
4. **Given** the order email fails to send, **When** submission is
   attempted, **Then** the customer sees a clear failure message and their
   entered data remains on screen so they can retry.

### Edge Cases

- What happens when a visitor tries to submit an order with an empty cart
  (no line items)? System MUST block submission and indicate at least one
  item is required.
- How does the system handle a product or variant that has been removed or
  is unavailable when a customer is mid-order? System MUST surface which
  item is affected and let the customer adjust the order before resubmitting.
- What happens if a customer navigates away and returns before submitting?
  In-progress order selections are not guaranteed to persist across a full
  page reload (see Assumptions).
- How does the system handle extremely large quantities entered for a
  variant? System MUST enforce a sane minimum (1) and reasonable maximum per
  line item and reject out-of-range values with a clear message.
- What happens on very narrow (≥320px) or very wide (up to 1920px) viewports?
  Layout MUST remain fully usable with no horizontal scrolling or
  overlapping content at any breakpoint in that range.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a catalog page listing every active
  product with name, representative image, short description, and starting
  price.
- **FR-002**: System MUST display a "research/laboratory use only — not for
  human consumption" disclaimer on the catalog page and on every product
  detail page.
- **FR-003**: Users MUST be able to open a product detail page showing the
  full description, all purchasable variants (e.g., dosage/vial size) with
  per-variant price, and any available purity/COA information.
- **FR-004**: Users MUST be able to select a variant and a quantity and add
  that selection as a line item to their order.
- **FR-005**: Users MUST be able to review their full order (all line items,
  variants, quantities, and subtotal) before submitting it.
- **FR-006**: System MUST require an affirmative acknowledgment that the
  customer is 18 years or older and understands the products are for
  research/laboratory use only, not for human consumption, and MUST block
  order submission until this acknowledgment is given.
- **FR-007**: System MUST collect customer contact and shipping information
  (name, email, shipping address; phone optional) as part of order
  submission.
- **FR-008**: System MUST validate required order fields (non-empty
  required fields, valid email format, at least one line item) and block
  submission with clear, field-level errors when validation fails.
- **FR-009**: Upon successful submission, System MUST deliver the complete
  order (line items, variants, quantities, contact info, shipping address,
  and the recorded acknowledgment) to the business via email, and MUST show
  the customer an on-screen confirmation. System MUST NOT process any
  payment as part of this flow.
- **FR-010**: System MUST NOT collect, store, transmit, or display any
  payment card or other payment credential data anywhere in the product or
  order flow.
- **FR-011**: System MUST prevent duplicate order submissions resulting from
  repeated/rapid submit actions on the same order.
- **FR-012**: If order email delivery fails, System MUST inform the customer
  clearly and preserve their entered order/contact data on screen so they
  can retry without re-entering everything.
- **FR-013**: The catalog, product detail, and order review/submission
  pages MUST render correctly and remain fully usable across mobile,
  tablet, and desktop viewport widths, with no horizontal scrolling.

### Key Entities

- **Product**: A research peptide offered for sale — name, description,
  image(s), research-use disclaimer, optional purity/COA reference, and a
  set of variants.
- **Variant**: A purchasable option of a product (e.g., a specific
  dosage/vial size), with its own price.
- **Order**: A single submitted order request — customer contact info,
  shipping address, one or more line items (product + variant + quantity),
  the recorded 18+/research-use acknowledgment, and a submission timestamp.
  Contains no payment information.
- **Line Item**: A single product/variant/quantity selection within an
  order, with its computed subtotal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new visitor can reach any product's detail page within 2
  clicks of landing on the catalog.
- **SC-002**: A customer can go from selecting a product variant to a
  submitted order in under 3 minutes.
- **SC-003**: 0% of submitted orders are missing the 18+/research-use
  acknowledgment — submission is technically impossible without it.
- **SC-004**: 100% of successfully submitted orders are delivered to the
  business by email within 1 minute of submission.
- **SC-005**: The catalog, product, and order pages remain fully usable
  (no horizontal scrolling, no overlapping/clipped content) across viewport
  widths from 320px to 1920px.
- **SC-006**: An audit of the site finds zero payment-card or
  payment-credential input fields anywhere in the product or order flow.

## Assumptions

- Ordering is guest-only; no customer accounts, login, or order-history
  view are in scope for v1.
- No real-time inventory/stock tracking in v1 — all listed products and
  variants are treated as available.
- No catalog search or filtering in v1, given a small, multi-product
  catalog that visitors can browse in full.
- No shipping cost or tax calculation/display in-app; final pricing and
  invoicing happen manually after the business reviews the submitted order,
  consistent with the no-payment-gateway scope.
- Order notifications are delivered via a transactional email service to
  the business; the specific provider is an implementation detail decided
  during planning.
- Single currency, English-only; no multi-locale support in v1.
- No admin dashboard or order database in v1 — the business's sole record
  of an order is the notification email (per current scope; see
  constitution Principle IV).
