---
name: Pep Club
description: A boutique apothecary catalog built from one repeating unit — the die-cut vial label — not a clinical warehouse or a neon research-chemical site.
colors:
  paper: "#f5efdf"
  surface: "#fbf7ec"
  surface-raised: "#fffdf6"
  ink-navy: "#171f30"
  muted-ink: "#6b6252"
  hairline: "#ddd2b5"
  hairline-strong: "#c9bb97"
  accent-blue: "#4d7fd6"
  stamp-amber: "#9c6b2e"
  danger: "#a23b2e"
  danger-bg: "#f6e6df"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 600
    letterSpacing: "0.02em"
    fontFeature: "small-caps character via uppercase text-transform"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "IBM Plex Mono, Consolas, monospace"
    fontSize: "0.75rem"
    letterSpacing: "0.1em"
  arabic:
    fontFamily: "Noto Kufi Arabic, Arial, sans-serif"
rounded:
  chip: "9999px"
  card: "1rem"
  cardLarge: "1rem"
spacing:
  cardPadding: "1.25rem"
  sectionGap: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.paper}"
    rounded: "{rounded.chip}"
    padding: "0.625rem 1.5rem"
  button-cta:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.chip}"
    padding: "0.75rem 1.5rem"
  card-product:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.cardPadding}"
---

# Design System: Pep Club

## Overview

**Creative North Star: "The Apothecary's Label Wall"**

Pep Club is built from one repeating unit — the die-cut pharmaceutical vial
label — used as the actual UI vocabulary, not as illustration. Every card,
chip, and panel borrows the label's grammar: a rounded plate, a hairline
rule under a seal mark, small-caps serif identity type, and a monospace
line for batch-style data. The system was chosen by a structured direction
roll (concept-seed, mode: persuade, seed key `44cf6903`) that weighed it
against six catalog challengers — closest being an aviation-instrument
dashboard — and won on both audience identification and product clarity:
it reads as boutique, verified, and curated rather than either a sterile
clinical site or a neon "research-chemical" warehouse. The palette and mark
are drawn directly from the brand logo (`public/brand/pep-club-logo.jpeg`):
deep navy ink and a single blue accent, set on warm paper rather than
clinical white.

This is a Persuade-mode catalog (the visitor decides whether to trust the
site enough to submit a quote) wrapping an Operate-mode form (the quote
request itself stays plain and legible — a ledger, not a spectacle).
Product cards carry a small independent tilt, as if pinned slightly askew
on a shelf, and straighten on hover/focus. There is no product photography
on hand, so the vial-glyph seal mark (an authored SVG, not a photo) carries
that role everywhere a product image would normally sit.

**Key Characteristics:**
- One repeating label unit (rounded plate + seal + hairline rule + mono
  data line) builds cards, chips, form sections, and the confirmation panel
- Warm paper ground, never clinical white
- Serif small-caps identity type paired with monospace for anything that
  is actually data (vial size, purity, quantity) — never monospace as
  costume
- Flat, bordered depth — almost no shadow — with dashed vs. solid rules
  doing the work shadows would otherwise do
- Bilingual EN/AR with true RTL mirroring; any Latin/numeric value (vial
  size, purity) is bidi-isolated so it never reverses inside Arabic text

## Colors

Warm and paper-toned at rest, with navy carrying nearly all identity
weight and blue reserved strictly for action and verification.

### Primary
- **Ink Navy** (`#171f30`): headings, primary buttons, footer band, the
  chosen state of pills/toggles. Carries the brand's identity weight —
  this is the color from the logo's wordmark.

### Secondary
- **Accent Blue** (`#4d7fd6`): the logo's accent dot. Used only for the
  primary CTA ("Add to quote request" / "Submit quote request"), the seal
  icon in the disclaimer, and links — never for large fields. **The Rare
  Accent Rule.** Blue marks the one action on a page; if more than one
  element needs it, something else should be carrying that weight instead.

### Tertiary
- **Stamp Amber** (`#9c6b2e`): reserved for exactly one moment — the
  confirmation page's approval seal. It does not appear anywhere else in
  the system; introducing it elsewhere would dilute what makes that
  moment read as a stamp.

