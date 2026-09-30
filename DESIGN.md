---
name: Pep Club
description: The category-standard e-commerce storefront, executed at real craft — a clean, familiar shopping pattern with real product photography, not an experimental visual world.
colors:
  background: "#fafafa"
  surface: "#ffffff"
  surface-raised: "#f2f2f4"
  ink: "#0d0d0d"
  ink-bold-blue: "#1b22a7"
  muted-ink: "#5c5f6b"
  hairline: "#e6e6ea"
  hairline-strong: "#d2d2d8"
  accent-blue: "#4260e6"
  input-border: "#9a9aa4"
  danger: "#a23b2e"
  danger-bg: "#fbeae7"
  background-dark: "#0d0d0d"
  accent-blue-dark: "#6f86ee"
  glass-hover-tint: "rgba(66, 96, 230, 0.16)"
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
- A four-color client palette — Soft White `#FAFAFA`, Jet Black `#0D0D0D`, Bold Blue `#1B22A7`, Light Blue `#4260E6` — carries the whole site: Soft White ground, Jet Black body ink, Bold Blue headings and button ink, Light Blue for links, focus, and action tints
- Real seeded product photography carries visual weight — the homepage hero features four real product photos in a Sephora-style collage instead of an abstract motif or generated imagery
- No customer account/sign-in affordance anywhere (hard product constraint) and no fabricated discount or "deal" badges (no discount field exists in the schema; the No Fabricated Data Rule)
- Bilingual EN/AR with true RTL mirroring; Geist Mono bidi-isolates Latin/numeric values (vial size, purity) inside Arabic text via `components/ltr-value.tsx`

## Colors

A four-color palette supplied by the client (a "Clustr studio" palette card): **Soft White `#FAFAFA`, Jet Black `#0D0D0D`, Bold Blue, Light Blue.** The card's printed hex labels for the two blues (`#1E466B`, `#67BAF4`) do not match its own swatches. The values below were sampled from the swatches the client actually sees (`#1B22A7`, `#4260E6`). No other hues: the former orange hover glow was retired so the palette covers the whole site. The neutral grays are derived steps between Jet Black and Soft White, not new colors.

The token names in `app/globals.css` are kept for compatibility (`--navy` now holds Bold Blue). The admin dashboard shares these tokens and only overrides its fonts.

### Primary
- **Bold Blue** (`#1B22A7`, token `--navy`): headings, brand ink, and the ink of every glass button (≈11:1 on Soft White). On the storefront it is never a fill or border; the admin dashboard uses it as a solid fill for its primary buttons and active filter (with Soft White text). In dark mode, `--navy` becomes Soft White, because Bold Blue on Jet Black is illegible.
- **Jet Black** (`#0D0D0D`, token `--foreground`): body text in light mode and the page ground in dark mode.

### Secondary
- **Light Blue** (`#4260E6` light mode, `#6F86EE` dark mode, token `--accent`): links, focus ring, cart badge, and glass tints (menu panel, button and scroll-indicator hover glow at `rgba(66,96,230,.16)`). `#4260E6` is 5.2:1 on white. On Jet Black it drops to 3.7:1, so dark mode lifts it to `#6F86EE` (5.9:1, with Jet Black text when used as a fill).

