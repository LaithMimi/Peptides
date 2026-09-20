import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

// Responsive checks for the sign-in step and the quote page, in both locales,
// from a 320px phone to a 1920px desktop. Dev fallback OTP code: see lib/otp.ts.
const PHONE = "+14155552671";
const DEV_CODE = "000000";
const WIDTHS = [320, 375, 768, 1280, 1920];
const SHOTS = "test-results/screenshots/responsive";

interface Report {
  pageOverflow: boolean;
  overflowing: string[];
  smallTargets: string[];
  smallInputText: string[];
}

async function measure(page: Page): Promise<Report> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(
        (el as HTMLElement).innerText ||
        el.getAttribute("aria-label") ||
        ""
      )
        .trim()
        .slice(0, 30)}"`;
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== "hidden" &&
        s.display !== "none" &&
        !el.closest("[aria-hidden='true']") &&
        !el.closest(".sr-only")
      );
    };

    const overflowing: string[] = [];
    for (const el of document.querySelectorAll("main *")) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) overflowing.push(describe(el));
    }

    const smallTargets: string[] = [];
    const targets = document.querySelectorAll(
      "main button, main a, main input:not([type=hidden]), main textarea, main select"
    );
    for (const el of targets) {
      if (!visible(el)) continue;
      // A checkbox is operated through its wrapping label.
      const box =
        el instanceof HTMLInputElement && el.type === "checkbox"
          ? (el.closest("label") ?? el)
          : el;
      const r = box.getBoundingClientRect();
      const inline = getComputedStyle(box).display === "inline";
      if (!inline && r.height < 43.5) {
        smallTargets.push(`${describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }

    const smallInputText: string[] = [];
    for (const el of document.querySelectorAll("main input, main textarea")) {
      if (!visible(el)) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 16 && (el as HTMLInputElement).type !== "checkbox") {
        smallInputText.push(`${describe(el)} ${size}px`);
      }
    }

    return {
      pageOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      overflowing,
      smallTargets,
      smallInputText,
    };
  });
}

async function addTb500(page: Page) {
  await page.goto("/en/products/tb-500");
  await page.getByRole("radio", { name: "10 mg" }).check();
  await page.getByRole("button", { name: "Add to quote request" }).click();
}

async function signInEn(page: Page) {
  await page.goto("/en/signin");
  await page.getByLabel("Phone number").fill(PHONE);
  await page.getByRole("button", { name: "Send code" }).click();
  await page.getByLabel("6-digit code").fill(DEV_CODE);
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await expect(page).toHaveURL(/\/en(\/quote)?$/);
}

function expectClean(report: Report, label: string) {
  expect(report.pageOverflow, `${label}: page scrolls horizontally`).toBe(false);
  expect(report.overflowing, `${label}: elements outside the viewport`).toEqual([]);
  expect(report.smallTargets, `${label}: targets under 44px tall`).toEqual([]);
}

test.describe("sign-in and quote page responsiveness", () => {
  // First hits compile routes on demand in the dev server.
  test.setTimeout(90_000);

  test.beforeAll(() => mkdirSync(SHOTS, { recursive: true }));

  for (const locale of ["en", "ar"] as const) {
    for (const width of WIDTHS) {
      test(`/${locale}/signin at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await addTb500(page);
        await page.goto(`/${locale}/signin`);
        const phoneId = page.locator("#signInPhone");
        await expect(phoneId).toBeVisible({ timeout: 30_000 });
        // Second step (code entry) is the widest state of this page.
        await phoneId.fill(PHONE);
        await page.locator("button", { hasText: /Send code|إرسال الرمز/ }).click();
        await expect(page.locator("#phoneCode")).toBeVisible();

        const report = await measure(page);
        await page.screenshot({
          path: `${SHOTS}/${locale}-signin-${width}.png`,
          fullPage: true,
        });
        expectClean(report, `${locale} signin ${width}`);
        if (width <= 768) {
          expect(report.smallInputText, "inputs under 16px zoom on iOS").toEqual([]);
        }
      });

      test(`/${locale}/quote (signed out and signed in) at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await addTb500(page);

        await page.goto(`/${locale}/quote`);
        await expect(page.locator("#customerName")).toBeVisible({ timeout: 30_000 });
        const signedOut = await measure(page);
        await page.screenshot({
          path: `${SHOTS}/${locale}-quote-signedout-${width}.png`,
          fullPage: true,
        });
        expectClean(signedOut, `${locale} quote signed-out ${width}`);
        if (width <= 768) {
          expect(signedOut.smallInputText, "inputs under 16px zoom on iOS").toEqual([]);
        }

        await signInEn(page);
        await page.goto(`/${locale}/quote`);
        await expect(page.getByRole("button", { name: /Sign out|تسجيل الخروج/ })).toBeVisible();
        // Long values must wrap inside the card, not push it wider.
        await page.locator("#shippingAddress").fill(
          "Building 12, Very Long Street Name Al-Rasheed District, Amman, Jordan 11181"
        );
        await page.locator("#notes").fill("x".repeat(120));
        const signedIn = await measure(page);
        await page.screenshot({
          path: `${SHOTS}/${locale}-quote-signedin-${width}.png`,
          fullPage: true,
        });
        expectClean(signedIn, `${locale} quote signed-in ${width}`);
      });
    }
  }
});
