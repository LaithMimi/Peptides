"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { withAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db/client";
import { inboundMessages } from "@/lib/db/schema";
import { isUuid, type ActionState } from "./shared";

/** Marks a customer message as read (or unread again). */
export async function setMessageRead(id: string, isRead: boolean): Promise<ActionState> {
  return withAdmin(async () => {
    if (!isUuid(id)) return { ok: false, code: "VALIDATION" };
    const db = await getDb();
    await db.update(inboundMessages).set({ isRead }).where(eq(inboundMessages.id, id));
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true, id };
  });
}
