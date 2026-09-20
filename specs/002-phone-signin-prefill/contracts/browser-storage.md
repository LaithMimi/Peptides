# Contract: Browser storage and routes

## Route: `/{locale}/signin`

- Server component reads the session. If already signed in, it skips the
  step: redirects to `/quote` (cart has items is checked client-side, so
  the server always redirects to `/quote`, which itself shows the
  empty-cart state with a catalog link).
- Otherwise renders: research-use disclaimer, phone input (`dir="ltr"`,
  phone shown through `LtrValue`), Send code → code entry → Verify, plus a
  "Back to quote request" link.
- No query parameters. On success it navigates (localized router) to
  `/quote` when the cart has items, else `/`.
- Wrong/expired code, rate-limit and send failures reuse the existing
  translated `errors.otp*` messages.

## `lib/quote-storage.ts`

All functions are safe when storage is unavailable (return empty / no-op,
never throw).

```text
readProfile(): Profile | null            // null on missing/corrupt/wrong version
writeProfile(p: Profile): void           // replaces previous
clearProfile(): void
readDraft(): Draft | null
writeDraft(d: Draft): void               // sessionStorage
takeDraft(): Draft | null                // read + delete
clearDraft(): void
```

Keys: `pepclub.profile` (localStorage), `pepclub.quoteDraft`
(sessionStorage). Shapes in data-model.md.

## Quote form behavior contract

| State | Form shows | Submit does |
|-------|-----------|-------------|
| Signed out | No phone field; short note that the phone is verified on submit; empty or draft-restored values | Validate → `writeDraft` → navigate to `/signin` |
| Signed in, profile matches session phone | "Signed in as ⁠<phone>" line with **Sign out** and **Clear my details**; name/email/address prefilled (except fields restored from a draft) | Validate → `submitQuoteRequest` |
| Signed in, no/mismatched profile | Signed-in line; empty fields | Same as above |
| `NOT_SIGNED_IN` returned | (any) | `writeDraft` → navigate to `/signin` |
| Submit success | — | `writeProfile` (name, email, address, session phone) → `clearDraft` → clear cart → confirmation |

Notes and acknowledgment are never written to the profile; the
acknowledgment starts unchecked on every load.

## i18n keys to add (both `en.json` and `ar.json`)

New `signIn` namespace (title, intro, phone label/help, buttons, back link,
already-signed-in note) and `quoteForm` additions (`signedInAs`, `signOut`,
`clearDetails`, `detailsCleared`, `phoneVerifiedOnSubmit`). New
`errors.notSignedIn`. The existing parity test must stay green.
