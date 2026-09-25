# Feature Specification: Multi-Brand Peptide Store

**Feature Branch**: `003-multi-brand-peptide-store`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Build a responsive, mobile-first, bilingual (English/Arabic) multi-brand peptide store. Customers browse by brand and research area, add priced products to a cart, and submit a cash-on-delivery order without an account. Store owners manage brands, products, prices, categories, orders, settings and legal pages through an admin dashboard. Launch with one brand (PEP Lab) and 10 products; more brands and products must be addable without code changes. Products without a price are supported. All products remain marketed as research/laboratory use only with an 18+ acknowledgment at checkout. WhatsApp contact and an order email to the store."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and find peptide products (Priority: P1)

A visitor opens the store, sees the available brands and research areas, and finds products either by scrolling the shop page (products are grouped under their brand) or by filtering by brand, research area, or whether a price is listed. They open a product page to read its details.

**Why this priority**: Without a browsable catalog nothing else has value; this alone is a viable read-only storefront.

**Independent Test**: Load the shop with seeded brands, categories and products; filter by a research area and confirm only matching products appear, grouped under their brands; open a product and see its details.

**Acceptance Scenarios**:

1. **Given** the store has two active brands with products, **When** a visitor opens the shop page, **Then** products appear grouped under each brand without needing to click a brand first.
2. **Given** a visitor selects a research area, **When** the list updates, **Then** only products assigned to that area are shown, grouped by brand, and brands with no matching products are not shown.
3. **Given** a product is a draft or unpublished, or its brand is inactive, **When** a visitor browses or opens its address directly, **Then** it is not listed and the direct link shows a friendly "unavailable" page.
4. **Given** a product has no price, **When** a visitor views its card or page, **Then** it follows the store's configured unpriced behavior (see User Story 4).
5. **Given** a product has no image, **When** it is displayed, **Then** a neutral placeholder is shown and the layout does not break.

---

### User Story 2 - Order with cash on delivery (Priority: P1)

A visitor adds priced products to a cart, adjusts quantities, enters name, phone and delivery address, confirms they are 18+ and accept the research-use terms, sees that payment is cash on delivery, and submits. They see an order confirmation with an order number. No account is required, and the cart survives page reloads within the browsing session.

**Why this priority**: This is the core business transaction the store exists for.

**Independent Test**: Add two priced products, change a quantity, remove one, complete checkout with valid details, and confirm an order number is shown, the order appears in the admin order list, and the store receives an email.

**Acceptance Scenarios**:

1. **Given** a cart with priced items, **When** the visitor changes quantity or removes an item, **Then** line totals, subtotal, delivery fee and total update immediately.
2. **Given** a valid cart and complete details with the 18+/research-use box ticked, **When** the visitor confirms the order, **Then** an order is created with status "New", totals are calculated from current store data (not from figures sent by the browser), and a confirmation page shows the order number and summary.
3. **Given** the acknowledgment box is unticked or a required field (name, phone, address) is missing or invalid, **When** the visitor tries to submit, **Then** submission is blocked with a clear, translated message next to the problem field.
4. **Given** a cart contains a product that has no price, **When** the visitor opens the cart or checkout, **Then** checkout is blocked and the visitor is directed to contact the store, naming the affected product.
5. **Given** a product became unpublished or its price changed after being added to the cart, **When** the visitor reaches checkout, **Then** they are told what changed and the order uses the current price only after they review it.
6. **Given** the order is saved but the store notification email fails, **When** the visitor submits, **Then** the visitor still sees a successful confirmation and the failure is recorded for the admin to see.
7. **Given** the connection drops during submission, **When** the visitor retries, **Then** they see a clear retry message and never end up with duplicate orders from a single confirmation.

---

### User Story 3 - Admin manages the catalog (Priority: P1)

The store owner signs in to the admin area and creates and edits brands, research-area categories and products (name, brand, description, images, price or no price, categories, usage information, warnings, English and Arabic text, and Draft/Published/Unpublished status). Changes appear on the storefront without any code change.

**Why this priority**: The owner must be able to run the catalog independently; the launch products and every future brand depend on it.

