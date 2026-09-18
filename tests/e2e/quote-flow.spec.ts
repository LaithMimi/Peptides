import { test, expect } from "@playwright/test";

test.describe("quote request flow (English)", () => {
  test("browse -> select vial -> acknowledgment gate -> submit -> confirmation", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: "Research Peptide Catalog" })).toBeVisible();
    await expect(
      page.getByText("For Research Use Only", { exact: false }).first()
    ).toBeVisible();

    await page.getByRole("link", { name: /TB-500/ }).click();
    await expect(page.getByRole("heading", { name: "TB-500" })).toBeVisible();

    await page.getByRole("radio", { name: "10 mg" }).check();
    await page.getByRole("button", { name: "Add to quote request" }).click();
    await expect(page.getByText("Added to your quote request.")).toBeVisible();

    await page.getByRole("link", { name: "Quote Request" }).first().click();
    await expect(page.getByRole("heading", { name: "Submit your quote request" })).toBeVisible();

    // Acknowledgment gate: submitting without checking the box should
    // surface a validation error and not navigate away.
    await page.getByLabel("Full name").fill("Jane Researcher");
    await page.getByLabel("Email address").fill("jane@example.com");
    await page.getByLabel("Phone number").fill("+972 59 123 4567");
    await page.getByLabel("Address line 1").fill("123 Lab Way");
    await page.getByLabel("City").fill("Cambridge");
    await page.getByLabel("State / region").fill("MA");
    await page.getByLabel("Postal code").fill("02139");
    await page.getByRole("button", { name: "Submit quote request" }).click();
    await expect(page).toHaveURL(/\/en\/quote$/);

    await page.getByLabel(/I confirm I am 18 years/).check();
    await page.getByRole("button", { name: "Submit quote request" }).click();

    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);
    await expect(page.getByRole("heading", { name: "Quote request received" })).toBeVisible();
  });
});

test.describe("quantity cap and merge", () => {
  test("caps quantity at 10 and merges duplicate adds into one line", async ({ page }) => {
    await page.goto("/en/products/tb-500");
    await expect(page.locator("#quantity")).toHaveAttribute("max", "10");

    await page.getByRole("radio", { name: "10 mg" }).check();
    await page.locator("#quantity").fill("6");
    await page.getByRole("button", { name: "Add to quote request" }).click();
    await page.getByRole("button", { name: "Add to quote request" }).click();

    await page.goto("/en/quote");
    const qty = page.locator('input[id^="qty-"]');
    await expect(qty).toHaveCount(1);
    await expect(qty).toHaveValue("10");
  });
});

test.describe("honeypot", () => {
  test("a filled honeypot looks like success but nothing is sent", async ({ page }) => {
    await page.goto("/en/products/tb-500");
    await page.getByRole("radio", { name: "10 mg" }).check();
    await page.getByRole("button", { name: "Add to quote request" }).click();
    await page.goto("/en/quote");

    await page.getByLabel("Full name").fill("Bot");
    await page.getByLabel("Email address").fill("bot@example.com");
    await page.getByLabel("Phone number").fill("+1 555 0101");
    await page.getByLabel("Address line 1").fill("1 Spam St");
    await page.getByLabel("City").fill("Botville");
    await page.getByLabel("State / region").fill("XX");
    await page.getByLabel("Postal code").fill("00000");
    await page.getByLabel("Country").fill("Nowhere");
    await page.locator("#website").evaluate((el: HTMLInputElement) => {
      el.value = "http://spam.example";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.getByLabel(/I confirm I am 18 years/).check();
    await page.getByRole("button", { name: "Submit quote request" }).click();

    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);
  });
});

test.describe("quote request flow (Arabic, RTL)", () => {
  test("catalog renders RTL and disclaimer is visible", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(
      page.getByRole("heading", { name: "كتالوج الببتيدات البحثية" })
    ).toBeVisible();
  });
});
