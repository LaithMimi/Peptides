"use server";

import { withAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { storeSettings } from "@/lib/db/schema";
import { fieldErrors, formDataToObject, settingsSchema } from "@/lib/schemas/admin";
import type { ActionState } from "./shared";

/** Saves the single store-settings row. Validated on the server (fee, locales, WhatsApp digits, email). */
export async function saveSettings(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  return withAdmin(async () => {
    const parsed = settingsSchema.safeParse(formDataToObject(formData, ["supportedLocales"]));
    if (!parsed.success) {
      return { ok: false, code: "VALIDATION", fieldErrors: fieldErrors(parsed.error) };
    }
    const { deliveryFee, ...rest } = parsed.data;
    const values = { ...rest, deliveryFeeMinor: deliveryFee };
    const db = await getDb();
    await db
      .insert(storeSettings)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({ target: storeSettings.id, set: values });
    return { ok: true };
  });
}