**Independent Test**: Sign in, create a new brand, a category and a product with no price and two images, publish it, and confirm it appears on the storefront under the new brand; unpublish it and confirm it disappears.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they open any admin address or call an admin action, **Then** they are denied and redirected to sign-in.
2. **Given** a signed-in admin, **When** they create a brand, category or product with valid data, **Then** it is saved and (if active/published) appears on the storefront.
3. **Given** an admin leaves the price empty, **When** they save, **Then** the product saves successfully as unpriced.
4. **Given** an admin enters an invalid price (negative or non-numeric), **When** they save, **Then** they see a validation error and nothing is saved.
5. **Given** an admin deactivates a brand, **When** a visitor browses, **Then** the brand and its products are hidden but no product data is deleted, and reactivating the brand restores them.
6. **Given** a product has past orders, **When** the admin edits its name or price, **Then** those past orders still show the name and price they had when ordered.
7. **Given** an admin uploads product images, **When** they reorder or remove them, **Then** the storefront reflects the new order and the first image is used on cards.

---

### User Story 4 - Unpriced products and WhatsApp contact (Priority: P2)

Some products have no price yet. The store owner chooses one store-wide behavior for them: show "Price unavailable" with an "Ask About Price" button, or hide the price entirely and show a contact button. Either way, the button opens WhatsApp to the store's number with a prefilled message naming the product. A general WhatsApp contact button is available across the store.

**Why this priority**: Prices are not final at launch, so this keeps unpriced products useful; but purchasing (P1) works without it.

**Independent Test**: With an unpriced product, switch the setting between the two behaviors and confirm both product page and card change accordingly; click the button and confirm the WhatsApp link contains the configured number and the product name.

**Acceptance Scenarios**:

1. **Given** the setting is "Show Ask About Price", **When** a visitor views an unpriced product, **Then** they see "Price unavailable" and an "Ask About Price" button, with no Add to Cart.
2. **Given** the setting is "Hide price", **When** a visitor views an unpriced product, **Then** no price text is shown and a WhatsApp contact button is shown, with no Add to Cart.
3. **Given** a WhatsApp number is configured, **When** a visitor clicks a product inquiry button, **Then** WhatsApp opens for that number with a message that includes the product name in the visitor's current language.
4. **Given** no WhatsApp number is configured, **When** pages render, **Then** WhatsApp buttons are hidden rather than pointing to a broken link.

---

### User Story 5 - Admin processes orders and settings (Priority: P2)

The admin sees a dashboard (new orders, orders needing processing, product count, brand count), opens any order to see customer details, items and totals, and moves it through New, Processing, Out for Delivery, Completed or Cancelled. In settings they edit store name, logo, phone, WhatsApp number, email, address, delivery on/off and delivery fee, the unpriced-product behavior, and default/supported languages. They can also edit the legal pages.

**Why this priority**: Needed to fulfil orders and configure the store, but the customer flow can be tested before it.

**Independent Test**: Place an order, open it in admin, change its status through the sequence, then set a delivery fee and confirm a new order includes it while the earlier order keeps its original fee.

**Acceptance Scenarios**:

1. **Given** new orders exist, **When** the admin opens the dashboard, **Then** counts of new orders, orders needing processing, products and brands are shown.
2. **Given** an order, **When** the admin opens it, **Then** they see order number, date/time, customer name, phone, address, notes, items with quantities and snapshot prices, subtotal, delivery fee, total and payment method.
3. **Given** an order, **When** the admin changes its status, **Then** the new status is saved and shown in the order list.
4. **Given** delivery is enabled with a fee, **When** a visitor checks out, **Then** the fee appears in the cart summary and total; **Given** delivery fee is zero (the default), **Then** delivery is shown as free. Already-placed orders are unaffected by later changes.
5. **Given** the admin edits a legal page, **When** they save, **Then** the storefront page shows the new text in the corresponding language.

---

### User Story 6 - Bilingual, mobile-first experience (Priority: P2)

Every page is usable in English (left-to-right) and Arabic (right-to-left) on phones first, then tablets and desktops. Switching language keeps the visitor on the same page and keeps their cart and any half-filled checkout data.

**Why this priority**: A first-class product requirement, but delivered across the other stories rather than as a separate flow.

**Independent Test**: Complete the full purchase journey on a phone-sized screen in Arabic, then switch to English mid-checkout and confirm nothing is lost and nothing overflows horizontally.

**Acceptance Scenarios**:

1. **Given** any page, **When** the language is Arabic, **Then** layout, navigation and forms are right-to-left, and Latin values such as vial sizes stay readable.
2. **Given** a product or category with no Arabic (or English) text, **When** viewed in that language, **Then** the other language's text is shown instead of blank content.
3. **Given** a phone-sized screen, **When** the visitor walks through home, shop, product, cart, checkout and confirmation, **Then** there is no horizontal scrolling and all controls are comfortably tappable.

---

