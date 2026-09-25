import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgSequence,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Money is stored as integer agorot (ILS minor units); see lib/money.ts.
// Localized text uses `_en` (required) and `_ar` (nullable) columns; see
// lib/i18n-fields.ts for the fallback rule.

export const orderNumberSeq = pgSequence("order_number_seq", {
  startWith: 100000,
});

export const productStatus = pgEnum("product_status", [
  "draft",
  "published",
  "unpublished",
]);
export const orderStatus = pgEnum("order_status", [
  "new",
  "processing",
  "out_for_delivery",
  "completed",
  "cancelled",
]);
export const paymentMethod = pgEnum("payment_method", ["cod"]);
export const notificationStatus = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
]);
export const unpricedBehavior = pgEnum("unpriced_behavior", [
  "ask_price",
  "hide_price",
]);

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const brands = pgTable(
  "brands",
  {
    id: id(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar"),
    slug: text("slug").notNull().unique(),
    logoUrl: text("logo_url"),
    descriptionEn: text("description_en"),
    descriptionAr: text("description_ar"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("brands_name_en_lower_idx").on(sql`lower(${t.nameEn})`)]
);

export const categories = pgTable("categories", {
  id: id(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar"),
  slug: text("slug").notNull().unique(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const products = pgTable(
  "products",
  {
    id: id(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "restrict" }),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar"),
    slug: text("slug").notNull(),
    descriptionEn: text("description_en"),
    descriptionAr: text("description_ar"),
    researchFocusEn: text("research_focus_en"),
    researchFocusAr: text("research_focus_ar"),
    usageEn: text("usage_en"),
    usageAr: text("usage_ar"),
    warningsEn: text("warnings_en"),
    warningsAr: text("warnings_ar"),
    vialSize: text("vial_size"),
    purityCoa: text("purity_coa"),
    // null = unpriced (valid). When set: >= 1 and <= 10,000,000 agorot.
    priceMinor: integer("price_minor"),
    status: productStatus("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("products_brand_slug_idx").on(t.brandId, t.slug),
    index("products_status_brand_idx").on(t.status, t.brandId),
    index("products_status_unpriced_idx").on(
      t.status,
      sql`(${t.priceMinor} IS NULL)`
    ),
    check(
      "products_price_range",
      sql`${t.priceMinor} IS NULL OR (${t.priceMinor} >= 1 AND ${t.priceMinor} <= 10000000)`
    ),
  ]
);

export const productImages = pgTable(
  "product_images",
  {
    id: id(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altEn: text("alt_en"),
    altAr: text("alt_ar"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId, t.sortOrder)]
);

export const productCategories = pgTable(
  "product_categories",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.categoryId] }),
    index("product_categories_category_idx").on(t.categoryId),
  ]
);

export const orders = pgTable(
  "orders",
  {
    id: id(),
    orderNumber: text("order_number")
      .notNull()
      .unique()
      .default(sql`'PC-' || nextval('order_number_seq')::text`),
    idempotencyKey: uuid("idempotency_key").notNull().unique(),
    accessToken: text("access_token").notNull().unique(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    notes: text("notes"),
    subtotalMinor: integer("subtotal_minor").notNull(),
    deliveryFeeMinor: integer("delivery_fee_minor").notNull(),
    totalMinor: integer("total_minor").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull().default("cod"),
    status: orderStatus("status").notNull().default("new"),
    acknowledgedAt: timestamp("acknowledged_at", {
      withTimezone: true,
    }).notNull(),
    locale: text("locale").notNull(),
    notificationStatus: notificationStatus("notification_status")
      .notNull()
      .default("pending"),
    notificationError: text("notification_error"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("orders_status_created_idx").on(t.status, t.createdAt.desc())]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    brandNameSnapshot: text("brand_name_snapshot").notNull(),
    vialSizeSnapshot: text("vial_size_snapshot"),
    unitPriceMinor: integer("unit_price_minor").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalMinor: integer("line_total_minor").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)]
);

export const storeSettings = pgTable(
  "store_settings",
  {
    id: integer("id").primaryKey().default(1),
    storeName: text("store_name").notNull().default("Pep Club"),
    logoUrl: text("logo_url"),
    phone: text("phone"),
    whatsappNumber: text("whatsapp_number"),
    email: text("email"),
    address: text("address"),
    deliveryEnabled: boolean("delivery_enabled").notNull().default(true),
    deliveryFeeMinor: integer("delivery_fee_minor").notNull().default(0),
    unpricedBehavior: unpricedBehavior("unpriced_behavior")
      .notNull()
      .default("ask_price"),
    defaultLocale: text("default_locale").notNull().default("en"),
    supportedLocales: text("supported_locales")
      .array()
      .notNull()
      .default(sql`ARRAY['en','ar']::text[]`),
    maxLineQuantity: integer("max_line_quantity").notNull().default(10),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("store_settings_single_row", sql`${t.id} = 1`),
    check("store_settings_fee_nonneg", sql`${t.deliveryFeeMinor} >= 0`),
  ]
);

export const PAGE_SLUGS = [
  "about",
  "terms",
  "privacy",
  "shipping-returns",
  "product-disclaimer",
  "cookies",
] as const;

export const pages = pgTable(
  "pages",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    titleEn: text("title_en").notNull(),
    titleAr: text("title_ar"),
    bodyEn: text("body_en").notNull().default(""),
    bodyAr: text("body_ar"),
    isPlaceholder: boolean("is_placeholder").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check(
      "pages_slug_fixed",
      sql`${t.slug} IN ('about','terms','privacy','shipping-returns','product-disclaimer','cookies')`
    ),
  ]
);

export const adminUsers = pgTable("admin_users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })]
);

export type Brand = typeof brands.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type StoreSettings = typeof storeSettings.$inferSelect;
export type Page = typeof pages.$inferSelect;
