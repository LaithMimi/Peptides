import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
    // Raise the OTP rate limits so the suite's repeated code sends from one
    // IP are not throttled. Note: with reuseExistingServer, an already
    // running dev server keeps its own limits and env.
    env: {
      OTP_SEND_LIMIT_PER_IP: "1000",
      OTP_SEND_LIMIT_PER_PHONE: "1000",
      OTP_CHECK_LIMIT_PER_IP: "1000",
    },
  },
});