### User Story 7 - Find products by research purpose (Priority: P2)

A visitor who is not sure which peptide to look at starts from a guided picker. Each research purpose (research area) is shown as a tile with a short description of what it covers. The visitor picks one or more, and the store shows the related products grouped by brand, each with a one-line research focus describing what that peptide is studied for in the laboratory. All wording is research and laboratory framing, never a personal health or human-use goal.

**Why this priority**: It helps first-time visitors find products by purpose, but the shop filter (User Story 1) already covers discovery without it.

**Independent Test**: Open the picker, choose one purpose and then several; confirm only related products appear, grouped by brand, with their research focus lines, and that a purpose with no visible products is not offered.

**Acceptance Scenarios**:

1. **Given** active research areas that have visible products, **When** a visitor opens the picker, **Then** each is shown as a tile with its name and description, and areas with no visible products are not shown.
2. **Given** a visitor selects one or more tiles, **When** results load, **Then** only products assigned to any selected area are shown once each, grouped by brand, and the selection is kept in the page address so it can be shared and survives a language switch.
3. **Given** a product has a research focus line, **When** it appears in results, **Then** the line is shown on its card; **Given** it has none, **Then** nothing is shown in its place.
4. **Given** the picker is shown, **When** the visitor reads it, **Then** it states that products are for research/laboratory use only and contains no dosage, therapeutic, or human-use wording.

---

### Edge Cases

- A visitor with a cart from before a product was removed or had its price removed: the cart marks the item unavailable and blocks checkout until it is removed.
- Quantity limits: quantity must be a whole number of at least 1 and no more than a store-defined maximum per line.
- Double-clicking or resubmitting Confirm must not create duplicate orders.
- Category with no visible products: hidden from public filters (or shown as empty state when opened directly); inactive category is not shown.
- Very long product names, descriptions or addresses must not break layout in either language.
- Product with several categories appears under each selected category, once per brand group.
- Slug collisions when two products or brands have the same name: the admin is asked for a unique slug or one is made unique automatically.
- Phone number entered in Arabic-Indic digits is accepted and normalised.
- The admin deletes or deactivates a category, brand or product that appears in existing orders: order history is unaffected.
- Repeated sign-in failures to the admin area are slowed or temporarily blocked.

## Requirements *(mandatory)*

### Functional Requirements

**Catalog and discovery**

- **FR-001**: The store MUST list published products of active brands, grouped by brand on the shop page, without requiring the visitor to open a brand first.
- **FR-002**: Visitors MUST be able to filter products by brand, by research area (category), and by whether a price is listed; filters can be combined.
- **FR-003**: When a research area is selected, the store MUST show only products assigned to it and make clear which brands have products in it.
- **FR-004**: Every published product MUST have its own page showing name, brand, images, price (when available), description, research area(s), usage/handling information when provided, warnings/disclaimers when provided, the research-use disclaimer, quantity selector and add-to-cart control.
- **FR-005**: Product cards MUST show image (or placeholder), name, brand, price if available, availability status, and a call to action.
- **FR-006**: Product, brand and research-area pages MUST have readable, unique addresses (based on names, not internal IDs), a page title, description, and sharing preview information.
- **FR-007**: Draft, unpublished, or inactive-brand products MUST NOT appear in listings, search, or filters, and direct visits MUST show a friendly unavailable page.
- **FR-008**: Listings MUST load in controlled pages or batches so that hundreds of products remain fast.
- **FR-009**: The home page MUST show hero with clear "Shop" call to action, research areas, featured products, and active brands, all loaded from store data, plus header with logo, navigation (Home, Shop, Research Areas, Brands, Contact), language switcher, cart icon with item count, and mobile navigation.
- **FR-010**: Informational pages MUST exist for About, Contact, Terms & Conditions, Shipping & Returns, Privacy Policy and Product Disclaimer.

**Pricing**

- **FR-011**: A product's price MUST be optional; products without a price MUST be valid throughout the store and admin.
- **FR-012**: The store MUST support two admin-selectable behaviors for unpriced products ("Price unavailable" + Ask About Price, or hide price + contact button); the choice MUST apply everywhere without code changes.
- **FR-013**: Unpriced products MUST NOT be addable to the cart or purchasable; if one is somehow in a cart, checkout MUST be blocked with a message directing the visitor to contact the store.
- **FR-014**: Prices are displayed in the store's single currency (shekel, ₪) with consistent formatting in both languages.

**Cart**

