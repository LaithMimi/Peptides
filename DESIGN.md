---
name: Pep Club
description: The category-standard e-commerce storefront, executed at real craft — a clean, familiar shopping pattern with real product photography, not an experimental visual world.
colors:
  background: "#ffffff"
  surface: "#ffffff"
  surface-raised: "#f7f7f8"
  ink-navy: "#0a1933"
  muted-ink: "#6b7280"
  hairline: "#e5e7eb"
  hairline-strong: "#d1d5db"
  accent-blue: "#0000ff"
  input-border: "#9ca3af"
  danger: "#a23b2e"
  danger-bg: "#fbeae7"
typography:
  display:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    letterSpacing: "0.02em"
    fontFeature: "uppercase tracking-wide"
  body:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    letterSpacing: "0.1em"
  arabic:
    fontFamily: "Noto Kufi Arabic, Arial, sans-serif"
rounded:
  chip: "9999px"
  card: "0.75rem"
spacing:
  cardPadding: "1.25rem"
  sectionGap: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.background}"
    rounded: "{rounded.chip}"
    padding: "0.625rem 1.5rem"
  button-cta:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.background}"
    rounded: "{rounded.chip}"
    padding: "0.75rem 1.5rem"
  card-product:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.cardPadding}"
---

# Design System: Pep Club

## Overview

**Creative North Star: "The Category Standard, at Craft"**

Pep Club's storefront went through two visual-world experiments — the "Vial-Label System" (flat, bordered, die-cut paper labels) and "The Glass Case" (a backlit glass display case) — before the client asked directly for the plain, familiar e-commerce pattern instead, executed with real craft rather than a signature "world." This is the resulting system: white and light neutral gray carry almost every surface; deep navy ink and the logo's cornflower blue are the only two brand colors, with blue spent rarely (one CTA, links, focus rings); cards are ordinary bordered rectangles with a conventional shadow on hover; and the storefront leans on real seeded product photography — not an invented signature device — to carry visual interest, per the client's explicit "no AI-generated images" instruction.

The named craft bar is **Apple.com** (restrained, high-contrast typography, minimal color, confident spacing) and **Sephora/Glossier-style beauty retail** (clean grid, real product photography, understated chrome). This is a standing brand commitment recorded in PRODUCT.md — future storefront work should hold to this quality bar rather than reopening a new visual-world roll unless the client explicitly asks for one again.

**Key Characteristics:**
- Plain bordered cards (`rounded-xl border border-border-strong shadow-sm`, `shadow-md` on hover) — no signature glow, glass, or backlight device
- White and light neutral gray (`#f7f7f8`) dominate; navy ink stays for headings/body text, while cornflower blue carries every action surface — buttons and the footer band — per the client's explicit "blue, not navy blue" direction
- Real seeded product photography carries visual weight — the homepage hero features four real product photos in a Sephora-style collage instead of an abstract motif or generated imagery
- No customer account/sign-in affordance anywhere (hard product constraint) and no fabricated discount or "deal" badges (no discount field exists in the schema; the No Fabricated Data Rule)
- Bilingual EN/AR with true RTL mirroring; Geist Mono bidi-isolates Latin/numeric values (vial size, purity) inside Arabic text via `components/ltr-value.tsx`

## Colors

Plain and restrained — white, light gray, navy ink, and one disciplined blue accent. No invented tertiary colors, no signature glow palette.

### Primary
- **Ink Navy** (`#0a1933`): headings and body-adjacent text, the chosen state of pills/toggles (research-area chips, locale switcher, purpose picker). From the logo's "PEP" wordmark and icon outline. No longer used as a button or footer fill — see Named Rules.

### Secondary
- **Accent Blue** (`#0000ff` light mode, `#6669ff` dark mode): a pure, saturated blue per the client's explicit hex instruction — no longer matched to the logo's softer cornflower tone. Carries every action surface: all primary and secondary buttons (solid and outline), the footer band, links, and the focus ring. The dark-mode value is lightened from the exact hex (`#0000ff` fails WCAG AA as text/fill against the dark background); `#6669ff` holds 4.59:1 contrast both directions. Revised in two steps: first from a "rare accent" reserved for one CTA to carrying every button + the footer, then from the logo-matched cornflower blue to this pure blue.

### Neutral
- **Background / Surface** (`#ffffff`): page and card background.
- **Surface Raised** (`#f7f7f8`): a barely-tinted neutral gray for image placeholders, elevated panels, and input fields.
- **Muted Ink** (`#6b7280`): secondary text, a plain neutral gray.
- **Hairline** (`#e5e7eb`) / **Hairline Strong** (`#d1d5db`): ordinary neutral card borders and dividers.
- **Danger** (`#a23b2e`) / **Danger Background** (`#fbeae7`): validation and submission errors only.

