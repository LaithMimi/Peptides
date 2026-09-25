"use server";

import { and, asc, count, eq, inArray, max } from "drizzle-orm";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { withAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import {
  brands,
  categories,
  orderItems,
  productCategories,
  productImages,
  products,
} from "@/lib/db/schema";
import {
  MAX_PRODUCT_IMAGES,
  fieldErrors,
  formDataToObject,
  imageUrlSchema,
  productSchema,
} from "@/lib/schemas/admin";
import {
  isUniqueViolation,
  isUuid,
  uniqueViolationField,
  type ActionState,
} from "./shared";

/**
 * Creates or updates a product. Validation is entirely server-side: price
 * (empty = unpriced, otherwise 0.01 to 100,000.00), slug (unique per brand),
 * status, and categories. After creating, the admin is sent to the edit page
 * to add images.
 */
export async function saveProduct(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  return withAdmin(async () => {
    const parsed = productSchema.safeParse(formDataToObject(formData, ["categoryIds"]));
    if (!parsed.success) {
      return { ok: false, code: "VALIDATION", fieldErrors: fieldErrors(parsed.error) };
    }
    const { id, price, categoryIds, ...rest } = parsed.data;
    const values = { ...rest, priceMinor: price };
    const db = await getDb();

    const [brand] = await db.select({ id: brands.id }).from(brands).where(eq(brands.id, values.brandId));
    if (!brand) return { ok: false, code: "VALIDATION", fieldErrors: { brandId: "required" } };

    let productId: string;
    try {
      productId = await db.transaction(async (tx) => {
        let pid: string;
        if (id) {
          const updated = await tx
            .update(products)
            .set(values)
            .where(eq(products.id, id))
            .returning({ id: products.id });
          if (updated.length === 0) throw new NotFound();
          pid = id;
        } else {
          const [created] = await tx.insert(products).values(values).returning({ id: products.id });
          pid = created.id;
        }

        const validCategories =
          categoryIds.length === 0
            ? []
            : (
                await tx
                  .select({ id: categories.id })
                  .from(categories)
                  .where(inArray(categories.id, categoryIds))
              ).map((c) => c.id);
        await tx.delete(productCategories).where(eq(productCategories.productId, pid));
        if (validCategories.length > 0) {
          await tx
            .insert(productCategories)
            .values(validCategories.map((categoryId) => ({ productId: pid, categoryId })));
        }
        return pid;
      });
    } catch (error) {
      if (error instanceof NotFound) return { ok: false, code: "NOT_FOUND" };
      if (isUniqueViolation(error)) {
        return {
          ok: false,
          code: "VALIDATION",
          fieldErrors: { [uniqueViolationField(error, "slug")]: "taken" },
        };
      }
      throw error;
    }

    if (!id) redirect(`/admin/products/${productId}`);
    return { ok: true, id: productId };
  });
}

class NotFound extends Error {}

export async function setProductStatus(
  id: string,
  status: "draft" | "published" | "unpublished"
): Promise<ActionState> {
  return withAdmin(async () => {
    if (!isUuid(id) || !["draft", "published", "unpublished"].includes(status)) {
      return { ok: false, code: "VALIDATION" };
    }
    const db = await getDb();
    const updated = await db
      .update(products)
      .set({ status })
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return updated.length ? { ok: true, id } : { ok: false, code: "NOT_FOUND" };
  });
}

/** Deletes a product only if it was never ordered; otherwise the admin should unpublish it. */
export async function deleteProduct(id: string): Promise<ActionState> {
  return withAdmin(async () => {
    if (!isUuid(id)) return { ok: false, code: "VALIDATION" };
    const db = await getDb();
    const [{ ordered }] = await db
      .select({ ordered: count() })
      .from(orderItems)
      .where(eq(orderItems.productId, id));
    if (ordered > 0) return { ok: false, code: "HAS_ORDERS" };
    const removed = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
    return removed.length ? { ok: true, id } : { ok: false, code: "NOT_FOUND" };
  });
}

export async function addProductImage(productId: string, url: string): Promise<ActionState> {
  return withAdmin(async () => {
    const parsedUrl = imageUrlSchema.safeParse(url);
    if (!isUuid(productId) || !parsedUrl.success) {
      return { ok: false, code: "VALIDATION", fieldErrors: { url: parsedUrl.success ? "required" : parsedUrl.error.issues[0].message } };
    }
    const db = await getDb();
    const [{ total, top }] = await db
      .select({ total: count(), top: max(productImages.sortOrder) })
      .from(productImages)
      .where(eq(productImages.productId, productId));
    if (total >= MAX_PRODUCT_IMAGES) {
      return { ok: false, code: "VALIDATION", fieldErrors: { url: "tooManyImages" } };
    }
    const [row] = await db
      .insert(productImages)
      .values({ productId, url: parsedUrl.data, sortOrder: (top ?? -1) + 1 })
      .returning({ id: productImages.id });
    return { ok: true, id: row.id };
  });
}

/** `orderedIds` must be exactly the product's image ids, in the new order. */
export async function reorderProductImages(
  productId: string,
  orderedIds: string[]
): Promise<ActionState> {
  return withAdmin(async () => {
    if (!isUuid(productId) || !Array.isArray(orderedIds) || !orderedIds.every(isUuid)) {
      return { ok: false, code: "VALIDATION" };
    }
    const db = await getDb();
    const existing = await db
      .select({ id: productImages.id })
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.sortOrder));
    const same =
      existing.length === orderedIds.length &&
      new Set(orderedIds).size === orderedIds.length &&
      existing.every((e) => orderedIds.includes(e.id));
    if (!same) return { ok: false, code: "VALIDATION" };

    await db.transaction(async (tx) => {
      for (const [index, imageId] of orderedIds.entries()) {
        await tx
          .update(productImages)
          .set({ sortOrder: index })
          .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
      }
    });
    return { ok: true };
  });
}

/** Removes an image row; an uploaded Vercel Blob file is deleted too (best effort). */
export async function removeProductImage(imageId: string): Promise<ActionState> {
  return withAdmin(async () => {
    if (!isUuid(imageId)) return { ok: false, code: "VALIDATION" };
    const db = await getDb();
    const [removed] = await db
      .delete(productImages)
      .where(eq(productImages.id, imageId))
      .returning({ url: productImages.url });
    if (!removed) return { ok: false, code: "NOT_FOUND" };
    if (removed.url.startsWith("https://") && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(removed.url);
      } catch (error) {
        console.error("Could not delete blob for removed image", error);
      }
    }
    return { ok: true };
  });
}
