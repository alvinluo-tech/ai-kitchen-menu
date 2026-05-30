import { test, expect } from "@playwright/test";
import { waitForPageReady } from "./helpers";

test.describe("导航", () => {
  test("首页导航栏包含关键链接", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    // 检查导航栏存在
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("从首页导航到菜单页", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    await page.getByRole("link", { name: /浏览全部菜单/ }).click();
    await waitForPageReady(page);

    await expect(page).toHaveURL(/\/menu/);
    await expect(page.locator("h1")).toContainText("全部菜单");
  });

  test("厨师风采页可访问", async ({ page }) => {
    await page.goto("/chefs");
    await waitForPageReady(page);

    await expect(page.locator("h1")).toContainText("厨师");
  });

  test("转盘页可访问", async ({ page }) => {
    await page.goto("/plate");
    await waitForPageReady(page);

    await expect(page.locator("h1")).toBeVisible();
  });
});