### Named Rules
**The No Fabricated Data Rule.** Nothing in the UI states as fact what isn't real product data. No invented discount percentages, "Super Deals" badges, lot numbers, or certifications; only `lib/db` fields (vial size, purity, price) ever appear as data.

**The No Signature Device Rule.** This system deliberately has no repeating glow, glass, or backlight motif *across cards and content*. Two prior passes each introduced one (die-cut label tilt, then a backlit glass shelf-cell) and both were retired at the client's request. Reach for a plain bordered card before inventing a new visual device. The header's `.nav-gradient` (see Navigation) is a one-off, explicitly-requested exception scoped to that single component, not a reopening of this rule — don't generalize it to cards, buttons, or other chrome.

## Typography

**Display Font:** Geist Sans (variable, self-hosted via the `geist` package)
**Body Font:** Geist Sans
**Label/Mono Font:** Geist Mono (self-hosted, same package)
**Arabic:** Noto Kufi Arabic — swapped in whole-cloth under `dir="rtl"`, never mixed with the Latin face on the same line.

**Character:** A single clean geometric grotesk family (Geist) carries both display and body weight — confident, high-contrast, Apple-register typography. Geist Mono is reserved for values (price, vial size, purity, quantity) and micro-labels, never prose.

### Hierarchy
- **Display** (Geist Sans, 600, 2.25–3rem, uppercase, tracking-wide): the homepage hero H1 (largest in the system, per the Apple-register craft bar).
- **Headline** (Geist Sans, 600, 1.125–2rem, uppercase, tracking-wide): page-level H1s (catalog title, product name) and section headings.
- **Body** (Geist Sans, 400, 0.875–1.125rem): descriptions, research-area lists, form help text.
- **Label** (Geist Mono, 500, 0.75rem, uppercase, tracked 0.1em): field labels, vial-size/purity values, quantity, nav micro-labels, trust-marker chips.

### Named Rules
**The Kicker Ban.** No small-caps or tracked label ever sits directly above a heading as a standalone eyebrow line — the heading carries its own weight.

## Layout

Single-column content shell, `max-w-6xl`, centered, `px-4 sm:px-6 lg:px-8` gutters. The homepage hero is a `lg:grid-cols-2` split: headline/subhead/CTA at left, a 2×2 real-photo collage at right (one tile offset for visual interest, in the Sephora/beauty-retail register). The catalog grid steps `1 → 2 → 3` (and up to 5 on the shop grid) columns at `sm`/`lg`/`xl`. Product/product-detail pages use a two-column `md:grid-cols-2` split (image panel beside content) that collapses to one column below `md`.

## Elevation & Depth

Conventional, unremarkable depth — exactly what the category standard expects. Cards are flat at rest with a `shadow-sm`, deepening to `shadow-md` on hover; borders are always visible (`border-border-strong`), not something that only appears on interaction. No glow, no backdrop-filter, no signature lighting effect anywhere in the storefront.

### Shadow Vocabulary
- **Card Rest** (`shadow-sm`): default resting elevation for every product card, panel, and form.
- **Card Hover** (`shadow-md`): the only elevation change — a plain, standard hover response.

### Named Rules
**The Ordinary Depth Rule.** Depth in this system is exactly what a competent conventional storefront uses — border plus a soft shadow, deepening on hover — and nothing more. This is a deliberate choice, not an unfinished one: the craft bar (Apple.com, Sephora) is confident precisely because it doesn't reach for novelty in its depth system.

## Shapes

Two families: **pills** (`rounded-full`) for every button, chip, and toggle, and **soft rectangles** (`rounded-xl`, 0.75rem) for cards and panels — a conventional, moderate radius, not the rounder `rounded-2xl` of the retired Glass Case system. No independent card rotation/tilt, no experimental card shape.

## Components

### Buttons
- **Shape:** full pill (`rounded-full`).
- **Primary (navy):** `bg-navy text-navy-foreground`, used for secondary/navigational actions.
- **CTA (accent blue):** `bg-accent text-accent-foreground`, used only for the one primary commercial action per page (Shop now, Submit).
- **Hover/Focus:** opacity fade on hover; a 2px accent or navy focus-visible ring, offset, never removed.

### Chips
- **Research-area / locale toggle:** pill, neutral border, navy fill when selected, `surface-raised` + `border-strong` otherwise. Mono uppercase label.