### Neutral
- **Paper** (`#f5efdf`): page background. Warm, not clinical.
- **Surface** (`#fbf7ec`): card and component background, a half-step
  lighter than paper.
- **Surface Raised** (`#fffdf6`): the lightest tier, used for panels that
  should read as sitting above the page (hero card, product image panel).
- **Muted Ink** (`#6b6252`): secondary text — tinted warm from the ink,
  never gray.
- **Hairline** (`#ddd2b5`): dashed dividers and rest-state chip borders.
- **Hairline Strong** (`#c9bb97`): solid card borders, the label's "die
  cut" edge.
- **Danger** (`#a23b2e`) / **Danger Background** (`#f6e6df`): validation
  and submission errors only.

### Named Rules
**The No Fabricated Data Rule.** Nothing in the UI states as fact what
isn't real product data. An earlier draft showed an invented "Lot" code
per product; it was removed because the business has no real batch/COA
data to back it, and a specific-looking identifier reads as a claim, not
decoration. Only `lib/products.ts` fields (vial size, purity) ever appear
as data.

## Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** DM Sans (with Arial, sans-serif fallback)
**Label/Mono Font:** IBM Plex Mono (with Consolas, monospace fallback)
**Arabic:** Noto Kufi Arabic — swapped in whole-cloth under `dir="rtl"`,
never mixed with the Latin faces on the same line.

**Character:** Fraunces carries the apothecary-label identity — a serif
with real presence, set in uppercase small-caps tracking for headings,
product names, and buttons. DM Sans stays quiet underneath it for anything
meant to be read at length. Plex Mono is reserved for values, never used
as a "technical" costume on prose.

### Hierarchy
- **Display** (Fraunces, 600, 1.875–2.25rem, uppercase, tracking-wide):
  page-level H1s (catalog title, product name).
- **Headline** (Fraunces, 600, 1.125–1.5rem, uppercase, tracking-wide):
  section headings (quote form title, confirmation title).
- **Body** (DM Sans, 400, 0.875–1rem): descriptions, research-area lists,
  form help text.
- **Label** (Plex Mono, 500, 0.65–0.75rem, uppercase, tracked 0.1em):
  field labels, vial-size/purity values, quantity, nav micro-labels.

### Named Rules
**The Kicker Ban.** No small-caps label ever sits directly above a
heading as a standalone eyebrow line. An earlier draft used
"PEP CLUB — CURATED CATALOG" above the catalog H1 and a similar line above
the quote form's H2; both were removed. The heading carries its own
weight, and any brand/context cue that line was providing was already
present in the header logo or the surrounding copy.

## Layout

Single-column content shell, `max-w-6xl`, centered, with `px-4 sm:px-6
lg:px-8` gutters — the same container width the original MVP established.
The catalog grid steps `1 → 2 → 3` columns at `sm`/`lg`. Section rhythm
uses generous vertical gaps (`gap-6`–`gap-10` between major blocks) with
tighter internal card padding (`p-5`–`p-6`), so grouped content stays
close and sections stay clearly separated. Product/quote pages use a
two-column `md:grid-cols-2` split (image/glyph panel beside content) that
collapses to one column below `md`.

## Elevation & Depth

Almost flat. Depth comes from border weight and rule style, not shadow:
a 1px `border-strong` on resting cards, a soft `shadow-sm` that firms to
`shadow-md` only on product-card hover, and dashed vs. solid rules marking
different kinds of boundary (dashed = a divider inside a group; solid =
the edge of a distinct object). The confirmation panel and empty-cart
states use a dashed 2px border with no shadow at all, reading as an
outline waiting to be filled rather than a raised surface.

### Shadow Vocabulary
- **Card Rest** (`shadow-sm`): default product-card elevation.
- **Card Hover/Focus** (`shadow-md` + `-translate-y-0.5` + un-rotate):
  the only elevation change in the system, paired with the card
  straightening out of its resting tilt.

### Named Rules
**The Flat-at-Rest Rule.** Nothing floats until it's interacted with.
Shadow is a response to hover/focus, never a static decoration.

## Shapes

