# Contract: Server Actions, Email, and WhatsApp

Conventions (kept from the existing project):
- Every action re-validates input with Zod on the server; client validation is a convenience.
- Field errors are returned as short codes (`required`, `invalidPhone`, `ackRequired`,
  `invalidPrice`, ...) in `fieldErrors`; the UI maps them through `errors.*` translations.
  Raw codes are never rendered.
- Result shape: `{ ok: true, ... } | { ok: false, code, fieldErrors? }`. Error `code` values
  are stable strings; no stack traces or internal messages are returned.
- Actions are protected by the Server Action origin check.

## Storefront actions

### `priceCart(items)`
- **Input**: `items: { productId: uuid, quantity: int }[]` (max 30).
- **Output**: `{ lines: [{ productId, name, brand, vialSize, imageUrl, slugPath, unitPriceMinor|null, quantity, lineTotalMinor|null, status: "ok"|"unpriced"|"unavailable" }], subtotalMinor, deliveryFeeMinor, totalMinor, canCheckout: boolean }`
- **Rules**: data comes only from the DB and `store_settings`. `unpriced` and `unavailable`
  lines are excluded from totals and set `canCheckout = false`. Quantity is clamped to
  `max_line_quantity`. Read-only; no side effects.

### `placeOrder(input)`
- **Input**: `{ idempotencyKey: uuid, customerName, customerPhone, deliveryAddress, notes?, acknowledged: boolean, locale, items: {productId, quantity}[] }`. No prices or totals are accepted.
- **Steps (single transaction)**: rate-limit check → validate → reject when `acknowledged` is
  not true → reload products/settings → reject any unpriced/unavailable line → compute
  subtotal, delivery fee (0 when delivery disabled), total → insert order and snapshot items →
  commit. After commit, send the notification email and record its outcome.
- **Output**: `{ ok: true, orderNumber, accessToken }` (client navigates to the confirmation
  URL) or `{ ok: false, code, fieldErrors? }`.
- **Error codes**: `VALIDATION`, `ACK_REQUIRED`, `EMPTY_CART`, `ITEM_UNPRICED` (with product
  ids), `ITEM_UNAVAILABLE` (with product ids), `PRICE_CHANGED` (client must show updated
  totals and ask to confirm again), `RATE_LIMITED`, `SERVER_ERROR`.
- **Idempotency**: a repeated call with the same `idempotencyKey` returns the original result
  and never creates a second order. A failed email leaves the order saved and returns success.

### `getOrderForConfirmation(orderNumber, accessToken)`
- Returns the order summary only when the token matches; otherwise `NOT_FOUND`.

## Admin actions (all call `requireAdmin()` first)

| Action | Input (validated) | Behavior |
|---|---|---|
| `adminLogin` | email, password | Constant-time hash check; failures counted per email/IP; lock after 5 (15 min); sets session cookie; generic error `INVALID_CREDENTIALS` |
| `adminLogout` | none | Clears cookie |
| `saveBrand` / `setBrandActive` | brand fields / id + boolean | Create/update; slug unique; deactivating never deletes products |
| `saveCategory` / `setCategoryActive` | category fields / id + boolean | Same pattern |
| `saveProduct` | product fields incl. `priceMinor: int｜null`, `status`, `categoryIds`, `imageIds` order | Server validation of price range, slug uniqueness per brand, brand exists |
| `setProductStatus` | id, status | Publish/unpublish/draft |
| `deleteProduct` | id | Allowed only when the product has no orders; otherwise `HAS_ORDERS` and admin is told to unpublish |
| `addProductImage` / `reorderProductImages` / `removeProductImage` | product id, blob URL / ordered ids / image id | URL must be on the configured Blob host; removal also deletes the blob |
| `updateOrderStatus` | order id, status | Enforces allowed transitions (data-model.md) |
| `resendOrderEmail` | order id | Re-sends notification, updates `notification_status` |
| `saveSettings` | settings fields | Validates fee ≥ 0, locales, WhatsApp digits |
| `savePage` | slug, per-language title/body, `isPlaceholder` | Markdown stored; raw HTML not rendered |

After any admin mutation the affected storefront paths are revalidated.

## Notification email (to store email)

Subject: `New order <orderNumber>`. Body includes: order number, date/time, customer name,
phone, delivery address, notes, each line (name, brand, vial size, quantity, unit price, line
total), subtotal, delivery fee, total, payment method "Cash on delivery". Plain text plus a
simple HTML version. Recipient is `store_settings.email`, falling back to
`ORDER_NOTIFICATION_EMAIL`. In development with no `RESEND_API_KEY` the message is logged.

## WhatsApp links

- General: `https://wa.me/<digits>` where `<digits>` is `whatsapp_number` with non-digits removed.
- Product inquiry: `https://wa.me/<digits>?text=<url-encoded message>`; message in the current
  locale, English example: `Hi, I would like to know the price of <Product Name>.`
- If `whatsapp_number` is empty, no WhatsApp control is rendered anywhere.
