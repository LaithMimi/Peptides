import { expect, test } from "@playwright/test";

// Research-purpose picker (US7). Read-only: it never changes catalog data.

const BANNED = /\b(dosage|dose|treat|treatment|cure|therapy|therapeutic|weight loss|lose weight|muscle gain)\b/i;

test.describe("research purpose picker (US7)", () => {
  test("shows research areas with descriptions; choosing one lists only related products", async ({ page }) => {
    await page.goto("/en/start");
    await expect(page.getByRole("heading", { level: 1, name: "Find products by research purpose" })).toBeVisible();
    await expect(page.getByText("For Research Use Only", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Choose one or more research areas above")).toBeVisible();

    const tile = page.getByRole("link", { name: "Select Focus & cognitive research" });
    await expect(tile).toContainText("Laboratory research on attention");
    await tile.click();

    await expect(page).toHaveURL(/purpose=cognitive/);
    await expect(page.getByRole("link", { name: "Remove Focus & cognitive research from your selection" })).toHaveAttribute(
      "aria-current",
      "true"
    );
    await expect(page.getByRole("status")).toContainText("2 products");
    await expect(page.getByRole("link", { name: /Selank/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Semax/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /TB-500/i })).toHaveCount(0);
    // The research focus line is on the card.
    await expect(page.getByText("Focus & cognitive research").nth(1)).toBeVisible();
  });

  test("choosing several areas shows the union once, and a tile can be removed", async ({ page }) => {
    await page.goto("/en/start?purpose=gut,recovery-tissue");
    // BPC-157 belongs to both areas but appears once; KPV, TB-500 and Ipamorelin also match.
    await expect(page.getByRole("status")).toContainText("4 products");
    await expect(page.getByRole("link", { name: /BPC-157/i })).toHaveCount(1);

    await page.getByRole("link", { name: "Remove Gut & gastrointestinal research from your selection" }).click();
    await expect(page).toHaveURL(/purpose=recovery-tissue$/);
    await expect(page.getByRole("status")).toContainText("3 products"); // BPC-157, TB-500, Ipamorelin

    await page.getByRole("link", { name: "Clear selection" }).click();
    await expect(page).toHaveURL(/\/en\/start$/);
    await expect(page.getByText("Choose one or more research areas above")).toBeVisible();
  });

  test("unknown areas in the address are ignored", async ({ page }) => {
    await page.goto("/en/start?purpose=nope");
    await expect(page.getByText("Choose one or more research areas above")).toBeVisible();
  });

  test("the selection survives a language switch and works in Arabic (RTL)", async ({ page }) => {
    await page.goto("/en/start?purpose=cognitive");
    await page.getByRole("button", { name: "AR" }).click();
    await expect(page).toHaveURL(/\/ar\/start\?purpose=cognitive$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1, name: "اعثر على المنتجات حسب الغرض البحثي" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Selank/i }).first()).toBeVisible();
  });

  test("the picker carries no consumer-health, dosage or therapeutic wording", async ({ page }) => {
    for (const path of ["/en/start", "/en/start?purpose=metabolic", "/en/start?purpose=gut"]) {
      await page.goto(path);
      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(BANNED);
    }
  });

  test("the picker is reachable from the home page and the navigation, and fits a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/en");
    await page.getByRole("link", { name: "Choose a research area" }).click();
    await expect(page).toHaveURL(/\/en\/start$/);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
});
