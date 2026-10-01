# New-order flow (admin side)

What happens from the moment a customer presses "Place order" to the moment
the business has delivered it and closed it out in the admin dashboard.
Orders are cash on delivery only: no payment is ever taken online
(constitution Principles II and V).

## At a glance

```
Customer presses "Place order"
        │
        ▼
placeOrderAction  (app/[locale]/checkout/actions.ts)
        │
        ▼
placeOrder        (lib/orders.ts)
  1. rate limit per IP          → RATE_LIMITED
  2. validate input (zod)       → VALIDATION / EMPTY_CART
  3. idempotency key seen?      → return the existing order, stop
  4. ONE TRANSACTION:
       re-read settings + products from the DB
       reject unavailable / unpriced / over-max lines
       recompute totals, compare to what the customer saw → PRICE_CHANGED
       INSERT orders  (status = new, number = PC-<seq>, notification = pending)
       INSERT order_items (name/brand/vial/price snapshots)
  5. AFTER COMMIT: send new-order email (lib/order-email.ts)
       record notification_status = sent | failed
        │
        ├──► customer: redirected to /[locale]/order/PC-…?t=…
        │
        └──► admin:   email in the store inbox
                      + "New orders" count on /admin
                      + row in /admin/orders (status New)
                              │
                              ▼
                      Admin opens /admin/orders/<id>
                      New → Processing → Out for delivery → Completed
                      (or Cancel from any non-terminal step)
```

## 1. The order is created

`placeOrder` in `lib/orders.ts` is the only place an order is written. Its
rules, in order:

| Step | What it does | Customer sees if it fails |
|------|--------------|---------------------------|
| Rate limit | `order:ip:<sha256 of IP>`; 5 orders per 10 minutes by default (`ORDER_LIMIT_PER_IP`) | `RATE_LIMITED` |
| Validation | `placeOrderSchema` (`lib/schemas/order.ts`): name, phone, address, 18+ acknowledgment, cart lines | `VALIDATION` / `EMPTY_CART` with field error codes |
| Idempotency | Same `idempotencyKey` as an earlier submit returns that order. A concurrent duplicate that loses the race (unique violation `23505`) also returns the winner's order | none: the customer gets the original order |
| Availability | Every line must be a published product of an active brand | `ITEM_UNAVAILABLE` + product ids |
| Pricing | Every line must have a price; quantity ≤ `store_settings.max_line_quantity` | `ITEM_UNPRICED` / `VALIDATION` |
| Price check | Totals recomputed from the DB. If they differ from `expectedTotalMinor` (what the customer was shown) the order is refused and fresh prices are returned | `PRICE_CHANGED` + updated cart |

When every check passes, a single transaction writes:

- **`orders`** row: `status = 'new'`, `payment_method = 'cod'`,
  `notification_status = 'pending'`, the customer's name, phone, address,
  notes, locale, the acknowledgment time, server-computed subtotal, delivery
  fee and total, and a random `access_token` for the confirmation link.
  `order_number` comes from the Postgres sequence `order_number_seq`
  (starting at 100000), so numbers look like `PC-100000`, `PC-100001`, ….
- **`order_items`** rows: a **snapshot** of each product's name, brand, vial
  size and unit price, plus quantity and line total. Editing or deleting a
  product later never changes an existing order.

Nothing price-related from the browser is trusted. The cart in
`localStorage` holds only product ids and quantities.

## 2. The admin is notified by email

After the transaction commits, `placeOrder` calls `sendOrderEmail`
(`lib/order-email.ts`). The email is sent **after** the order is saved, so
an email failure can never lose an order.

**Recipient**: the store email set in **Admin → Settings**
(`store_settings.email`). If that is blank, the `ORDER_NOTIFICATION_EMAIL`
environment variable is used instead.

**Sender**: `ORDER_EMAIL_FROM`, defaulting to `Orders <onboarding@resend.dev>`.
Set a sender on a domain you have verified in Resend before launch; the
default only delivers to the Resend account owner's own address.

**Contents** (subject `New order PC-… (₪total): call to confirm`, plain text + HTML):

- a "Before dispatching" checklist at the top: check the details, call the
  customer (the phone is a tappable `tel:` link), then approve or cancel the
  order via an **Open order** link to `/admin/orders/<id>` (built from
  `NEXT_PUBLIC_SITE_URL`). The link still requires an admin sign-in. Approval
  is deliberately not a one-click link in the email, because mail scanners
  open links automatically.
- order number, time placed (UTC, ISO format), customer language
- customer name, phone, delivery address, notes
- every item: product, brand, vial size, quantity, unit price, line total
- subtotal, delivery fee ("Free" when 0), total
- "Payment method: Cash on delivery"
- "18+/research-use acknowledgment: confirmed"

All customer-entered text is HTML-escaped in the HTML body.

**Outcome is recorded on the order**:

| Situation | `notification_status` | `notification_error` |
|-----------|----------------------|----------------------|
| Sent through Resend | `sent` | null |
| Dev, no `RESEND_API_KEY` or no recipient | `sent` (email is printed to the server console instead) | null |
| Production, no recipient configured | `failed` | `no_recipient` |
| Production, no `RESEND_API_KEY` | `failed` | `not_configured` |
| Resend returned an error | `failed` | `provider_error` |
| Network or other exception | `failed` | `send_failed` |