### Neutral
- **Background** (`#FAFAFA` Soft White) / **Surface** (`#FFFFFF`): the page ground and the card surface. Dark mode: `#0D0D0D` / `#151517`.
- **Surface Raised** (`#F2F2F4`): image placeholders, elevated panels, and input fields.
- **Muted Ink** (`#5C5F6B`): secondary text.
- **Hairline** (`#E6E6EA`) / **Hairline Strong** (`#D2D2D8`): card borders and dividers.
- **Shadows**: Jet Black at low alpha (`rgba(13,13,13,…)`), never tinted.
- **Danger** (`#a23b2e`) / **Danger Background** (`#fbeae7`): validation and submission errors only.
- **Dark glass tint** (`rgba(111,134,238,…)` over a faint white wash): the dark-theme menu-panel tint, the dark accent at low alpha. Never used as a solid.

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
- **Solid CTA buttons (glass):** `.btn-glass` in `app/globals.css` — the same clear-glass material as the nav, sized for buttons: `backdrop-filter: blur(10px)`, a light brand-blue tint (`rgba(0,0,255,.16→.07)`), a blue rim (`rgba(0,0,255,.35)`), a bright inset highlight. Ink is accent blue on light theme (≥6:1 over the tint, 4.8:1 on hover) and near-white on dark theme. The class sets its own `color` in unlayered CSS so it wins over any leftover `text-*` utility. Used on every filled action: Shop now, Apply filters, Add to cart, checkout/browse/continue buttons, form submits, the solid WhatsApp button.
- **Outline buttons:** `border-2 border-accent text-accent`, transparent at rest, solid accent fill on hover (Choose a research area, cookie choices, erase-local-data). They were left as-is: already transparent, so "glass" adds nothing at rest.
- **Hover/Focus:** glass tint deepens on hover; a 2px accent focus-visible ring, offset, never removed.

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
- The header is a **floating capsule of clear glass**, not a full-width bar and not a colored fill: `app/[locale]/layout.tsx`'s `<header>` adds page-edge padding and a top gap, then the bar (`.nav-glass` in `app/globals.css`, `rounded-full`) sits inset from the viewport edges at `max-w-6xl`. The material is real `backdrop-filter: blur(20px) saturate(180%)` under only a whisper of brand blue (`rgba(0,0,255,.13→.04)` gradient), a blue-tinted 1px edge (`rgba(0,0,255,.22)`), and a bright inset top rim (`inset 0 1px 0 rgba(255,255,255,.85)`). Dark mode swaps the tint for `rgba(102,105,255,.22)` over a faint white wash with a white-alpha edge. History, so it isn't retried: a solid navy→blue gradient, then a dot-chain overlay, then a *dark tinted* glass were each tried; the dark tinted pane put white ink over a pale pane (≈2.7:1, failing AA), so the glass is deliberately **light and clear with dark ink**. This was an explicit, scoped client request layered on top of the otherwise-plain "category standard" system — the one loud moment on the page, not a signal to extend glass or the capsule shape to cards or content.
- Ink stays normal: nav links `text-navy` (hover `text-accent`), the logo uses the ordinary `.brand-mark`, the cart badge is the usual accent dot, and the mobile-menu button is an accent outline. Because ink is set by the theme tokens (dark ink on light theme, light ink on dark), legibility never depends on what sits behind the glass. Measured: navy ink over the glass ≥13:1, accent ink ≥6:1. The locale switcher is unchanged.
- **Fixed capsule update (`site-header.tsx`, `header-shell.tsx`, `.site-nav` / `.glass-button` in `app/globals.css`):** the header is now `position: fixed`, `max-w-[1400px]`, a 3-column grid — 16px bold logo/name left, 14px medium links centered, glass Cart CTA (plus the locale switcher) right. It is fully transparent with no border at scroll 0; past 8px `data-scrolled` turns on the glass (`rgba(255,255,255,.1)`, `blur(12px)`, `rgba(255,255,255,.15)` rim) plus a soft shadow, since a white-alpha rim is invisible on this white ground. All glass transitions use `0.3s cubic-bezier(0.4,0,0.2,1)`. `.glass-button` hovers to `scale(1.05)` with a Light Blue `rgba(66,96,230,.16)` fill/glow. This was originally orange, retired when the client's four-color palette was applied site-wide. Ink is always the navy token (never white) so contrast never depends on the backdrop. `<main>` carries `pt-28` to clear the fixed bar. The home hero ends in a 40px `ScrollIndicator` ring whose arrow floats 10px over 3s (`float` keyframes; disabled under `prefers-reduced-motion`).
- **All buttons share this glass:** `.btn-glass` is now the one button material (white-alpha glass, Bold Blue ink, Light Blue hover glow, `scale(1.05)`; the orange glow was retired with the palette change), used on every filled and former outline button — hero CTAs, Add to cart, cart/checkout, filters, forms, cookie choices, WhatsApp, locale switcher, quantity stepper, mobile menu. Disabled buttons don't react to hover. `.glass-badge` is the same material with no hover, for the numbered badges in How-to-use and the purpose picker. The older "blue-tinted glass" and "outline buttons stay as-is" notes under Components → Buttons are superseded.
- The mobile disclosure menu floats as its own `absolute`-positioned card below the capsule (same `.nav-glass` + `rounded-2xl`), not nested inside the pill — opening it never stretches the capsule into a tall stadium shape.
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

### Color Consistency Rule
Navy is ink only (text). Every interactive surface — borders, hover borders, focus, selected chips/toggles/badges, steppers, the cookie banner rule — uses accent blue; selected states use `.btn-glass`. No navy fills or borders on the storefront.