- **FR-015**: Visitors MUST be able to add products with a quantity, change quantity, and remove items, with totals updating immediately.
- **FR-016**: Each cart line MUST show image, name, brand, unit price, quantity, line total and a remove action; the summary MUST show subtotal, delivery fee and total.
- **FR-017**: The cart MUST work without signing in and MUST persist across page reloads and language switches during the browsing session.

**Checkout and orders**

- **FR-018**: Checkout MUST collect full name, phone number and delivery area/address (required) and order notes (optional), and MUST validate them with clear translated messages.
- **FR-019**: Checkout MUST require the visitor to confirm they are 18 or older and accept the research-use-only terms before an order can be submitted; the research-use disclaimer MUST also appear on the cart/review step and order confirmation.
- **FR-020**: Checkout MUST state that payment is cash on delivery before confirmation; no other payment method or card data entry is offered.
- **FR-021**: On confirmation the system MUST recompute every price and total from current store data and settings, ignoring any prices or totals supplied by the browser.
- **FR-022**: The system MUST create the order with initial status "New", a unique human-readable order number, the customer's details, and line items that snapshot product name, unit price, quantity and line total.
- **FR-023**: The visitor MUST see an order confirmation with order number, items, totals, payment method (cash on delivery), and next-steps information.
- **FR-024**: The delivery fee MUST come from store settings (delivery enabled/disabled and fee amount), default to free, and be applied at checkout without being hardcoded.
- **FR-025**: The system MUST prevent duplicate orders from repeated submission of the same confirmation.
- **FR-026**: The store MUST send an email to the configured store address for each new order containing order number, customer name, phone, address, items, quantities, subtotal, delivery fee, total, payment method and date/time; the order MUST be saved even if the email fails, and the failure MUST be visible to the admin.
- **FR-027**: Order submission MUST be protected against automated abuse.

**Order management**

- **FR-028**: Admins MUST see all orders (newest first, filterable by status), open a single order, and change its status among New, Processing, Out for Delivery, Completed and Cancelled; status is a fixed set of values, not free text.
- **FR-029**: The admin dashboard MUST show counts of new orders, orders needing processing, products, and brands, without advanced analytics.

**Admin catalog management**

- **FR-030**: Admin access MUST require authentication; all admin pages and actions MUST reject unauthenticated requests.
- **FR-031**: Admins MUST be able to create, edit and activate/deactivate brands (name, logo, description, status).
- **FR-032**: Admins MUST be able to create, edit and activate/deactivate research-area categories and assign products to one or more categories.
- **FR-033**: Admins MUST be able to create and edit products (name, brand, description, images, price or none, categories, usage information, warnings/disclaimers, vial size(s) and purity/COA information when available, status Draft/Published/Unpublished) and upload, reorder and remove product images.
- **FR-034**: Deactivating a brand or category, or unpublishing a product, MUST hide it publicly without deleting data or affecting past orders.
- **FR-035**: All admin inputs MUST be validated on the server (including prices, slugs, images and settings), independent of any client-side checks, with clear error messages.
- **FR-036**: Admins MUST be able to edit store settings: store name, logo, phone, WhatsApp number, email, address, delivery enabled, delivery fee, unpriced-product behavior, default language and supported languages.
- **FR-037**: Admins MUST be able to edit the text of the legal and informational pages in each language.

**WhatsApp**

- **FR-038**: A visible WhatsApp contact button MUST be available site-wide, opening WhatsApp to the configured number; product inquiry buttons MUST prefill a message naming the product in the current language.

**Localization and responsiveness**

- **FR-039**: The store MUST be fully available in English (left-to-right) and Arabic (right-to-left), with one shared page structure for both languages rather than duplicated pages.
- **FR-040**: Product, brand, category and legal-page text MUST be stored per language, and when one language is missing the other MUST be shown.
- **FR-041**: Switching language MUST keep the visitor on the equivalent page and preserve the cart and in-progress checkout entries.
- **FR-042**: All pages MUST work on mobile first, with no horizontal scrolling and touch-friendly controls; checkout MUST be optimized for phones.

**Research purpose picker**

- **FR-046**: The store MUST offer a guided picker listing each active research area that has at least one visible product, with its name and description, allowing one or several to be selected, and showing the related visible products once each, grouped by brand.
- **FR-047**: Each product MAY have a short per-language "research focus" line describing what it is studied for in the laboratory; it MUST be shown on product cards in picker results and on the product page when present, MUST be client-approved, and MUST NOT contain dosage, therapeutic, or human-use language.
- **FR-048**: Admins MUST be able to edit each research area's description and image and each product's research focus line, with a visible reminder of the wording rule in FR-047.