There is no push notification, SMS or WhatsApp alert, and the dashboard does
not refresh itself. The email is the only active alert; otherwise the admin
sees new orders the next time they load a dashboard page.

## 3. Where the order shows up in the dashboard

All pages below are behind the admin sign-in (`app/admin/layout.tsx`), and
every action re-checks the session with `withAdmin`/`requireAdmin`.

- **`/admin`**: the "New orders" card counts orders with status `new`;
  "Orders to process" counts `processing`. Each card links to the filtered
  order list.
- **`/admin/orders`**: newest first, 50 per page, filterable by status. Each
  row shows the order number, time placed (UTC), customer name, total,
  status, and an **Email** column that reads **Not sent** in red when the
  notification failed.
- **`/admin/orders/<id>`**: the full order: customer name, phone (a `tel:`
  link), delivery address, notes, time placed, payment method, the
  acknowledgment time, the customer's language, the item snapshots and the
  totals.

## 4. The admin works the order

While an order is **New**, the order page shows a **Confirm by phone** panel
instead of the status buttons: the customer's phone as a `tel:` link, then
**Approve order** (moves it to Processing) or **Cancel order**. A new order
cannot jump ahead to Out for delivery or Completed until it is approved.

After approval, **Change status** shows only the moves the state machine
allows (`lib/order-status.ts`):

```
new ──► processing ──► out_for_delivery ──► completed
 │           │                 │
 └───────────┴─────────────────┴──────────► cancelled
```

- An order can move forward to **any later step**, not just the next one
  (e.g. `new` straight to `completed`).
- **Cancel** is available from every non-terminal step and asks for
  confirmation first.
- `completed` and `cancelled` are terminal. Once there, the status can never
  change again and no buttons are shown.
- The server re-checks the move (`updateOrderStatus` in
  `app/admin/actions/orders.ts`) and returns `INVALID_TRANSITION` if the
  order changed in the meantime (for example, two admins acting at once).

Typical cash-on-delivery handling:

1. **New**: read the email, call the customer to confirm they placed the
   order, then press **Approve order** (→ Processing), or **Cancel order** if
   they deny it or can't be reached.
2. **Processing**: pack the items listed on the order.
3. **Out for delivery**: the courier is on the way and collects the
   **Total** in cash.
4. **Completed**: cash collected and delivered. Or **Cancel** if the customer
   refused, was unreachable, or the order can't be filled.

Order details (items, prices, customer info) cannot be edited from the
dashboard. To change an order, cancel it and have the customer place a new
one.

## 5. What the customer sees

The customer is never emailed or messaged when the status changes. Their
confirmation page, `/[locale]/order/PC-…?t=…`, is rendered fresh
on every request, so reopening that link shows the current status as a
progress chain (`components/store/order-progress.tsx`), or a cancelled
notice. Without the correct token (the order's `access_token`) the page shows nothing.

## 6. If the email failed

The order is saved regardless. To recover:

1. Find it: `/admin/orders` shows **Not sent** in the Email column, and the
   order page's **Store email** section shows the error code.
2. Fix the cause: set the store email in **Settings**, or set
   `RESEND_API_KEY` / `ORDER_NOTIFICATION_EMAIL` / `ORDER_EMAIL_FROM` in the
   deployment environment, or check the Resend dashboard for a
   `provider_error`.
3. Press **Resend email** on the order page (`resendOrderEmail`). It rebuilds
   the email from the saved order and items, sends it to the *current* store
   email, and updates `notification_status`. The button disappears once the
   email is sent.

## Configuration checklist

| Setting | Where | Needed for |
|---------|-------|------------|
| Store email | Admin → Settings | Recipient of new-order emails (preferred) |
| `ORDER_NOTIFICATION_EMAIL` | env | Fallback recipient when the store email is blank |
| `RESEND_API_KEY` | env | Sending at all in production |
| `ORDER_EMAIL_FROM` | env | A verified sender address |
| `NEXT_PUBLIC_SITE_URL` | env | The "Open order" link in the email (falls back to localhost) |
| `ORDER_LIMIT_PER_IP` | env, optional | Orders per IP per 10 minutes (default 5) |

## Code map

| Concern | File |
|---------|------|
| Checkout server actions | `app/[locale]/checkout/actions.ts` |
| Order creation, idempotency, confirmation lookup | `lib/orders.ts` |
| Server-side pricing | `lib/pricing.ts` |
| Notification email (build + send) | `lib/order-email.ts` |
| Status values and allowed transitions | `lib/order-status.ts` |
| Admin order actions (status, resend email) | `app/admin/actions/orders.ts` |
| Admin order queries | `lib/db/queries/orders.ts`, `lib/db/queries/admin.ts` (`dashboardCounts`) |
| Admin pages | `app/admin/(protected)/page.tsx`, `app/admin/(protected)/orders/page.tsx`, `app/admin/(protected)/orders/[id]/page.tsx` |
| Customer status view | `app/[locale]/order/[orderNumber]/page.tsx`, `components/store/order-progress.tsx` |
| Tables, sequence, enums | `lib/db/schema.ts` (`orders`, `order_items`, `order_number_seq`, `order_status`, `notification_status`) |
