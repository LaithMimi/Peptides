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
    await page.getByLabel("Country").fill("United States");
    await page.getByRole("button", { name: "Submit quote request" }).click();
    await expect(page).toHaveURL(/\/en\/quote$/);

    await page.getByLabel(/I confirm I am 18 years/).check();
    await page.getByRole("button", { name: "Submit quote request" }).click();

    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);
    await expect(page.getByRole("heading", { name: "Quote request received" })).toBeVisible();
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
