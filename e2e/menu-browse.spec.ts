import { test, expect } from "@playwright/test";
import { waitForPageReady, goToMenu, clickFirstDish } from "./helpers";

test.describe("浏览菜单", () => {
  test("首页显示菜品推荐和导航按钮", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    await expect(page.locator("h1")).toContainText("今天想吃什么");
    await expect(page.getByRole("link", { name: /浏览全部菜单/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /让 AI 帮我推荐/ })).toBeVisible();
  });

  test("菜单页显示菜品列表", async ({ page }) => {
    await goToMenu(page);

    await expect(page.locator("h1")).toContainText("全部菜单");
    const dishCards = page.locator("a[href^='/menu/']");
    await expect(dishCards.first()).toBeVisible();
  });

  test("点击菜品进入详情页", async ({ page }) => {
    await goToMenu(page);
    await clickFirstDish(page);

    // 详情页应有菜品名称
    await expect(page.locator("h1")).toBeVisible();
    // 应有点菜按钮（详情页有多个，取第一个）
    await expect(page.getByRole("button", { name: /点菜/ }).first()).toBeVisible();
  });

  test("菜品详情页显示完整信息", async ({ page }) => {
    await goToMenu(page);
    await clickFirstDish(page);

    // 检查详情页关键元素
    await expect(page.locator("h1")).toBeVisible();
    // 应有返回按钮
    await expect(page.getByRole("button", { name: /返回/ })).toBeVisible();
  });
});
