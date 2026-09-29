import { defineConfig, devices } from "@playwright/test";

// Specs that change shared catalog data or settings run in their own projects,
// one after another and after the read-only specs, so they never interfere.
const MUTATING = ["admin-catalog", "unpriced", "admin-orders"] as const;
const device = { ...devices["Desktop Chrome"] };

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // The dev server compiles routes on demand; too many parallel workers make
  // first hits time out.
  workers: 2,
  reporter: "list",
  // The dev server compiles each route on its first visit; give assertions room.
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: device,
      testIgnore: MUTATING.map((name) => `**/${name}.spec.ts`),
    },
    ...MUTATING.map((name, index) => ({
      name,
      use: device,
      testMatch: `**/${name}.spec.ts`,
      dependencies: [index === 0 ? "chromium" : MUTATING[index - 1]],
    })),
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
    // Hermetic app for the suite: embedded in-memory database seeded with two
    // priced products and an admin user, and rate limits raised so repeated test
    // requests from one IP are not throttled. Note: with reuseExistingServer, an
    // already running dev server keeps its own env.
    env: {
      PGLITE_DIR: "memory://",
      E2E_SEED_PRICES: "1",
      E2E_SEED_ADMIN: "1",
      ORDER_LIMIT_PER_IP: "1000",
      LOGIN_LIMIT_PER_IP: "1000",
      SUBMIT_LIMIT_PER_IP: "1000",
    },
  },
});
