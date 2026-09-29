"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate, endAdminSession, startAdminSession } from "@/lib/admin-auth";
import type { ActionState } from "./shared";

export async function adminLogin(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email.trim() || !password) {
    return { ok: false, code: "VALIDATION" };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const result = await authenticate(email, password, ip);
  if (!result.ok) return { ok: false, code: result.code };

  await startAdminSession(result.user.id);
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}
