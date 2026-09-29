"use server";

import { eq } from "drizzle-orm";
import { withAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { categorySchema, fieldErrors, formDataToObject } from "@/lib/schemas/admin";
import {
  isUniqueViolation,
  isUuid,
  uniqueViolationField,
  type ActionState,
} from "./shared";

/** Creates or updates a research area. Wording must be research-only (see the form hint). */
export async function saveCategory(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  return withAdmin(async () => {
    const parsed = categorySchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return { ok: false, code: "VALIDATION", fieldErrors: fieldErrors(parsed.error) };
    }
    const { id, ...values } = parsed.data;
    const db = await getDb();
    try {
      if (id) {
        const updated = await db
          .update(categories)
          .set(values)
          .where(eq(categories.id, id))
          .returning({ id: categories.id });
        if (updated.length === 0) return { ok: false, code: "NOT_FOUND" };
        return { ok: true, id };
      }
      const [created] = await db.insert(categories).values(values).returning({ id: categories.id });
      return { ok: true, id: created.id };
    } catch (error) {
      if (isUniqueViolation(error)) {
        return {
          ok: false,
          code: "VALIDATION",
          fieldErrors: { [uniqueViolationField(error, "slug")]: "taken" },
        };
      }
      throw error;
    }
  });
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<ActionState> {
  return withAdmin(async () => {
    if (!isUuid(id) || typeof isActive !== "boolean") return { ok: false, code: "VALIDATION" };
    const db = await getDb();
    const updated = await db
      .update(categories)
      .set({ isActive })
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    return updated.length ? { ok: true, id } : { ok: false, code: "NOT_FOUND" };
  });
}
