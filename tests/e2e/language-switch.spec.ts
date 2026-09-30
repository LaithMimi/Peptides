import { expect, test, type Page } from "@playwright/test";

// Switching language must never lose the cart or what the customer has
// already typed at checkout (US6). The cart lives in localStorage (locale-
// independent); the typed fields are restored from lib/checkout-draft.ts
// (see components/store/checkout-form.tsx). The e2e seed prices BPC-157
// (see lib/db/seed.ts).

async function chooseLanguage(page: Page, name: "English" | "العربية") {
  await page.getByRole("button", { name: /^(Language|اللغة):/ }).click();
  await page.getByRole("button", { name, exact: true }).click();
}

test.describe("language switch keeps cart and checkout draft (US6)", () => {
  test("cart survives a language switch", async ({ page }) => {
    await page.goto("/en/products/pep-lab/bpc-157");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByText("Added to your cart.")).toBeVisible();

    await chooseLanguage(page, "العربية");
    await expect(page).toHaveURL(/\/ar\//);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.goto("/ar/cart");
    await expect(page.getByRole("link", { name: "BPC-157" })).toBeVisible();
  });

  test("typed checkout fields survive switching language mid-checkout, but not the acknowledgment", async ({
    page,
  }) => {
    await page.goto("/en/products/pep-lab/bpc-157");
    await page.getByRole("button", { name: "Add to cart" }).click();

    await page.goto("/en/checkout");
    await page.locator("#customerName").fill("Sara Khalil");
    await page.locator("#customerPhone").fill("050 123 4567");
    await page.locator("#deliveryAddress").fill("12 Main Street, Jerusalem");
    await page.getByLabel(/I confirm I am 18/).check();

    await chooseLanguage(page, "العربية");
    await expect(page).toHaveURL(/\/ar\/checkout$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    // Name, phone and address are restored from the draft...
    await expect(page.locator("#customerName")).toHaveValue("Sara Khalil");
    await expect(page.locator("#customerPhone")).toHaveValue("050 123 4567");
    await expect(page.locator("#deliveryAddress")).toHaveValue("12 Main Street, Jerusalem");
    // ...but the 18+/research-use acknowledgment is never remembered.
    await expect(page.getByLabel(/أؤكد أن عمري/)).not.toBeChecked();

    // Switching back to English keeps the draft too.
    await chooseLanguage(page, "English");
    await expect(page).toHaveURL(/\/en\/checkout$/);
    await expect(page.locator("#customerName")).toHaveValue("Sara Khalil");
  });
});
