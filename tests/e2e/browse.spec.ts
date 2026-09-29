import { expect, test } from "@playwright/test";

test.describe("browse the store (US1)", () => {
  test("shop groups products under their brand without opening a brand first", async ({ page }) => {
    await page.goto("/en/shop");
    await expect(page.getByRole("heading", { level: 1, name: "Shop" })).toBeVisible();
    const brandHeading = page.getByRole("heading", { level: 2, name: "PEP Lab" });
    await expect(brandHeading).toBeVisible();
    // All 10 launch products are listed on the first page.
    await expect(page.getByRole("status").first()).toContainText("10 products");
    await expect(page.getByRole("link", { name: /TB-500/i }).first()).toBeVisible();
  });

  test("research-area filter shows only matching products", async ({ page }) => {
    await page.goto("/en/shop");
    await page.getByLabel("Research area").selectOption({ label: "Focus & cognitive research" });
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/area=cognitive/);
    await expect(page.getByRole("status").first()).toContainText("2 products");
    await expect(page.getByRole("link", { name: /Selank/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /TB-500/i })).toHaveCount(0);
  });

  test("price-listed filter hides unpriced products", async ({ page }) => {
    // The e2e seed prices two products (BPC-157 and GHK-Cu); the other eight are unpriced.
    await page.goto("/en/shop?price=listed");
    await expect(page.getByRole("status").first()).toContainText("2 products");
    await expect(page.getByRole("link", { name: /BPC-157/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /TB-500/i })).toHaveCount(0);
  });

  test("category page lists the brands that have products in the area", async ({ page }) => {
    await page.goto("/en/categories/cognitive");
    await expect(
      page.getByRole("heading", { level: 1, name: "Focus & cognitive research" })
    ).toBeVisible();
    await expect(page.getByText("Brands with products in this research area")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "PEP Lab" })).toBeVisible();
  });

  test("product page shows details, research-use disclaimer and brand", async ({ page }) => {
    await page.goto("/en/products/pep-lab/tb-500");
    await expect(page.getByRole("heading", { level: 1, name: "TB-500" })).toBeVisible();
    await expect(page.getByRole("link", { name: "PEP Lab" }).first()).toBeVisible();
    await expect(page.getByText("For Research Use Only", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Price unavailable")).toBeVisible();
  });

  test("an unknown or hidden product shows the friendly unavailable page", async ({ page }) => {
    const response = await page.goto("/en/products/pep-lab/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This product is unavailable" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse the shop" })).toBeVisible();
  });

  test("Arabic shop renders right-to-left", async ({ page }) => {
    await page.goto("/ar/shop");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1, name: "المتجر" })).toBeVisible();
  });
});
