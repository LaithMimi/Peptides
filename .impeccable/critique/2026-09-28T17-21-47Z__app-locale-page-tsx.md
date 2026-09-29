---
target: homepage + header/footer/buttons color consistency
total_score: 28
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
timestamp: 2026-09-28T17-21-47Z
slug: app-locale-page-tsx
---
Method: dual-agent (A: general-purpose design review · B: general-purpose detector/browser evidence)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Cart badge, aria-pressed/aria-current states all work; no gaps found. |
| 2 | Match System / Real World | 4/4 | Nav labels map directly to how customers already think about the catalog. |
| 3 | User Control and Freedom | 3/4 | Locale switch preserves query string; no undo on cart-line removal (off-homepage). |
| 4 | Consistency and Standards | 4/4 | Live-verified: navy/accent token usage is consistent everywhere sampled. |
| 5 | Error Prevention | 4/4 | Unpriced products architecturally can't reach checkout; server re-prices everything. |
| 6 | Recognition Rather Than Recall | 4/4 | Product cards carry brand + vial size + price + CTA together. |
| 7 | Flexibility and Efficiency | n/a | Not expected on a Persuade-mode homepage. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Was 2/4 live (Featured section silently empty) — fixed during this critique, see below. |
| 9 | Error Recovery | 3/4 | Not exercised live on the homepage; the codebase's error-code pattern is sound where used. |
| 10 | Help and Documentation | n/a | Not this surface's job; footer legal links cover it. |

**Total: 28/32 (Good)** — recompute after re-verifying the P0 fix live.

## Design Specificity Verdict

**LLM assessment (Assessment A):** Reads as authored for this product, not a reskin — bidi-isolated prices/vial-sizes inside Arabic text, a vial-glyph SVG that matches the real seeded photography's crimp-cap shape, "Cash on delivery" reframed as a trust chip instead of hidden, and a documented "No Fabricated Data Rule" that's actually followed (no discount badges, no testimonials). Not category-interchangeable.

**Deterministic scan (Assessment B):** CLI static scan (`detect.mjs`) on `app/` + `components/`: **clean, 0 findings.** A *separate* runtime/computed-style checker (injected into the live page via `live-server.mjs`) found real rendering-level issues the static scanner can't see — typography and spacing measured on actual computed styles, not source patterns:
- **`kicker-above-heading`** on the product detail page: the brand name ("PEP LAB") sits directly above the product H1 ("TB-500") in a small tracked mono label — this literally matches DESIGN.md's own "Kicker Ban." Worth your judgment call: is showing which brand makes the product a meaningful data label (not the banned decorative eyebrow), or should it move? I didn't change this — it's a content/IA decision, not mine to make silently.
- **`line-length`** (~155 chars/line) on the footer disclaimer and a few `opacity-90` paragraphs — body text isn't width-constrained, running well past the 65–75ch craft-floor guideline.
- **`cramped-padding`** on several pill/chip badges (research-area tags, brand chips) — 3.75px vertical padding for 11.25px text; the `min-h-11` touch target is fine, but the *visual* padding reads tight.
- **`image-hover-transform`** on product-card images — the `group-hover:scale-[1.03]` zoom, confirming the P3 finding from the earlier `/impeccable audit` (still not gated behind `prefers-reduced-motion`).
- Note: on 2 of 3 pages checked, the overlay's stated finding *count* didn't match the number of individual findings logged (10 said, 13 shown; 3 said, 12 shown) — B flagged this as an unexplained tooling discrepancy, not a design issue.

No color-token false positives in either scan.

## Overall Impression

The system itself is sound and consistently applied — the header/button/footer color question you asked about turns out to already be correct (see below). The real gap was a silent, self-inflicted bug: the homepage's "Featured products" grid was rendering completely empty against the real 4-product seed, because I'd sliced one small result into two disjoint ranges in the previous session. **I found and fixed this during this critique**, before presenting the report, rather than leaving it as a documented-but-unfixed P0.

## What's Working

- **Color-token discipline is real, live-verified**, not just documented: the hero's only accent-blue-filled element is "Shop now"; every other interactive element sampled (outline CTA, locale-switcher active state, category chips, footer, feedback submit) correctly uses navy, exactly matching DESIGN.md's Primary/Secondary rules.
- **RTL is first-class.** At `/ar`, the hero collage mirrors correctly, the Latin wordmark stays unflipped, and prices/vial-sizes stay LTR-readable inside Arabic sentences via `<LtrValue>`/`<bdi>`.
- **The trust chips turn a constraint into a selling point** — "Cash on delivery" as a hero-level trust marker, not something hidden.

## Priority Issues

