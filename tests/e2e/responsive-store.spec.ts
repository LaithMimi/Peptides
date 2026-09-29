import { expect, test, type Page } from "@playwright/test";

// Mobile-first: every page of the purchase journey, in both languages, must
// fit a 375px phone without horizontal scrolling, and its main controls must
// be comfortably tappable. The e2e seed prices BPC-157 (see lib/db/seed.ts).

test.use({ viewport: { width: 375, height: 800 } });

const LOCALES = ["en", "ar"] as const;

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
}

async function tapTargetsOk(page: Page) {
  const small = await page.evaluate(() => {
    const selector = 'main button, main select, main input:not([type="checkbox"]):not([type="hidden"]), main textarea';
    return Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ name: el.textContent?.trim() || el.getAttribute("name") || el.tagName, h: el.getBoundingClientRect().height }))
      .filter((c) => c.h < 44);
  });
  expect(small).toEqual([]);
}

for (const locale of LOCALES) {
  test.describe(`${locale} journey at 375px`, () => {
    const pages = ["", "/shop", "/brands", "/categories/cognitive", "/products/pep-lab/bpc-157", "/contact"];

    for (const path of pages) {
      test(`no horizontal overflow and tappable controls: /${locale}${path}`, async ({ page }) => {
        await page.goto(`/${locale}${path}`);
        await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        await noOverflow(page);
        await tapTargetsOk(page);
      });
    }

    test("cart, checkout and confirmation fit the screen", async ({ page }) => {
      await page.goto(`/${locale}/products/pep-lab/bpc-157`);
      await page.locator("main button").filter({ hasText: locale === "ar" ? "أضف إلى السلة" : "Add to cart" }).click();

      await page.goto(`/${locale}/cart`);
      await expect(page.locator("main li").first()).toBeVisible();
      await noOverflow(page);
      await tapTargetsOk(page);

      await page.goto(`/${locale}/checkout`);
      await expect(page.locator("form")).toBeVisible();
      await noOverflow(page);
      await tapTargetsOk(page);

      await page.locator("#customerName").fill("Sara Khalil");
      await page.locator("#customerPhone").fill("050 123 4567");
      await page.locator("#deliveryAddress").fill("12 Main Street, Jerusalem");
      await page.locator('input[name="acknowledged"]').check();
      await page.locator('form button[type="submit"]').click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/order/PC-\\d+\\?t=`));
      await noOverflow(page);
    });

    test("mobile menu opens and lists the main sections", async ({ page }) => {
      await page.goto(`/${locale}`);
      const toggle = page.locator("button[aria-controls='mobile-menu']");
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      const menu = page.locator("#mobile-menu");
      await expect(menu.getByRole("link")).toHaveCount(5);
      await noOverflow(page);
    });
  });
}
