"use server";

import { eq } from "drizzle-orm";
import { withAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { brands } from "@/lib/db/schema";
import { brandSchema, fieldErrors, formDataToObject } from "@/lib/schemas/admin";
import {
  isUniqueViolation,
  isUuid,
  uniqueViolationField,
  type ActionState,
} from "./shared";

/** Creates or updates a brand. Deactivating a brand hides it and its products, never deletes them. */
export async function saveBrand(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  return withAdmin(async () => {
    const parsed = brandSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return { ok: false, code: "VALIDATION", fieldErrors: fieldErrors(parsed.error) };
    }
    const { id, ...values } = parsed.data;
    const db = await getDb();
    try {
      if (id) {
        const updated = await db.update(brands).set(values).where(eq(brands.id, id)).returning({ id: brands.id });
        if (updated.length === 0) return { ok: false, code: "NOT_FOUND" };
        return { ok: true, id };
      }
      const [created] = await db.insert(brands).values(values).returning({ id: brands.id });
      return { ok: true, id: created.id };
    } catch (error) {
      if (isUniqueViolation(error)) {
        const field = uniqueViolationField(error, "nameEn");
        return { ok: false, code: "VALIDATION", fieldErrors: { [field]: "taken" } };
      }
      throw error;
    }
  });
}

export async function setBrandActive(id: string, isActive: boolean): Promise<ActionState> {
  return withAdmin(async () => {
    if (!isUuid(id) || typeof isActive !== "boolean") return { ok: false, code: "VALIDATION" };
    const db = await getDb();
    const updated = await db
      .update(brands)
      .set({ isActive })
      .where(eq(brands.id, id))
      .returning({ id: brands.id });
    return updated.length ? { ok: true, id } : { ok: false, code: "NOT_FOUND" };
  });
}