**[P0 → Fixed during this critique] "Featured products" silently empty against real seed data.**
`app/[locale]/page.tsx` was slicing one `listFeatured(8)` result into `slice(0,4)` for the hero and `slice(4,8)` for the featured grid; the real seed only returns 4 products, so the second slice was always empty and the entire shoppable product grid vanished below the hero. **Fixed**: the featured section now shows the full fetched set (some overlap with the hero collage on a small catalog is fine; an empty section is not).

**[P1 — resolved by evidence, not by change] Header background: confirmed correct as-is.**
This was your explicit ask this round. Live contrast-checking found no actual gap: footer is navy exactly as DESIGN.md's "Primary" section names it, category chips and the locale-switcher's active state are navy, and accent-blue is correctly scarce (one CTA). The header's *white* background is intentional — DESIGN.md's own Navigation section specifies "White header band," matching the Apple.com/Sephora craft bar you named (both use light chrome with dark text). Painting the header navy would be a real pivot away from a decision you made two turns ago, not a bug fix — so I didn't do it. Two button-color edits I'd started before this evidence came in (feedback-form and data-request-form submit buttons) have been reverted back to accent, since changing them alone would have made the "one CTA per section" pattern *less* consistent, not more.
**Suggested command**: none — flagging for your explicit confirmation before any repaint, per your own project's "flag conflicts rather than silently implement" instruction.

**[P1] Cookie-consent banner competes with the primary CTA on mobile first load.**
`components/cookie-consent.tsx` — a fixed bottom panel covers ~28% of an 844px viewport the instant the page loads, forcing a cookie decision at the exact moment a first-time visitor is being asked to trust a cash-on-delivery purchase.
**Fix**: a slimmer single-line banner with a "Manage" expand, or delay/de-emphasize until scroll.
**Suggested command**: `/impeccable onboard` or `/impeccable clarify`

**[P2] Trust markers underspecified for this product's specific anxiety.**
The entire process-reassurance for "no card, no account, pay cash on delivery" is one two-word chip plus a one-line hero sentence — thin for a skeptical first-time buyer of research chemicals. This is a copy gap, not a visual one; no new claims need fabricating, just one more honest sentence near the CTA.
**Suggested command**: `/impeccable clarify`

**[P2] Body text unconstrained width; a few paddings read tight.**
Footer/disclaimer paragraphs run ~155 chars/line (craft-floor guideline: 65–75ch); several pill/chip badges have visually cramped padding relative to their text size (touch target itself is fine at 44px).
**Suggested command**: `/impeccable typeset` or `/impeccable layout`

**[P3] Product-card hover-zoom still not gated by `prefers-reduced-motion`.**
Confirmed again by both the earlier `/impeccable audit` and this run's live overlay (`image-hover-transform`). Small, cheap fix.
**Suggested command**: `/impeccable harden`

## Persona Red Flags

**Casey (distracted mobile user):** Cookie banner demands a decision before the product does (see P1 above). The "browse and tap to buy" surface was empty until this critique's fix. Top bar on 390px is tight (cart link + EN/AR pill + menu button + logo) but all targets are ≥44px.

**Riley (stress tester):** The "Multiple brands" trust chip is shown against a catalog that currently has exactly one seeded brand ("PEP LAB") — technically a claim about platform *capability*, not current catalog fact, and the kind of thing a skeptical reader could call out against the site's own No Fabricated Data Rule. Worth your call on whether that chip should be conditional on brand count. The (now-fixed) empty Featured section also had no empty-state message — it just vanished, indistinguishable from a real bug.

**Jordan (confused first-timer):** The second thing a new visitor reads, right after the hero, is a formal "FOR RESEARCH USE ONLY" legal block, before any product/brand credibility content — necessary per your compliance principles, but nothing next to it explains what "research areas" means as a taxonomy for someone arriving from a specific compound search.

## Minor Observations

- `font-serif` is used as the Tailwind class name throughout (headings, buttons) but `--font-serif` resolves to Geist Sans, a sans-serif — an internal naming mismatch, no user-facing effect, but a trap for a future contributor.
- The vial-glyph SVG fallback isn't exercised anywhere right now since all 4 seeded products have real photos.
- Footer's 9 legal links sit in one unstructured flex-wrap row — conventional for e-commerce, low risk below the fold.

## Questions to Consider

1. Since the Featured-section bug only surfaced against the *real* 4-product launch seed, was the homepage checked against actual launch catalog size before, or only against the eventual "hundreds of products" end state?
2. With no testimonials/COAs available (correctly not fabricated), what real, non-fabricated trust element — an actual phone number, a delivery-coverage map, a real About-page person — could close the reassurance gap for a first-time cash-on-delivery buyer?
3. Should the "Multiple brands" trust chip be conditional on the catalog actually having more than one active brand?
