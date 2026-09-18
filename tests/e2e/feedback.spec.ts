import { test, expect } from "@playwright/test";

test.describe("landing page feedback section", () => {
  test("shows a translated error for an invalid email, then a success state on a valid submit", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: "Tell us what you think" })).toBeVisible();

    await page.locator("#feedbackEmail").fill("not-an-email");
    await page.locator("#feedbackMessage").fill("Please add more compounds.");
    await page.getByRole("button", { name: "Send feedback" }).click();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();

    await page.locator("#feedbackEmail").fill("jane@example.com");
    await page.getByRole("button", { name: "Send feedback" }).click();
    await expect(page.getByRole("status")).toContainText("Thank you");
  });

  test("renders in Arabic", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.getByRole("heading", { name: "شاركنا رأيك" })).toBeVisible();
  });
});
