import { expect, test, type Page } from "@playwright/test";

const ADMIN = { email: "admin@example.com", password: "e2e-admin-password-1" };

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

test.describe.configure({ mode: "serial" });

test.describe("admin catalog (US3)", () => {
  test("admin pages are not reachable without signing in", async ({ page }) => {
    for (const path of ["/admin", "/admin/products", "/admin/brands", "/admin/categories"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
    // The upload endpoint refuses too.
    const response = await page.request.post("/api/admin/blob-upload", { data: {} });
    expect(response.status()).toBe(401);
  });

  test("a wrong password is refused with a generic message", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN.email);
    await page.getByLabel("Password").fill("not the password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("The email or password is incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("create a brand, research area and unpriced product; publish, hide, restore", async ({ page }) => {
    await signIn(page);

    // Brand
    await page.goto("/admin/brands/new");
    await page.getByLabel("Name (English)").fill("Acme Labs");
    await page.getByLabel("Address name (slug)").fill("acme-labs");
    await page.getByRole("button", { name: "Create brand" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    // Research area
    await page.goto("/admin/categories/new");
    await page.getByLabel("Name (English)").fill("Sleep research");
    await page.getByLabel("Address name (slug)").fill("sleep-research");
    await page.getByLabel("Description (English)").fill("Laboratory research on sleep pathways.");
    await page.getByRole("button", { name: "Create research area" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    // Product with no price: an invalid price is rejected first.
    await page.goto("/admin/products/new");
    await page.getByLabel("Brand", { exact: true }).selectOption({ label: "Acme Labs" });
    await page.getByLabel("Status").selectOption("published");
    await page.getByLabel("Name (English)").fill("Acme Peptide");
    await page.getByLabel("Address name (slug)").fill("acme-peptide");
    await page.getByLabel("Price (₪)").fill("abc");
    await page.getByLabel("Sleep research").check();
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page.getByText("Enter a price from 0.01 to 100,000.00")).toBeVisible();

    await page.getByLabel("Price (₪)").fill("");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page).toHaveURL(/\/admin\/products\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { name: "Acme Peptide" })).toBeVisible();

    // Add an image already in /public.
    await page.getByPlaceholder("/products/name.jpeg").fill("/products/tb-500.jpeg");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText("Main image")).toBeVisible();

    // Storefront: brand group, research area page, unpriced behavior.
    await page.goto("/en/shop");
    await expect(page.getByRole("heading", { level: 2, name: "Acme Labs" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Acme Peptide/ }).first()).toBeVisible();
    await page.goto("/en/categories/sleep-research");
    await expect(page.getByRole("link", { name: /Acme Peptide/ }).first()).toBeVisible();
    await page.goto("/en/products/acme-labs/acme-peptide");
    await expect(page.getByRole("heading", { level: 1, name: "Acme Peptide" })).toBeVisible();
    await expect(page.getByText("Price unavailable")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toHaveCount(0);

    // Unpublish: it disappears and its address shows the unavailable page.
    await page.goto("/admin/products");
    const row = page.getByRole("row", { name: /Acme Peptide/ });
    await row.getByRole("button", { name: "Unpublish" }).click();
    await expect(row.getByText("Unpublished")).toBeVisible();
    const gone = await page.goto("/en/products/acme-labs/acme-peptide");
    expect(gone?.status()).toBe(404);
    await page.goto("/en/shop");
    await expect(page.getByRole("link", { name: /Acme Peptide/ })).toHaveCount(0);

    // Republish, then deactivate the brand: everything of the brand is hidden but kept.
    await page.goto("/admin/products");
    await page.getByRole("row", { name: /Acme Peptide/ }).getByRole("button", { name: "Publish" }).click();
    await expect(page.getByRole("row", { name: /Acme Peptide/ }).getByText("Published")).toBeVisible();

    await page.goto("/admin/brands");
    const brandRow = page.getByRole("row", { name: /Acme Labs/ });
    await brandRow.getByRole("button", { name: "Deactivate" }).click();
    await expect(brandRow.getByText("Inactive (hidden)")).toBeVisible();
    await page.goto("/en/shop");
    await expect(page.getByRole("heading", { level: 2, name: "Acme Labs" })).toHaveCount(0);

    await page.goto("/admin/brands");
    await page.getByRole("row", { name: /Acme Labs/ }).getByRole("button", { name: "Activate" }).click();
    await expect(page.getByRole("row", { name: /Acme Labs/ }).getByText("Active")).toBeVisible();
    await page.goto("/en/shop");
    await expect(page.getByRole("heading", { level: 2, name: "Acme Labs" })).toBeVisible();
  });

  test("setting a price makes the product orderable", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/products");
    await page.getByRole("row", { name: /Acme Peptide/ }).getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Price (₪)").fill("99");
    await page.getByRole("button", { name: "Save product" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto("/en/products/acme-labs/acme-peptide");
    await expect(page.getByText("₪99").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toBeVisible();
  });

  test("signing out ends the session", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
