import { expect, test, type Page } from "@playwright/test";

// The e2e seed prices BPC-157 at ₪250 and GHK-Cu at ₪180.50 (see lib/db/seed.ts).

async function addToCart(page: Page, slug: string, times = 1) {
  await page.goto(`/en/products/pep-lab/${slug}`);
  for (let i = 1; i < times; i++) {
    await page.getByRole("button", { name: /Increase quantity/ }).click();
  }
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByText("Added to your cart.")).toBeVisible();
}

async function fillDetails(page: Page) {
  await page.getByLabel("Full name").fill("Sara Khalil");
  await page.getByLabel("Phone number").fill("050 123 4567");
  await page.getByLabel("Delivery area and address").fill("12 Main Street, Jerusalem");
}

test.describe("cash-on-delivery order (US2)", () => {
  test("add to cart, change quantity, remove, order, confirmation", async ({ page }) => {
    await addToCart(page, "bpc-157");
    await addToCart(page, "ghk-cu");

    await page.goto("/en/cart");
    await expect(page.getByRole("link", { name: "BPC-157" })).toBeVisible();
    await expect(page.getByRole("link", { name: "GHK-Cu" })).toBeVisible();
    await expect(page.getByText("₪430.50").first()).toBeVisible(); // 250 + 180.50

    // Increase BPC-157 to 2: totals update immediately.
    await page.getByRole("button", { name: "Increase quantity of BPC-157" }).click();
    await expect(page.getByText("₪680.50").first()).toBeVisible(); // 500 + 180.50

    // Remove GHK-Cu.
    await page.getByRole("button", { name: "Remove GHK-Cu from cart" }).click();
    await expect(page.getByRole("link", { name: "GHK-Cu" })).toHaveCount(0);
    await expect(page.getByText("₪500").first()).toBeVisible();
    await expect(page.getByText("Free").first()).toBeVisible();

    await page.getByRole("link", { name: "Proceed to checkout" }).click();
    await expect(page).toHaveURL(/\/en\/checkout$/);
    await expect(page.getByText("Payment: cash on delivery")).toBeVisible();

    // The acknowledgment is required and the missing fields are reported in words.
    await page.getByRole("button", { name: "Confirm order" }).click();
    await expect(page.getByText("This field is required.").first()).toBeVisible();
    await expect(page.getByText("You must confirm this before placing your order.")).toBeVisible();

    await fillDetails(page);
    await page.getByLabel(/I confirm I am 18/).check();
    await page.getByRole("button", { name: "Confirm order" }).click();

    await expect(page).toHaveURL(/\/en\/order\/PC-\d+\?t=/);
    await expect(page.getByRole("heading", { name: "Order received" })).toBeVisible();
    await expect(page.getByText("Cash on delivery").first()).toBeVisible();
    await expect(page.getByText("₪500").first()).toBeVisible();
    await expect(page.getByText("For Research Use Only", { exact: false }).first()).toBeVisible();

    // The cart is emptied after the order.
    await page.goto("/en/cart");
    await expect(page.getByText("Your cart is empty").first()).toBeVisible();
  });

  test("totals are always the server's, even if the browser cart is tampered with", async ({ page }) => {
    await page.goto("/en/products/pep-lab/bpc-157");
    const productId = await page.locator("[data-product-id]").first().getAttribute("data-product-id");
    await page.evaluate((id) => {
      window.localStorage.setItem(
        "peptides:cart",
        JSON.stringify([{ productId: id, quantity: 3, unitPriceMinor: 1, priceMinor: 1, totalMinor: 1 }])
      );
    }, productId);

    await page.goto("/en/checkout");
    await expect(page.getByText("₪750").first()).toBeVisible(); // 3 x 250, not ₪0.01
    await fillDetails(page);
    await page.getByLabel(/I confirm I am 18/).check();
    await page.getByRole("button", { name: "Confirm order" }).click();
    await expect(page).toHaveURL(/\/en\/order\/PC-\d+\?t=/);
    await expect(page.getByText("₪750").first()).toBeVisible();
  });

  test("checkout is blocked for a cart item that no longer exists", async ({ page }) => {
    await page.goto("/en/");
    await page.evaluate(() => {
      window.localStorage.setItem(
        "peptides:cart",
        JSON.stringify([{ productId: "00000000-0000-4000-8000-000000000000", quantity: 1 }])
      );
    });
    await page.goto("/en/cart");
    await expect(page.getByText("Some items can't be ordered online")).toBeVisible();
    await expect(page.getByRole("button", { name: "Proceed to checkout" })).toBeDisabled();
  });

  test("an order link without its secret token shows nothing", async ({ page }) => {
    const response = await page.goto("/en/order/PC-100000");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This product is unavailable" })).toBeVisible();
  });

  test("an empty cart cannot be checked out", async ({ page }) => {
    await page.goto("/en/checkout");
    await expect(page.getByRole("heading", { name: "Your cart is empty" }).first()).toBeVisible();
  });

  test("checkout works in Arabic (RTL)", async ({ page }) => {
    await page.goto("/ar/products/pep-lab/bpc-157");
    await page.getByRole("button", { name: "أضف إلى السلة" }).click();
    await page.goto("/ar/checkout");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByText("الدفع: نقدًا عند الاستلام")).toBeVisible();
  });
});
