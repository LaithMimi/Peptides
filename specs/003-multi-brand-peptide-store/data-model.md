# Data Model: Multi-Brand Peptide Store

Postgres, managed with Drizzle migrations. All tables have `id` (uuid, primary key),
`created_at` and `updated_at` unless stated. Money is integer agorot (ILS). Localized text
uses `_en` (required) and `_ar` (nullable) columns; the app falls back to the other language
when one is empty (FR-040).

## Entity relationships

```text
brands 1 ──< products >──< product_categories >── categories
                 │
                 ├──< product_images
                 └──< order_items >── 1 orders
store_settings (single row)     pages (per slug)     admin_users     rate_limits
```

## brands

| Field | Type | Rules |
|---|---|---|
| name_en / name_ar | text | en required; unique (case-insensitive) on en |
| slug | text | unique, lowercase `a-z0-9-`, 2-60 chars |
| logo_url | text null | Blob URL |
| description_en / description_ar | text null | max 2000 |
| is_active | boolean | default true; inactive hides brand and all its products publicly |

## categories (research areas)

| Field | Type | Rules |
|---|---|---|
| name_en / name_ar | text | en required |
| slug | text | unique |
| description_en / description_ar | text null | max 500; what the research area covers, shown on picker tiles |
| image_url | text null | Blob URL, optional tile image |
| sort_order | int | default 0 |
| is_active | boolean | default true |

## products

| Field | Type | Rules |
|---|---|---|
| brand_id | uuid FK brands | required, restrict delete |
| name_en / name_ar | text | en required, max 160 |
| slug | text | unique per brand |
| description_en / description_ar | text null | max 4000; no dosage or therapeutic claims (editor hint) |
| research_focus_en / research_focus_ar | text null | max 300; one line on what the peptide is studied for in the laboratory; client-approved; no dosage, therapeutic or human-use language |
| usage_en / usage_ar | text null | laboratory handling/storage information only |
| warnings_en / warnings_ar | text null | shown on product page when present |
| vial_size | text null | e.g. `10 mg`; rendered with `LtrValue` |
| purity_coa | text null | shown only when supplied; never auto-generated |
| price_minor | integer null | null = unpriced (valid); if set, must be >= 1 and <= 10,000,000 |
| status | enum `draft｜published｜unpublished` | default `draft` |
| is_featured | boolean | default false (home featured section) |
| sort_order | int | default 0 |

Indexes: `(brand_id, slug)` unique; `(status, brand_id)`; `(status, price_minor IS NULL)` for the
price-availability filter. Visible publicly only when `status = 'published'` AND brand
`is_active` (FR-007). Deleting a product referenced by orders is blocked; admins unpublish
instead. Order items keep the snapshot regardless.

## product_images

| Field | Type | Rules |
|---|---|---|
| product_id | uuid FK products | cascade delete |
| url | text | Blob URL |
| alt_en / alt_ar | text null | falls back to product name |
| sort_order | int | first image is the card image |

## product_categories

`product_id` FK, `category_id` FK, primary key on the pair. Many-to-many; a product may have
zero or more categories.

## orders

| Field | Type | Rules |
|---|---|---|
| order_number | text | unique, from sequence, e.g. `PC-100234` |
| idempotency_key | uuid | unique; makes resubmission return the same order |
| access_token | text | random, unique; required to view the confirmation page |
| customer_name | text | 2-120 |
| customer_phone | text | normalized E.164 via libphonenumber-js |
| delivery_address | text | 5-500 |
| notes | text null | max 1000 |
| subtotal_minor | integer | server computed |
| delivery_fee_minor | integer | snapshot of the fee at order time |
| total_minor | integer | subtotal + delivery fee |
| payment_method | enum `cod` | only value in MVP |
| status | enum `new｜processing｜out_for_delivery｜completed｜cancelled` | default `new` |
| acknowledged_at | timestamptz | required; records 18+/research-use acceptance |
| locale | text | `en` or `ar` at order time (used for the email and confirmation) |
| notification_status | enum `pending｜sent｜failed` | default `pending` |
| notification_error | text null | short code, no secrets |

Index `(status, created_at desc)` for the admin list and dashboard counts.

**Status transitions** (admin-driven; any forward move plus cancel from non-terminal states):
`new → processing → out_for_delivery → completed`; `cancelled` reachable from `new`,
`processing`, `out_for_delivery`; `completed` and `cancelled` are terminal. Each change updates
`updated_at`.

## order_items

| Field | Type | Rules |
|---|---|---|
| order_id | uuid FK orders | cascade |
| product_id | uuid null FK products | set null on delete; snapshot keeps history |
| product_name_snapshot | text | name in the order locale at order time |
| brand_name_snapshot | text | |
| vial_size_snapshot | text null | |
| unit_price_minor | integer | snapshot |
| quantity | integer | 1..store max per line |
| line_total_minor | integer | unit price × quantity |

Snapshots make order history immutable when products change (SC-010).

## store_settings (exactly one row)

| Field | Type | Rules |
|---|---|---|
| store_name | text | required |
| logo_url | text null | |
| phone | text null | |
| whatsapp_number | text null | digits with country code; buttons hidden if empty |
| email | text null | order notification recipient |
| address | text null | |
| delivery_enabled | boolean | default true |
| delivery_fee_minor | integer | default 0 (free); applied only if delivery enabled |
| unpriced_behavior | enum `ask_price｜hide_price` | default `ask_price` |
| default_locale | text | `en` or `ar` |
| supported_locales | text[] | subset of `en`, `ar`, at least one, includes default |
| max_line_quantity | integer | default 10 |

A single-row constraint (`id = 1` check) prevents duplicates. When delivery is disabled the
checkout shows no delivery fee line and treats the fee as 0.

## pages

| Field | Type | Rules |
|---|---|---|
| slug | text | unique; fixed set `about`, `terms`, `privacy`, `shipping-returns`, `product-disclaimer` |
| title_en / title_ar | text | en required |
| body_en / body_ar | text | Markdown, raw HTML disabled |
| is_placeholder | boolean | true until an admin marks the text as client-approved |

## admin_users

| Field | Type | Rules |
|---|---|---|
| email | text | unique, lowercase |
| password_hash | text | scrypt with per-user salt and parameters embedded |
| failed_attempts / locked_until | int / timestamptz null | lockout: 5 failures then 15 minutes |
| last_login_at | timestamptz null | |

## rate_limits

`key` (text), `window_start` (timestamptz), `count` (int); primary key `(key, window_start)`.
Keys such as `order:ip:<hash>` and `login:ip:<hash>`. Old windows are deleted opportunistically.

## Validation summary (server side, Zod)

Product: slug pattern, price integer range or null, status enum, at least one language name,
image count ≤ 10. Order: valid E.164 phone, name/address lengths, quantity 1..max, at most 30
lines, `acknowledged` must be true. Settings: fee ≥ 0, locales valid. Error `message` values are
short codes (`required`, `invalidPrice`, `ackRequired`, ...) mapped through `errors.*` messages,
following the existing error-code translation pattern.
