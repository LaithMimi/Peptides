"use server";

import { eq } from "drizzle-orm";
import { withAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { pages } from "@/lib/db/schema";
import { fieldErrors, formDataToObject, pageSchema } from "@/lib/schemas/admin";
import type { ActionState } from "./shared";

/**
 * Saves the text of an informational page. Bodies are Markdown; raw HTML in the
 * text is never rendered on the storefront. `isPlaceholder` stays on until the
 * client has approved the wording.
 */
export async function savePage(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  return withAdmin(async () => {
    const parsed = pageSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return { ok: false, code: "VALIDATION", fieldErrors: fieldErrors(parsed.error) };
    }
    const { slug, ...values } = parsed.data;
    const db = await getDb();
    const updated = await db
      .update(pages)
      .set(values)
      .where(eq(pages.slug, slug))
      .returning({ id: pages.id });
    return updated.length ? { ok: true, id: updated[0].id } : { ok: false, code: "NOT_FOUND" };
  });
}