**Compliance and content**

- **FR-043**: Every product MUST be presented as "for research/laboratory use only, not for human consumption"; product pages and content MUST NOT contain dosage instructions, therapeutic or medical claims, and categories MUST be research areas of interest.
- **FR-044**: The store MUST NOT special-case any brand, so the launch brand (PEP Lab) is just the first brand record.
- **FR-045**: The store MUST handle and show friendly messages for: unavailable or unpublished product, empty cart, validation errors, failed submission, failed email, network errors, and missing images, without revealing internal error details.

### Key Entities

- **Brand**: A peptide manufacturer/label. Name (per language), address slug, logo, description, active/inactive status.
- **Product**: A peptide offering belonging to one brand. Names, descriptions and a short research focus line (per language), address slug, optional price, vial size(s), purity/COA information, usage/handling information, warnings, status (Draft/Published/Unpublished), images, categories.
- **Product Image**: An image of a product with a display order.
- **Category (Research Area / Research Purpose)**: A research area of interest. Name and description (per language), image, slug, active/inactive; many-to-many with products. Used by the filter and the purpose picker.
- **Order**: A submitted cash-on-delivery request. Order number, customer name, phone, address, notes, subtotal, delivery fee, total, payment method (cash on delivery), status, timestamps, acknowledgment record (18+/research-use accepted).
- **Order Item**: A line in an order, holding a snapshot of product name, unit price, quantity and line total, plus a reference to the product if it still exists.
- **Store Settings**: Single set of store-wide values: store info, delivery enabled/fee, unpriced behavior, default and supported languages.
- **Page Content**: Editable per-language text for About, Contact, Terms, Privacy, Shipping & Returns and Product Disclaimer.
- **Admin User**: A person allowed to sign in to the admin area.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor on a phone can go from the home page to a submitted order with confirmation in under 3 minutes.
- **SC-002**: The admin can add a new brand with a new product (with images, categories, and no price) and see it live on the storefront in under 5 minutes, with no developer involvement.
- **SC-003**: 100% of submitted orders record totals equal to current prices times quantities plus the configured delivery fee, regardless of what the browser sent.
- **SC-004**: 100% of unpriced products are blocked from checkout and show the configured unpriced behavior in both languages.
- **SC-005**: Shop and category pages show their first products within 2 seconds on a typical mobile connection with the launch catalog, and stay comparable with 500 products.
- **SC-006**: Every page in the purchase journey passes a check for no horizontal scrolling at phone widths in both English and Arabic.
- **SC-007**: The store owner receives an order email within 1 minute of 95% of submitted orders, and 100% of orders are visible in admin even when the email fails.
- **SC-008**: 0 admin pages or actions are accessible without signing in.
- **SC-009**: Switching language mid-checkout loses 0 cart items and 0 typed form entries.
- **SC-010**: Editing a product's name or price changes 0 fields on already-placed orders.

## Assumptions

- The store sells only peptides, with brands being different manufacturers; launch is one brand (PEP Lab) with 10 products, all seeded from client-supplied content. Pricing, images, categories and copy come from the client before launch and are not written by the team.
- This feature **replaces** the existing quote-request and phone-sign-in flows from features 001 and 002; those flows are retired when this store launches, and the constitution has been amended (v2.0.0) to allow it. Whether any part of the old flow is temporarily kept is a planning decision, not a launch requirement.
- Research-area categories replace consumer goals such as Fat Loss or Muscle Building; the initial list is supplied by the client. The visitor's "goal" is expressed as a research purpose. The brief's "what it does" and "who it is suitable for" fields are not used as written, because they conflict with research-use-only framing; the per-product "research focus" line (FR-047) replaces them, worded and approved by the client, and the team does not write this copy.
- Customers do not have accounts or order history; each order is tracked only by its order number and by the store.
- One currency (₪) and one delivery model (a single fee or free) at launch; delivery zones, coupons, inventory tracking, reviews, online payments and analytics are out of scope.
- A small number of admin users (typically one owner); admin sign-in uses a standard email-and-password approach with protection against repeated failed attempts.
- Cash on delivery is confirmed by the store by phone or WhatsApp after the order arrives; the app does not verify phone numbers.
- Delivery coverage areas and final legal text are client decisions; until supplied, delivery address is free text and legal pages carry placeholder text clearly marked for client approval.
- The store's contact email and WhatsApp number are supplied by the client; until then those buttons and emails are inactive rather than broken.