### Cards / Containers
- **Corner Style:** `rounded-xl` throughout (product cards, panels, the disclaimer note).
- **Background:** `surface` or `surface-raised`, always with a visible `border-border-strong`.
- **Shadow Strategy:** see Elevation & Depth — `shadow-sm` at rest, `shadow-md` on hover.
- **Internal Padding:** `p-5`–`p-6`.

### Inputs / Fields
- **Style:** 1px `input-border`, `surface-raised` background, `rounded-md`, mono-uppercase label above the field.
- **Focus:** 2px accent outline, offset.
- **Error:** field-level message in `danger`; page-level failures in a `danger-bg` block.

### Navigation (deliberate exception to the rest of the system)
- The header is a **floating capsule**, not a full-width bar: `app/[locale]/layout.tsx`'s `<header>` adds page-edge padding and a top gap, then the actual bar (`.nav-gradient` in `app/globals.css`, `rounded-full`, `shadow-lg`) sits inset from the viewport edges at `max-w-6xl`. The gradient — `linear-gradient(115deg, #060e1e 0%, #0a1933 22%, var(--accent) 68%, #5a5aff 100%)`, dark mode swapping the two fixed endpoints for `#04070f`/`#8386ff` — carries only the brand's own two colors, no invented hue, and no decorative pattern (an earlier dot-chain overlay was tried and removed at the client's request — flat gradient only). This was an explicit, scoped client request ("change the nav bar, make it very creative... as a capsule") layered on top of the otherwise-plain "category standard" system; it is intentionally the one loud moment on the page, not a signal to extend gradients or the capsule shape elsewhere.
- Logo, nav links, cart label, and the mobile-menu button all render white (`.brand-mark-on-gradient` reuses the existing dark-mode logo-inversion trick unconditionally, since the header background is now always dark). Cart count badge is a white dot with accent-colored text for contrast against every part of the gradient. The locale switcher is unchanged — its white pill already reads as a floating control against the new backdrop.
- The mobile disclosure menu floats as its own `absolute`-positioned card below the capsule (same `.nav-gradient` + `rounded-2xl`), not nested inside the pill — opening it never stretches the capsule into a tall stadium shape.
- No account/sign-in control — this product has none, by hard constraint.

### Trust Markers
Short, strictly factual pill chips under the hero subtitle. Every chip must be verifiably true of the site as built — never a claim about verification, certification, or customers the business hasn't confirmed.

### Homepage Hero Photo Collage (signature moment, not a signature device)
The homepage hero's right column (`app/[locale]/page.tsx`) shows four real featured-product photos in a `grid-cols-2` collage, one tile offset downward (`translate-y-6`) for visual rhythm — the closest this system has to a "moment," and it is built entirely from real seeded photography, never generated imagery, per the client's explicit instruction. It is not a reusable component or repeating unit elsewhere in the system; it is specific to this one hero.

### Vial Glyph
`components/vial-glyph.tsx`: an authored SVG — a cylindrical, crimp-capped vial (matching the real seeded product photography's shape) with a small peptide-bond dot-chain accent, in `currentColor`. Shown directly (no wrapper/mount) wherever a product has no photo of its own.

## Do's and Don'ts

### Do:
- **Do** use a plain bordered card (`rounded-xl border border-border-strong shadow-sm hover:shadow-md`) as the one reusable container — reach for it before inventing a new card treatment.
- **Do** use real seeded product photography wherever the design needs visual weight; never AI-generated imagery, per the client's explicit instruction.
- **Do** bidi-isolate any Latin/numeric value rendered inside Arabic copy with `components/ltr-value.tsx`.
- **Do** reserve the solid accent-blue fill for the single primary CTA per page.

### Don't:
- **Don't** introduce a new signature visual device (glow, glass, backlight, or similar) without the client explicitly asking for a new visual-world exploration — see the No Signature Device Rule.
- **Don't** add a kicker/eyebrow line above any heading, ever.
- **Don't** invent specific-looking data (discount percentages, lot numbers, certifications) that isn't sourced from the database.
- **Don't** show an account/sign-in affordance anywhere on the customer-facing storefront — this product has none, by hard constitutional constraint.
- **Don't** use AI-generated images anywhere on the storefront — real product photography or authored SVG only, per the client's explicit instruction.
- **Don't** mix Latin and Arabic faces on one line — swap the whole typeface stack at the `dir="rtl"` boundary instead.
- **Don't** show a price or payment field anywhere — no online payment gateway exists in this product, ever (constitutional constraint, not a visual preference).
