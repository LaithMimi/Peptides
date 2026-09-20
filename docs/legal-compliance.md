# Legal / compliance — pre-launch status

Status of the 20-item pre-launch checklist as of 2026-09-20. This is an
engineering audit, **not legal advice** — a lawyer in the business's
jurisdiction must review the policy text (`lib/legal-content.ts`) before launch.

Legend: ✅ done in code · 🟡 done, needs owner input/review · ➖ not applicable (with reason)

| # | Item | Status | Where / notes |
|---|------|--------|---------------|
| 1 | Privacy policy | ✅ | `/[locale]/legal/privacy`, text in `lib/legal-content.ts`, matches the real data flows (quote form, feedback, Twilio, Resend, Vercel) |
| 2 | Terms of service | ✅ | `/[locale]/legal/terms` — research-use-only, 18+, quote ≠ order |
| 3 | Refund policy | 🟡 | `/[locale]/legal/refunds`. The site takes no payment; the 7-day damage report and 14-day refund windows are **placeholder defaults the owner must confirm** |
| 4 | Cookie policy | ✅ | `/[locale]/legal/cookies` lists every cookie/storage key |
| 5 | Cookie consent banner | ✅ | `components/cookie-consent.tsx`; "Essential only" and "Accept optional storage" are visually identical; reopen from footer "Cookie settings" |
| 6 | Form consents | ✅ | `LegalNote` (purpose + links to terms/privacy) on quote, feedback and sign-in forms; existing 18+/research-use checkbox is unchecked by default; optional "remember my details" now gated on banner consent |
| 7 | No unnecessary data | ✅ | Nothing persisted server-side; IP only held in memory for rate limiting; removed the `NEXT_LOCALE` cookie (`localeCookie: false`). Shipping address is collected at quote stage — drop it from the form if you would rather ask later |
| 8 | Audit third-party SDKs | ✅ | Runtime services: Twilio Verify (SMS), Resend (email), Vercel (hosting). No analytics/ads/tag managers. Google Fonts are self-hosted by `next/font` at build time (no request to Google from visitors). Listed in the privacy policy — keep it in sync if you add one |
| 9 | Remove dark patterns | ✅ | Equal-weight banner buttons, no pre-ticked boxes, no countdowns/scarcity, consent not bundled with the 18+ acknowledgment |
| 10 | Remove hidden fees | ✅ | No prices, totals or checkout anywhere; refund policy states fees/shipping/taxes are itemised in the written quote |
| 11 | Remove fake reviews | ✅ | None exist (no testimonials, ratings, or "verified buyer" content) |
| 12 | Remove unsupported claims | 🟡 | The "≥ 99%" purity figure was shown for every product with no certificate of analysis. It now only renders when `coaUrl` is set (`app/[locale]/products/[slug]/page.tsx`). **Still to review with counsel:** product `researchAreas` copy in `lib/products.ts` (e.g. "body composition", "appetite", "sleep") sits close to health claims |
| 13 | Accessibility alt text | ✅ | Logo and product images have alt text; decorative SVGs are `aria-hidden` |
| 14 | Color contrast | ✅ | Accent darkened `#4281c9` → `#2f6db5` (4.0:1 → 5.3:1 on white) so accent text and white-on-accent buttons pass WCAG AA. Dark theme accent already passed. Update `DESIGN.md` if you want the change recorded there |
| 15 | Keyboard navigation | ✅ | "Skip to main content" link, global `:focus-visible` ring, native buttons/links throughout. Not yet checked with a screen reader |
| 16 | Business details | 🟡 | Footer + terms + privacy read `BUSINESS_*` env vars (see `.env.local.example`). **Unset = visible "[to be completed before launch]"**. Values are read at build time |
| 17 | Age consent / kids' data | ✅ | Site is 18+ only: acknowledgment checkbox, stated in terms and privacy, deletion promised if a minor's data is found. No child-directed features |
| 18 | Unsubscribe link in emails | ➖ | The site sends no marketing or automated email to visitors; the only emails go to the business inbox. If you later email customers marketing content, you need an unsubscribe link and a consent record first |
| 19 | License fonts/images | 🟡 | Fonts (Fraunces, DM Sans, IBM Plex Mono, Noto Kufi Arabic) are SIL OFL — free for web use. Unused create-next-app SVGs removed. **You must confirm you own or have licensed `public/brand/pep-club-logo.png` and `public/products/*.jpeg`** — the repo cannot tell |
| 20 | Data deletion request | ✅ | `/[locale]/data-request` (delete / access / correct) emails the business with a reply-to for identity check; "Delete my data in this browser" erases cart, remembered details, draft, consent and the sign-in cookie |

## Before you launch

1. Set the five `BUSINESS_*` variables in Vercel **before building**.
2. Have a lawyer review the four policies and confirm the refund windows.
3. Confirm image/logo ownership; add real certificates of analysis (`coaUrl`) before showing any purity figure.
4. Have a native Arabic speaker review the Arabic policy text (machine-quality draft).
5. Decide who answers `/data-request` emails and within what process (30-day promise is in the policy). Also delete the person's data at Twilio (verification records) if asked.
6. Check whether your target markets restrict selling research peptides at all — that is outside what code can fix.
