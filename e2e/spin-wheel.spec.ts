import { test, expect } from "@playwright/test";
import { waitForPageReady } from "./helpers";

test.describe("转盘", () => {
  test("转盘页正常加载", async ({ page }) => {
    await page.goto("/plate");
    await waitForPageReady(page);

    await expect(page.locator("h1")).toBeVisible();
  });

  test("转盘页有操作按钮", async ({ page }) => {
    await page.goto("/plate");
    await waitForPageReady(page);

    // 应该有转盘相关的按钮
    const buttons = page.getByRole("button");
    await expect(buttons.first()).toBeVisible();
  });
});
