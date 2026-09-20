import { expect, test } from "@playwright/test";

test.describe("contact page", () => {
  test("shows Jerusalem and a tap-to-call phone link (English)", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Contact us" }).first().click();
    await expect(page.getByRole("heading", { name: "Contact us" })).toBeVisible();
    await expect(page.getByText("Jerusalem")).toBeVisible();
    await expect(page.locator('a[href="tel:+972587114119"]')).toBeVisible();
  });

  test("renders in Arabic with the phone number isolated left-to-right", async ({ page }) => {
    await page.goto("/ar/contact");
    await expect(page.getByRole("heading", { name: "اتصل بنا" })).toBeVisible();
    await expect(page.getByText("القدس")).toBeVisible();
    await expect(page.locator('a[href="tel:+972587114119"] bdi[dir="ltr"]')).toBeVisible();
  });

  test("footer no longer shows placeholder business details", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByText("to be completed before launch")).toHaveCount(0);
    await page.goto("/en/legal/terms");
    await expect(page.getByText("to be completed before launch")).toHaveCount(0);
  });
});
