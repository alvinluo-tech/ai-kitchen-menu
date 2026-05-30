import { test, expect } from "@playwright/test";
import { waitForPageReady } from "./helpers";

test.describe("权限守卫", () => {
  test("登录页可访问", async ({ page }) => {
    await page.goto("/login");
    await waitForPageReady(page);

    await expect(page.locator("h1, h2, form")).toBeVisible();
  });

  test("未登录访问管理后台被拒绝或重定向", async ({ page }) => {
    const response = await page.goto("/admin");
    await waitForPageReady(page);

    // 应该被重定向到登录页，或者显示无权限
    const url = page.url();
    const hasLogin = url.includes("/login");
    const hasForbidden = await page.getByText(/无权限|未登录|请登录/).isVisible().catch(() => false);

    expect(hasLogin || hasForbidden).toBe(true);
  });

  test("未登录访问订单管理被拒绝", async ({ page }) => {
    const response = await page.goto("/admin/orders");
    await waitForPageReady(page);

    const url = page.url();
    const hasLogin = url.includes("/login");
    const hasForbidden = await page.getByText(/无权限|未登录|请登录/).isVisible().catch(() => false);

    expect(hasLogin || hasForbidden).toBe(true);
  });
});
