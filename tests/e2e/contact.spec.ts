import { expect, test } from "@playwright/test";

test.describe("contact page", () => {
  test("shows Jerusalem and the contact email, with no phone or WhatsApp (English)", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Contact us" }).first().click();
    await expect(page.getByRole("heading", { name: "Contact us" })).toBeVisible();
    await expect(page.getByText("Jerusalem")).toBeVisible();
    await expect(page.locator('a[href="mailto:pepclubil7@gmail.com"]')).toBeVisible();
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  });

  test("renders in Arabic with the email isolated left-to-right", async ({ page }) => {
    await page.goto("/ar/contact");
    await expect(page.getByRole("heading", { name: "اتصل بنا" })).toBeVisible();
    await expect(page.getByText("القدس")).toBeVisible();
    await expect(page.locator('a[href="mailto:pepclubil7@gmail.com"] bdi[dir="ltr"]')).toBeVisible();
  });

  test("footer no longer shows placeholder business details", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByText("to be completed before launch")).toHaveCount(0);
    await expect(page.locator('footer a[href*="wa.me"]')).toHaveCount(0);
    await page.goto("/en/legal/terms");
    await expect(page.getByText("to be completed before launch")).toHaveCount(0);
  });
});
