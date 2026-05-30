import { test, expect } from "@playwright/test";
import { waitForPageReady, goToMenu, clickFirstDish, addToCart } from "./helpers";

test.describe("点菜下单流程", () => {
  test.beforeEach(async ({ page }) => {
    // 清空 localStorage 中的购物车
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("cart");
      localStorage.removeItem("order-history");
    });
  });

  test("从菜品详情页加入购物车", async ({ page }) => {
    await goToMenu(page);
    await clickFirstDish(page);
    await addToCart(page);

    // 点击后应显示"已添加"
    await expect(page.getByText("已添加")).toBeVisible();
  });

  test("订单页可访问", async ({ page }) => {
    await page.goto("/order");
    await waitForPageReady(page);

    // 空购物车应显示"还没有点菜"
    await expect(page.getByText("还没有点菜")).toBeVisible();
  });

  test("加入购物车后订单页显示菜品", async ({ page }) => {
    await goToMenu(page);
    await clickFirstDish(page);
    await addToCart(page);

    // 等待状态保存
    await page.waitForTimeout(500);

    // 使用客户端导航到订单页
    await page.goto("/order");
    await waitForPageReady(page);

    // 应显示确认点单页面
    await expect(page.locator("h1")).toContainText("确认点单");
    // 应有已点菜品
    await expect(page.getByText("已点菜品")).toBeVisible();
  });

  test("订单历史页可访问", async ({ page }) => {
    await page.goto("/order/history");
    await waitForPageReady(page);

    await expect(page.locator("h1")).toContainText("点单记录");
  });
});
