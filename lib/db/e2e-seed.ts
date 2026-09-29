import { hashPassword } from "@/lib/admin-auth";
import type { Db } from "./client";
import { adminUsers } from "./schema";

// Test-only: Playwright sets E2E_SEED_ADMIN=1 so the admin e2e specs can sign
// in. Real admins are created with `npm run admin:create`. Never enabled in
// production (the embedded database itself is never used there).
export const E2E_ADMIN = {
  email: "admin@example.com",
  password: "e2e-admin-password-1",
};

export async function seedE2eAdmin(db: Db): Promise<void> {
  await db
    .insert(adminUsers)
    .values({ email: E2E_ADMIN.email, passwordHash: await hashPassword(E2E_ADMIN.password) })
    .onConflictDoNothing();
}
