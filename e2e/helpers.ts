import { type Page, expect } from "@playwright/test";

export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("networkidle");
}

export async function goToMenu(page: Page) {
  await page.goto("/menu");
  await waitForPageReady(page);
}

export async function clickFirstDish(page: Page) {
  const dishCard = page.locator("a[href^='/menu/']").first();
  await expect(dishCard).toBeVisible();
  await dishCard.click();
  await waitForPageReady(page);
}

export async function addToCart(page: Page) {
  const btn = page.getByRole("button", { name: "点菜" }).first();
  await expect(btn).toBeVisible();
  await btn.click();
}

export async function openCartDrawer(page: Page) {
  const cartBtn = page.locator("[data-testid='cart-trigger'], button:has(svg.lucide-shopping-cart)").first();
  if (await cartBtn.isVisible()) {
    await cartBtn.click();
    await page.waitForTimeout(300);
  }
}
