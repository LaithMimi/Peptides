import { expect, test, type Page } from "@playwright/test";

const ADMIN = { email: "admin@example.com", password: "e2e-admin-password-1" };

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

/** Places a cash-on-delivery order for one BPC-157 and returns its order number. */
async function placeOrder(page: Page, name: string): Promise<string> {
  await page.goto("/en/products/pep-lab/bpc-157");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByText("Added to your cart.")).toBeVisible();
  await page.goto("/en/checkout");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Phone number").fill("050 123 4567");
  await page.getByLabel("Delivery area and address").fill("12 Main Street, Jerusalem");
  await page.getByLabel(/I confirm I am 18/).check();
  await page.getByRole("button", { name: "Confirm order" }).click();
  await expect(page).toHaveURL(/\/en\/order\/PC-\d+\?t=/);
  return page.url().match(/PC-\d+/)![0];
}

test.describe.configure({ mode: "serial" });

test.describe("admin orders, settings and pages (US5)", () => {
  let orderNumber: string;

  test("a submitted order appears in admin with full details and moves through the statuses", async ({ page }) => {
    orderNumber = await placeOrder(page, "Layla Haddad");

    await signIn(page);
    await expect(page.getByText("New orders")).toBeVisible();

    await page.goto("/admin/orders");
    const row = page.getByRole("row", { name: new RegExp(orderNumber) });
    await expect(row).toContainText("Layla Haddad");
    await expect(row).toContainText("New");
    await row.getByRole("link", { name: orderNumber }).click();

    await expect(page.getByRole("heading", { name: new RegExp(orderNumber) })).toBeVisible();
    await expect(page.getByText("+972501234567")).toBeVisible();
    await expect(page.getByText("12 Main Street, Jerusalem")).toBeVisible();
    await expect(page.getByText("Cash on delivery")).toBeVisible();
    await expect(page.getByText("BPC-157").first()).toBeVisible();
    await expect(page.getByText("₪250").first()).toBeVisible();

    await page.getByRole("button", { name: "Mark processing" }).click();
    await expect(page.getByText("Processing").first()).toBeVisible();
    await page.getByRole("button", { name: "Mark out for delivery" }).click();
    await expect(page.getByText("Out for delivery").first()).toBeVisible();
    await page.getByRole("button", { name: "Mark completed" }).click();
    await expect(page.getByText("can no longer change")).toBeVisible();

    // The list can be filtered by status.
    await page.goto("/admin/orders?status=completed");
    await expect(page.getByRole("row", { name: new RegExp(orderNumber) })).toBeVisible();
    await page.goto("/admin/orders?status=new");
    await expect(page.getByRole("row", { name: new RegExp(orderNumber) })).toHaveCount(0);
  });

  test("a delivery fee applies to new orders only", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/settings");
    await page.getByLabel("Delivery fee (₪)").fill("30");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto("/en/products/pep-lab/bpc-157");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.goto("/en/cart");
    await expect(page.getByText("₪30").first()).toBeVisible();
    await expect(page.getByText("₪280").first()).toBeVisible(); // 250 + 30

    // The earlier order keeps its free delivery.
    await page.goto("/admin/orders");
    await page.getByRole("row", { name: new RegExp(orderNumber) }).getByRole("link").click();
    await expect(page.getByText("Free").first()).toBeVisible();

    // Restore free delivery for the remaining specs.
    await page.goto("/admin/settings");
    await page.getByLabel("Delivery fee (₪)").fill("");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
  });

  test("editing a legal page in both languages shows on the storefront", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/pages/terms");
    await page.getByLabel("Text (English)").fill("## Using the store\n\nEnglish approved terms.");
    await page.getByLabel("Text (Arabic)").fill("## استخدام المتجر\n\nشروط معتمدة بالعربية.");
    await page.getByRole("button", { name: "Save page" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto("/en/legal/terms");
    await expect(page.getByRole("heading", { name: "Using the store" })).toBeVisible();
    await expect(page.getByText("English approved terms.")).toBeVisible();
    await page.goto("/ar/legal/terms");
    await expect(page.getByText("شروط معتمدة بالعربية.")).toBeVisible();

    // Markup in the text is never rendered.
    await page.goto("/admin/pages/about");
    await page.getByLabel("Text (English)").fill("Hello <script>window.__pwned = 1</script><b>bold</b>");
    await page.getByRole("button", { name: "Save page" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
    await page.goto("/en/about");
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    await expect(page.locator("main b")).toHaveCount(0);
  });

  test("a missing page is a friendly not-found, and a language can be removed from the switcher", async ({ page }) => {
    const missing = await page.goto("/en/legal/not-a-page");
    expect(missing?.status()).toBe(404);

    await signIn(page);
    await page.goto("/admin/settings");
    await page.getByLabel("Arabic", { exact: true }).uncheck();
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
    await page.goto("/en");
    await expect(page.getByRole("group", { name: "Language" })).toHaveCount(0);

    await page.goto("/admin/settings");
    await page.getByLabel("Arabic", { exact: true }).check();
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
    await page.goto("/en");
    await expect(page.getByRole("group", { name: "Language" })).toBeVisible();
  });

  test("the bare address opens the store in the default language", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });
});
