// Crestline Kits database schema.
// Money values are integers in the smallest unit: pesewas for GH₵ (GH₵ 1.00 = 100), cents for USD.
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const roleEnum = pgEnum("role", ["CUSTOMER", "ADMIN"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);
export const discountTypeEnum = pgEnum("discount_type", ["PERCENT", "FIXED"]);

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("CUSTOMER"),
  createdAt: createdAt(),
});

export const categories = pgTable("categories", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  blurb: text("blurb"),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    team: text("team").notNull(),
    season: text("season"),
    kitType: text("kit_type").notNull().default("Home"),
    brand: text("brand"),
    description: text("description").notNull(),
    details: text("details").array().notNull().default(sql`'{}'::text[]`),
    color: text("color"),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    // Price for buyers outside Ghana and Nigeria, in US cents. Empty = converted from the GH₵ price.
    priceUsd: integer("price_usd"),
    compareAtPriceUsd: integer("compare_at_price_usd"),
    images: text("images").array().notNull().default(sql`'{}'::text[]`),
    featured: boolean("featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(true),
    active: boolean("active").notNull().default(true),
    allowCustomization: boolean("allow_customization").notNull().default(true),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    stock: integer("stock").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("variant_product_size_idx").on(t.productId, t.size)],
);

export const orders = pgTable(
  "orders",
  {
    id: id(),
    number: text("number").notNull().unique(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    region: text("region").notNull(),
    country: text("country").notNull().default("GH"), // ISO code, e.g. GH, NG, GB
    currency: text("currency").notNull().default("GHS"), // GHS or USD; every amount on the order is in this
    deliveryMethod: text("delivery_method").notNull(), // "delivery" | "pickup"
    notes: text("notes"),
    subtotal: integer("subtotal").notNull(),
    customizationTotal: integer("customization_total").notNull().default(0),
    deliveryFee: integer("delivery_fee").notNull(),
    discount: integer("discount").notNull().default(0),
    total: integer("total").notNull(),
    // What Paystack charges, always in pesewas. Same as total for GH₵ orders; for USD orders it's the
    // total converted to GH₵, because Paystack only charges Ghana businesses in GH₵.
    chargeAmount: integer("charge_amount"),
    promoCode: text("promo_code"),
    status: orderStatusEnum("status").notNull().default("PENDING"),
    paymentRef: text("payment_ref").unique(),
    paymentChannel: text("payment_channel"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("orders_user_idx").on(t.userId), index("orders_status_idx").on(t.status)],
);

export const orderItems = pgTable("order_items", {
  id: id(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: text("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  image: text("image"),
  size: text("size").notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  customName: text("custom_name"),
  customNumber: text("custom_number"),
  customizationFee: integer("customization_fee").notNull().default(0),
});

export const promoCodes = pgTable("promo_codes", {
  id: id(),
  code: text("code").notNull().unique(),
  type: discountTypeEnum("type").notNull(),
  value: integer("value").notNull(), // percent (1–100) or fixed amount in pesewas
  minSubtotal: integer("min_subtotal").notNull().default(0),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: createdAt(),
});

// Relations (used by db.query.* helpers)
export const usersRelations = relations(users, ({ many }) => ({ orders: many(orders) }));
export const categoriesRelations = relations(categories, ({ many }) => ({ products: many(products) }));
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
}));
export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
