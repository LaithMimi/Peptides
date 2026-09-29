import { expect, test, type Page } from "@playwright/test";

const ADMIN = { email: "admin@example.com", password: "e2e-admin-password-1" };
const PRODUCT = "/en/products/pep-lab/tb-500"; // unpriced in the e2e seed

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

test.describe.configure({ mode: "serial" });

test.describe("unpriced products and WhatsApp (US4)", () => {
  test("ask-about-price mode: message, WhatsApp link with number and product, no Add to Cart", async ({ page }) => {
    await page.goto(PRODUCT);
    await expect(page.getByText("Price unavailable")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add to cart" })).toHaveCount(0);

    const ask = page.getByRole("link", { name: "Ask about price" });
    await expect(ask).toBeVisible();
    const href = (await ask.getAttribute("href"))!;
    expect(href.startsWith("https://wa.me/972587114119?text=")).toBe(true);
    expect(new URL(href).searchParams.get("text")).toBe("Hi, I would like to know the price of TB-500.");

    // Arabic: the prefilled message is in Arabic and names the product.
    await page.goto("/ar/products/pep-lab/tb-500");
    const askAr = page.getByRole("link", { name: "اسأل عن السعر" });
    const text = new URL((await askAr.getAttribute("href"))!).searchParams.get("text");
    expect(text).toContain("TB-500");
    expect(text).toContain("مرحبًا");
  });

  test("the general WhatsApp button is in the footer and on the contact page", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.locator('main a[href="https://wa.me/972587114119"]')).toBeVisible();
    await expect(page.locator('footer a[href="https://wa.me/972587114119"]')).toBeVisible();
  });

  test("admin switches to hide-price mode and the storefront follows without a code change", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/settings");
    await page.getByLabel("Unpriced products").selectOption("hide_price");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto(PRODUCT);
    await expect(page.getByText("Price unavailable")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ask about price" })).toHaveCount(0);
    const contact = page.getByRole("link", { name: "Contact the store" });
    await expect(contact).toBeVisible();
    expect(await contact.getAttribute("href")).toContain("https://wa.me/972587114119?text=");
    await expect(page.getByRole("button", { name: "Add to cart" })).toHaveCount(0);

    // Cards show no price text at all for unpriced products.
    await page.goto("/en/shop");
    await expect(page.getByText("Price unavailable")).toHaveCount(0);
  });

  test("with no WhatsApp number, WhatsApp buttons disappear and a contact link remains", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/settings");
    await page.getByLabel("WhatsApp number").fill("");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    await page.goto(PRODUCT);
    await expect(page.locator('a[href^="https://wa.me/"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Contact the store" })).toHaveAttribute("href", /\/en\/contact$/);
    await page.goto("/en/contact");
    await expect(page.locator('a[href^="https://wa.me/"]')).toHaveCount(0);

    // Restore the seeded state for any later spec.
    await page.goto("/admin/settings");
    await page.getByLabel("WhatsApp number").fill("972587114119");
    await page.getByLabel("Unpriced products").selectOption("ask_price");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
  });

  test("a priced product still shows Add to Cart", async ({ page }) => {
    await page.goto("/en/products/pep-lab/bpc-157");
    await expect(page.getByRole("button", { name: "Add to cart" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ask about price" })).toHaveCount(0);
  });
});