Two families, used consistently: **pills** (`rounded-full`) for every
button, chip, and toggle — vial-size selectors, the locale switcher, the
CTA — and **soft rectangles** (`rounded-xl`/`rounded-2xl`) for cards and
panels. Circles appear only for the seal/glyph marks (the vial icon, the
disclaimer check-seal, the confirmation stamp). Product-card borders read
as a "die-cut" edge: a solid `border-strong` rectangle with a very slight
independent rotation per card (±1.4° max, deterministic per product id via
`lib/label-rotation.ts`), never randomized per render.

## Components

### Buttons
- **Shape:** full pill (`rounded-full`).
- **Primary (navy):** `bg-navy text-navy-foreground`, Fraunces uppercase
  label, used for navigational/secondary actions (locale toggle selected
  state, "go to quote" link, confirmation's "back to catalog").
- **CTA (accent blue):** `bg-accent text-accent-foreground`, used only for
  the one primary commercial action per page (add to quote / submit quote
  request).
- **Hover/Focus:** opacity fade on hover; a 2px accent or navy
  focus-visible ring, offset, never removed.

### Chips
- **Vial-size / language toggle:** pill, 2px border, navy fill when
  selected, `surface-raised` + `border-strong` when not. Mono uppercase
  label text.

### Cards / Containers
- **Corner Style:** `rounded-2xl` for hero/panels, `rounded-xl` for
  product cards and form sections.
- **Background:** `surface` (cards) or `surface-raised` (elevated panels
  like the hero and the product image slot).
- **Shadow Strategy:** see Elevation & Depth — flat at rest.
- **Border:** 1px `border-strong` (product cards), 2px solid `navy`
  (hero, product image panel), or 2px dashed `border-strong` (empty
  states, confirmation panel).
- **Internal Padding:** `p-5` to `p-6` (`p-8`–`p-10` for the catalog hero).
- **Signature behavior:** product cards carry a deterministic slight
  rotation at rest and straighten on hover/focus (see Shapes).

### Inputs / Fields
- **Style:** 1px `border-strong`, `surface-raised` background,
  `rounded-md`, mono-uppercase label above the field (never inside it as
  a placeholder-only label).
- **Focus:** 2px accent outline, offset.
- **Error:** field-level message in `danger`, page-level submit failures
  in a `danger-bg` block — both share the same translated-error-code path
  (`components/quote-form.tsx`'s `translateFieldError`) so no raw
  validation code ever reaches the UI in either language.

### Navigation
- Cream header band, 4px double navy rule as its bottom edge (a
  "label-plate" seam rather than a plain 1px divider). Nav links in
  Fraunces uppercase tracking; the active quote-count badge is a small
  accent-filled circle. The locale switcher is the same pill-chip
  language as vial selectors, for visual consistency across every choice
  control in the system.

### Vial Glyph (signature component)
The brand's stand-in for product photography (`components/vial-glyph.tsx`):
an authored SVG vial silhouette with a small peptide-bond dot-chain accent
inside a thin circular seal ring, in `currentColor`. Used at three scales:
small (catalog card corner), medium (disclaimer/seal icon), large (product
detail panel). Never a stock icon library glyph — drawn specifically to
echo the logo's own dot-chain "P" mark.

## Do's and Don'ts

### Do:
- **Do** treat the vial label (rounded plate + seal + hairline rule +
  mono data line) as the one reusable unit — reach for it before inventing
  a new card shape.
- **Do** bidi-isolate any Latin/numeric value rendered inside Arabic copy
  with `components/ltr-value.tsx` — vial sizes and purity values reverse
  visually otherwise.
- **Do** reserve Accent Blue for the single primary action on a page.
- **Do** keep the confirmation Stamp Amber exclusive to that one moment.

### Don't:
- **Don't** add a kicker/eyebrow line above any heading, ever — this was
  tried and explicitly removed (see Typography's Named Rule).
- **Don't** invent specific-looking data (lot numbers, batch codes,
  certifications) that isn't sourced from `lib/products.ts` — see the
  Colors section's Named Rule.
- **Don't** reach for a shadow as decoration; shadow only responds to
  hover/focus state.
- **Don't** mix Latin and Arabic faces on one line — swap the whole
  typeface stack at the `dir="rtl"` boundary instead.
- **Don't** show a price or payment field anywhere — this is a
  constitutional constraint from `.specify/memory/constitution.md`
  Principle II/V, not a visual preference.
