// Creates (or resets the password of) an admin user in the database in
// DATABASE_URL, or in the embedded dev database when it is unset.
//   ADMIN_SEED_EMAIL=owner@example.com ADMIN_SEED_PASSWORD='...' npm run admin:create
// Without those variables it asks for the email and password.
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { eq } from "drizzle-orm";
import { MIN_PASSWORD_LENGTH, hashPassword } from "../lib/admin-auth";
import { getDb } from "../lib/db/client";
import { adminUsers } from "../lib/db/schema";

async function main() {
  let email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  let password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    const rl = createInterface({ input: stdin, output: stdout });
    email = (await rl.question("Admin email: ")).trim().toLowerCase();
    password = await rl.question(`Password (min ${MIN_PASSWORD_LENGTH} characters): `);
    rl.close();
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error("A valid email is required.");
    process.exit(1);
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    console.error(`The password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }

  const db = await getDb();
  const passwordHash = await hashPassword(password);
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
  if (existing) {
    await db
      .update(adminUsers)
      .set({ passwordHash, failedAttempts: 0, lockedUntil: null })
      .where(eq(adminUsers.id, existing.id));
    console.log(`Updated password for ${email}.`);
  } else {
    await db.insert(adminUsers).values({ email, passwordHash });
    console.log(`Created admin ${email}.`);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
