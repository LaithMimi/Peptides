import { test, expect } from "@playwright/test";

const routes = [
  { path: "/en", name: "en-catalog" },
  { path: "/ar", name: "ar-catalog" },
  { path: "/en/products/tb-500", name: "en-product" },
  { path: "/ar/products/tb-500", name: "ar-product" },
];

test.use({ viewport: { width: 375, height: 800 } });

for (const { path, name } of routes) {
  test(`no horizontal overflow at 375px — ${name}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
    await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  });
}

test("quote page has no horizontal overflow at 375px with items in cart", async ({ page }) => {
  await page.goto("/en/products/tb-500");
  await page.getByRole("radio", { name: "10 mg" }).check();
  await page.getByRole("button", { name: "Add to quote request" }).click();
  await page.goto("/en/quote");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
  await page.screenshot({ path: "test-results/screenshots/en-quote.png", fullPage: true });
});
