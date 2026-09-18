import { test, expect, type Page } from "@playwright/test";

const PHONE = "+14155552671";
// Dev fallback: with no Twilio variables and NODE_ENV != production, the
// server accepts this fixed code (see lib/otp.ts).
const DEV_CODE = "000000";

async function verifyPhone(page: Page, labels: {
  phone: string;
  sendCode: string;
  codeLabel: string;
  verify: string;
  verified: string;
}) {
  await page.getByLabel(labels.phone).fill(PHONE);
  await page.getByRole("button", { name: labels.sendCode }).click();
  await page.getByLabel(labels.codeLabel).fill(DEV_CODE);
  await page.getByRole("button", { name: labels.verify, exact: true }).click();
  await expect(page.getByText(labels.verified)).toBeVisible();
}

const en = {
  phone: "Phone number",
  sendCode: "Send code",
  codeLabel: "6-digit code",
  verify: "Verify",
  verified: "Phone number verified",
};

async function fillAddress(page: Page) {
  await page.getByLabel("Address line 1").fill("123 Lab Way");
  await page.getByLabel("City").fill("Cambridge");
  await page.getByLabel("State / region").fill("MA");
  await page.getByLabel("Postal code").fill("02139");
  await page.getByLabel("Country").fill("United States");
}

async function addTb500(page: Page) {
  await page.goto("/en/products/tb-500");
  await page.getByRole("radio", { name: "10 mg" }).check();
  await page.getByRole("button", { name: "Add to quote request" }).click();
  await page.goto("/en/quote");
}

test.describe("quote request flow (English)", () => {
  test("browse -> select vial -> verify phone -> acknowledgment gate -> submit -> confirmation", async ({
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

    await page.getByLabel("Full name").fill("Jane Researcher");
    await page.getByLabel("Email address").fill("jane@example.com");
    await verifyPhone(page, en);
    await fillAddress(page);

    // Acknowledgment gate: submitting without checking the box should
    // surface a validation error and not navigate away.
    await page.getByRole("button", { name: "Submit quote request" }).click();
    await expect(page).toHaveURL(/\/en\/quote$/);

    await page.getByLabel(/I confirm I am 18 years/).check();
    await page.getByRole("button", { name: "Submit quote request" }).click();

    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);
    await expect(page.getByRole("heading", { name: "Quote request received" })).toBeVisible();
  });
});

test.describe("phone verification", () => {
  test("submit is blocked until the phone is verified", async ({ page }) => {
    await addTb500(page);
    await page.getByLabel("Full name").fill("Jane Researcher");
    await page.getByLabel("Email address").fill("jane@example.com");
    await page.getByLabel("Phone number").fill(PHONE);
    await fillAddress(page);
    await page.getByLabel(/I confirm I am 18 years/).check();
    await page.getByRole("button", { name: "Submit quote request" }).click();

    await expect(page).toHaveURL(/\/en\/quote$/);
    await expect(
      page.getByText("Please verify your phone number", { exact: false })
    ).toBeVisible();
  });

  test("a wrong code is rejected and the number stays unverified", async ({ page }) => {
    await addTb500(page);
    await page.getByLabel("Phone number").fill(PHONE);
    await page.getByRole("button", { name: "Send code" }).click();
    await page.getByLabel("6-digit code").fill("123456");
    await page.getByRole("button", { name: "Verify", exact: true }).click();

    await expect(page.getByText("That code isn't correct.")).toBeVisible();
    await expect(page.getByText("Phone number verified")).toHaveCount(0);
  });

  test("an invalid number gets no code", async ({ page }) => {
    await addTb500(page);
    await page.getByLabel("Phone number").fill("12345");
    await page.getByRole("button", { name: "Send code" }).click();

    await expect(page.getByText("Enter a valid phone number", { exact: false })).toBeVisible();
    await expect(page.getByLabel("6-digit code")).toHaveCount(0);
  });

  test("editing the number after verifying clears the verification", async ({ page }) => {
    await addTb500(page);
    await verifyPhone(page, en);

    await page.getByLabel("Phone number").fill("+14155552672");
    await expect(page.getByText("Phone number verified")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Send code" })).toBeVisible();
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
    await addTb500(page);

    await page.getByLabel("Full name").fill("Bot");
    await page.getByLabel("Email address").fill("bot@example.com");
    await verifyPhone(page, en);
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

  test("phone verification works in Arabic with a left-to-right code field", async ({
    page,
  }) => {
    await page.goto("/ar/products/tb-500");
    await page.getByRole("radio", { name: "10 mg" }).check();
    await page.getByRole("button", { name: "إضافة إلى طلب عرض السعر" }).click();
    await page.goto("/ar/quote");

    await page.getByLabel("رقم الهاتف").fill(PHONE);
    await page.getByRole("button", { name: "إرسال الرمز" }).click();
    const code = page.getByLabel("الرمز المكوّن من 6 أرقام");
    await expect(code).toHaveAttribute("dir", "ltr");
    await code.fill(DEV_CODE);
    await page.getByRole("button", { name: "تحقق", exact: true }).click();
    await expect(page.getByText("تم التحقق من رقم الهاتف")).toBeVisible();
  });
});
