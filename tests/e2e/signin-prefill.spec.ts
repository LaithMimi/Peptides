import { test, expect, type Page } from "@playwright/test";

const PHONE = "+14155552671";
const PHONE_2 = "+14155552672";
// Dev fallback: with no Twilio variables and NODE_ENV != production, the
// server accepts this fixed code (see lib/otp.ts).
const DEV_CODE = "000000";
const ACK = /I confirm I am 18 years/;

async function addTb500(page: Page) {
  await page.goto("/en/products/tb-500");
  await page.getByRole("radio", { name: "10 mg" }).check();
  await page.getByRole("button", { name: "Add to quote request" }).click();
  await page.goto("/en/quote");
}

async function fillDetails(page: Page, name = "Jane Researcher") {
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email address").fill("jane@example.com");
  await page.getByLabel("Shipping address").fill("123 Lab Way, Cambridge, United States");
}

async function verifyOnSignIn(page: Page, phone = PHONE) {
  await page.getByLabel("Phone number").fill(phone);
  await page.getByRole("button", { name: "Send code" }).click();
  await page.getByLabel("6-digit code").fill(DEV_CODE);
  await page.getByRole("button", { name: "Verify", exact: true }).click();
}

async function submit(page: Page) {
  await page.getByRole("button", { name: "Submit quote request" }).click();
}

/** Sign in via the real Submit -> /signin flow, ending back on /quote. */
async function signInThroughSubmit(page: Page, phone = PHONE) {
  await addTb500(page);
  await fillDetails(page);
  await page.getByLabel(ACK).check();
  await submit(page);
  await expect(page).toHaveURL(/\/en\/signin$/);
  await verifyOnSignIn(page, phone);
  await expect(page).toHaveURL(/\/en\/quote$/);
}

test.describe("sign in when submitting", () => {
  test("submit goes to sign-in, then back with cart and typed values kept", async ({
    page,
  }) => {
    await addTb500(page);
    await fillDetails(page);
    await page.getByLabel("Notes").fill("Please call after 5pm");
    await page.getByLabel(ACK).check();
    await submit(page);

    await expect(page).toHaveURL(/\/en\/signin$/);
    await verifyOnSignIn(page);
    await expect(page).toHaveURL(/\/en\/quote$/);

    await expect(page.getByText("TB-500").first()).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveValue("Jane Researcher");
    await expect(page.getByLabel("Email address")).toHaveValue("jane@example.com");
    await expect(page.getByLabel("Shipping address")).toHaveValue("123 Lab Way, Cambridge, United States");
    await expect(page.getByLabel("Notes")).toHaveValue("Please call after 5pm");
    // Acknowledgment is never carried over.
    await expect(page.getByLabel(ACK)).not.toBeChecked();
    await expect(page.getByText(PHONE)).toBeVisible();
  });

  test("a signed-in visitor submits without another verification", async ({ page }) => {
    await signInThroughSubmit(page);
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);

    // A second quote goes straight through: no /signin in between.
    await addTb500(page);
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);
  });

  test("visiting /signin while signed in redirects to the quote page", async ({ page }) => {
    await signInThroughSubmit(page);
    await page.goto("/en/signin");
    await expect(page).toHaveURL(/\/en\/quote$/);
  });

  test("an expired or removed session sends the visitor back to sign in, values kept", async ({
    page,
    context,
  }) => {
    await signInThroughSubmit(page);
    await context.clearCookies({ name: "pepclub_session" });

    await page.getByLabel("Full name").fill("Jane Q Researcher");
    await page.getByLabel(ACK).check();
    await submit(page);

    await expect(page).toHaveURL(/\/en\/signin$/);
    await verifyOnSignIn(page);
    await expect(page).toHaveURL(/\/en\/quote$/);
    await expect(page.getByLabel("Full name")).toHaveValue("Jane Q Researcher");
  });
});

test.describe("remembered details", () => {
  test("a second quote is prefilled; edits become the new remembered details", async ({
    page,
  }) => {
    await signInThroughSubmit(page);
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);

    await addTb500(page);
    await expect(page.getByLabel("Full name")).toHaveValue("Jane Researcher");
    await expect(page.getByLabel("Email address")).toHaveValue("jane@example.com");
    await expect(page.getByLabel("Shipping address")).toHaveValue("123 Lab Way, Cambridge, United States");
    await expect(page.getByLabel("Notes")).toHaveValue("");
    await expect(page.getByLabel(ACK)).not.toBeChecked();

    await page.getByLabel("Shipping address").fill("9 New St, Boston, United States");
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);

    await addTb500(page);
    await expect(page.getByLabel("Shipping address")).toHaveValue("9 New St, Boston, United States");
  });

  test("a signed-out visitor never sees remembered details", async ({ page }) => {
    await signInThroughSubmit(page);
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);

    await page.context().clearCookies({ name: "pepclub_session" });
    await addTb500(page);
    await expect(page.getByLabel("Full name")).toHaveValue("");
    await expect(page.getByLabel("Shipping address")).toHaveValue("");
  });
});

test.describe("sign out and clear details", () => {
  test("Clear my details empties the form but keeps the visitor signed in", async ({
    page,
  }) => {
    await signInThroughSubmit(page);
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);

    await addTb500(page);
    await expect(page.getByLabel("Full name")).toHaveValue("Jane Researcher");
    await page.getByRole("button", { name: "Clear my details" }).click();
    await expect(page.getByLabel("Full name")).toHaveValue("");
    await expect(page.getByText(PHONE)).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Full name")).toHaveValue("");
    await expect(page.getByText(PHONE)).toBeVisible();
  });

  test("Sign out ends the session, wipes details, keeps the cart", async ({
    page,
    context,
  }) => {
    await signInThroughSubmit(page);
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);

    await addTb500(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(0);
    await expect(page.getByLabel("Full name")).toHaveValue("");
    await expect(page.getByText("TB-500").first()).toBeVisible();

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "pepclub_session")).toBeUndefined();
    const profile = await page.evaluate(() =>
      window.localStorage.getItem("pepclub.profile")
    );
    expect(profile).toBeNull();

    await fillDetails(page);
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/signin$/);
  });

  test("a different number does not inherit the previous number's details", async ({
    page,
  }) => {
    await signInThroughSubmit(page, PHONE);
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/quote\/confirmation$/);

    // Same browser, session for a different number: the stored profile
    // belongs to the first number, so it must not prefill.
    await page.context().clearCookies({ name: "pepclub_session" });
    await addTb500(page);
    await fillDetails(page, "Someone Else");
    await page.getByLabel(ACK).check();
    await submit(page);
    await expect(page).toHaveURL(/\/en\/signin$/);
    await verifyOnSignIn(page, PHONE_2);
    await expect(page).toHaveURL(/\/en\/quote$/);
    // Draft (typed values) is kept, and nothing from the first profile
    // overrides it.
    await expect(page.getByLabel("Full name")).toHaveValue("Someone Else");

    await page.getByRole("button", { name: "Clear my details" }).click();
    await page.reload();
    await expect(page.getByLabel("Full name")).toHaveValue("");
  });
});
