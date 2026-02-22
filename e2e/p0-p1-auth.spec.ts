/**
 * P0 & P1 端到端测试（Playwright E2E）
 *
 * 运行前提：
 *   1. 已安装 Playwright：pnpm add -D @playwright/test && npx playwright install chromium
 *   2. 平台已部署并可访问：https://museum-creative-platform-production.up.railway.app
 *   3. 测试账号已在数据库中存在（见 TEST_ACCOUNTS 配置）
 *
 * 运行命令：
 *   npx playwright test e2e/p0-p1-auth.spec.ts --headed
 *
 * 注意：
 *   由于使用 Manus OAuth，E2E 测试通过直接操作 Cookie 和 sessionStorage 模拟登录态，
 *   无需真实走 OAuth 流程。
 */

import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// ─── 配置 ─────────────────────────────────────────────────────────────────────

const BASE_URL = "https://museum-creative-platform-production.up.railway.app";

/**
 * 测试账号配置
 * 这些账号对应数据库 seed 数据中预置的用户
 * 由于使用 OAuth，E2E 测试通过注入 localStorage 模拟已登录状态
 */
const TEST_ACCOUNTS = {
  museum: {
    userId: 1,
    openId: "demo_museum_001",
    name: "故宫博物院",
    role: "museum" as const,
    email: null,
  },
  designer: {
    userId: 6,
    openId: "demo_designer_001",
    name: "林晓雨",
    role: "designer" as const,
    email: null,
  },
  admin: {
    userId: 999,
    openId: "demo_admin_001",
    name: "管理员",
    role: "admin" as const,
    email: "admin@test.com",
  },
  newUser: {
    userId: 88888,
    openId: "demo_new_user_001",
    name: "新用户",
    role: "user" as const,
    email: null,
  },
};

// ─── 辅助函数 ─────────────────────────────────────────────────────────────────

/**
 * 通过注入 localStorage 模拟用户登录态
 * 利用 useAuth hook 中 `localStorage.setItem('manus-runtime-user-info', ...)` 的机制
 */
async function mockLogin(page: Page, account: typeof TEST_ACCOUNTS[keyof typeof TEST_ACCOUNTS]) {
  await page.goto(BASE_URL);
  await page.evaluate((user) => {
    localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));
  }, account);
  await page.reload();
  // 等待导航栏渲染完成
  await page.waitForLoadState("networkidle");
}

/**
 * 清除登录态
 */
async function mockLogout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem("manus-runtime-user-info");
    sessionStorage.clear();
  });
}

// ─── P0：退出登录状态清理 ─────────────────────────────────────────────────────

test.describe("P0：退出登录状态清理", () => {

  test("P0-1：桌面端退出后导航栏显示登录按钮，无整页刷新", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.museum);

    // 验证已登录状态
    await expect(page.locator("text=故宫博物院").first()).toBeVisible({ timeout: 5000 });

    // 监听页面导航事件（整页刷新会触发 navigation）
    let hardRefreshOccurred = false;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        hardRefreshOccurred = true;
      }
    });

    // 点击用户名下拉菜单
    await page.locator("button").filter({ hasText: "故宫博物院" }).first().click();

    // 等待下拉菜单出现
    await expect(page.locator("text=退出登录").first()).toBeVisible({ timeout: 3000 });

    // 重置标志（打开菜单可能触发一次 navigation）
    hardRefreshOccurred = false;

    // 点击退出登录
    await page.locator("text=退出登录").first().click();

    // 等待跳转完成
    await page.waitForURL(BASE_URL + "/", { timeout: 5000 });

    // 验证：导航栏显示"登录"按钮
    await expect(page.locator("text=登录").first()).toBeVisible({ timeout: 5000 });

    // 验证：无整页刷新（软跳转）
    expect(hardRefreshOccurred).toBe(false);
  });

  test("P0-2：移动端退出后导航栏显示登录按钮", async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 812 });
    await mockLogin(page, TEST_ACCOUNTS.designer);

    // 点击汉堡菜单
    await page.locator("button[aria-label='菜单'], button.hamburger, button").filter({
      has: page.locator("svg"),
    }).last().click();

    // 等待移动端菜单展开
    await page.waitForTimeout(500);

    // 点击退出登录
    await page.locator("text=退出登录").last().click();

    // 等待跳转完成
    await page.waitForURL(BASE_URL + "/", { timeout: 5000 });

    // 验证：显示登录按钮
    await expect(page.locator("text=登录").first()).toBeVisible({ timeout: 5000 });
  });

  test("P0-3：退出后 localStorage 中用户信息被清除", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.museum);

    // 执行退出
    await page.locator("button").filter({ hasText: "故宫博物院" }).first().click();
    await page.locator("text=退出登录").first().click();
    await page.waitForURL(BASE_URL + "/", { timeout: 5000 });

    // 验证 localStorage 中用户信息已清除
    const userInfo = await page.evaluate(() =>
      localStorage.getItem("manus-runtime-user-info")
    );
    expect(userInfo === null || userInfo === "null").toBe(true);
  });

  test("P0-4：退出后访问首页不会自动跳转到登录页", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.museum);

    // 退出
    await page.locator("button").filter({ hasText: "故宫博物院" }).first().click();
    await page.locator("text=退出登录").first().click();
    await page.waitForURL(BASE_URL + "/", { timeout: 5000 });

    // 首页是公开页面，不应跳转到登录页
    await expect(page).toHaveURL(BASE_URL + "/");
    await expect(page.locator("text=登录").first()).toBeVisible();
  });
});

// ─── P1-A：导航栏角色专属下拉菜单 ────────────────────────────────────────────

test.describe("P1-A：导航栏角色专属下拉菜单", () => {

  test("P1-A-1：博物馆角色显示'博物馆'标签和专属菜单项", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.museum);

    // 点击用户名下拉菜单
    await page.locator("button").filter({ hasText: "故宫博物院" }).first().click();

    // 验证角色标签
    await expect(page.locator("text=博物馆").first()).toBeVisible({ timeout: 3000 });

    // 验证专属菜单项
    await expect(page.locator("text=发布征集").first()).toBeVisible();
    await expect(page.locator("text=我的征集").first()).toBeVisible();

    // 验证不含设计师专属项
    await expect(page.locator("text=我的作品")).not.toBeVisible();
  });

  test("P1-A-2：设计师角色显示'设计师'标签和专属菜单项", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.designer);

    // 点击用户名下拉菜单
    await page.locator("button").filter({ hasText: "林晓雨" }).first().click();

    // 验证角色标签
    await expect(page.locator("text=设计师").first()).toBeVisible({ timeout: 3000 });

    // 验证专属菜单项
    await expect(page.locator("text=我的作品").first()).toBeVisible();

    // 验证不含博物馆专属项
    await expect(page.locator("text=发布征集")).not.toBeVisible();
  });

  test("P1-A-3：管理员角色显示'管理员'标签和审核管理入口", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.admin);

    // 点击用户名下拉菜单
    await page.locator("button").filter({ hasText: "管理员" }).first().click();

    // 验证角色标签
    await expect(page.locator("text=管理员").first()).toBeVisible({ timeout: 3000 });

    // 验证专属菜单项
    await expect(page.locator("text=审核管理").first()).toBeVisible();
  });

  test("P1-A-4：未入驻用户显示'完善资料'入口，无角色标签", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.newUser);

    // 点击用户名下拉菜单
    await page.locator("button").filter({ hasText: "新用户" }).first().click();

    // 验证有完善资料入口
    await expect(page.locator("text=完善资料").first()).toBeVisible({ timeout: 3000 });

    // 验证无角色标签（博物馆/设计师/管理员标签均不显示）
    await expect(page.locator(".role-badge, [data-role-badge]")).not.toBeVisible();
  });

  test("P1-A-5：博物馆'我的征集'快捷入口可正常跳转", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.museum);

    // 打开下拉菜单
    await page.locator("button").filter({ hasText: "故宫博物院" }).first().click();

    // 点击我的征集
    await page.locator("text=我的征集").first().click();

    // 验证跳转到个人中心
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/profile`), { timeout: 5000 });
  });

  test("P1-A-6：设计师'我的作品'快捷入口可正常跳转", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.designer);

    // 打开下拉菜单
    await page.locator("button").filter({ hasText: "林晓雨" }).first().click();

    // 点击我的作品
    await page.locator("text=我的作品").first().click();

    // 验证跳转到个人中心
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/profile`), { timeout: 5000 });
  });

  test("P1-A-7：未入驻用户'完善资料'入口跳转到 /onboarding", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.newUser);

    // 打开下拉菜单
    await page.locator("button").filter({ hasText: "新用户" }).first().click();

    // 点击完善资料
    await page.locator("text=完善资料").first().click();

    // 验证跳转到 onboarding 页面
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/onboarding`), { timeout: 5000 });
  });
});

// ─── P1-B：role 参数传递与 Onboarding 自动预选 ───────────────────────────────

test.describe("P1-B：role 参数传递与 Onboarding 自动预选", () => {

  test("TC-P1B-01：访问 /login?role=museum 应将 'museum' 写入 sessionStorage", async ({ page }) => {
    await page.goto(`${BASE_URL}/login?role=museum`);
    await page.waitForLoadState("networkidle");

    const value = await page.evaluate(() => sessionStorage.getItem("preselected_role"));
    expect(value).toBe("museum");
  });

  test("TC-P1B-02：访问 /login?role=designer 应将 'designer' 写入 sessionStorage", async ({ page }) => {
    await page.goto(`${BASE_URL}/login?role=designer`);
    await page.waitForLoadState("networkidle");

    const value = await page.evaluate(() => sessionStorage.getItem("preselected_role"));
    expect(value).toBe("designer");
  });

  test("TC-P1B-03：访问 /login（无 role 参数）不应写入 sessionStorage", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");

    const value = await page.evaluate(() => sessionStorage.getItem("preselected_role"));
    expect(value).toBeNull();
  });

  test("TC-P1B-04：访问 /login?role=admin（非法值）不应写入 sessionStorage", async ({ page }) => {
    await page.goto(`${BASE_URL}/login?role=admin`);
    await page.waitForLoadState("networkidle");

    const value = await page.evaluate(() => sessionStorage.getItem("preselected_role"));
    expect(value).toBeNull();
  });

  test("TC-P1B-05：Onboarding 页面读取 museum 预选后直接显示博物馆表单", async ({ page }) => {
    // 先注入 sessionStorage，再访问 onboarding 页面
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      sessionStorage.setItem("preselected_role", "museum");
    });

    // 模拟已登录的新用户（需要 onboarding）
    await mockLogin(page, TEST_ACCOUNTS.newUser);
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState("networkidle");

    // 验证：直接显示博物馆表单（不显示角色选择界面）
    // 博物馆表单包含"博物馆名称"输入框
    await expect(page.locator("input[placeholder*='博物馆名称'], input[name='name']").first())
      .toBeVisible({ timeout: 5000 });

    // 验证：sessionStorage 已被清除
    const value = await page.evaluate(() => sessionStorage.getItem("preselected_role"));
    expect(value).toBeNull();
  });

  test("TC-P1B-06：Onboarding 页面读取 designer 预选后直接显示设计师表单", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      sessionStorage.setItem("preselected_role", "designer");
    });

    await mockLogin(page, TEST_ACCOUNTS.newUser);
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState("networkidle");

    // 验证：直接显示设计师表单
    await expect(page.locator("input[placeholder*='设计师名称'], input[placeholder*='昵称'], input[name='displayName']").first())
      .toBeVisible({ timeout: 5000 });

    // 验证：sessionStorage 已被清除
    const value = await page.evaluate(() => sessionStorage.getItem("preselected_role"));
    expect(value).toBeNull();
  });

  test("TC-P1B-07：无预选角色时 Onboarding 显示角色选择界面", async ({ page }) => {
    await mockLogin(page, TEST_ACCOUNTS.newUser);
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState("networkidle");

    // 验证：显示角色选择界面（包含博物馆和设计师两个选项）
    await expect(page.locator("text=博物馆").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=设计师").first()).toBeVisible({ timeout: 5000 });
  });

  test("TC-P1B-08：刷新 Onboarding 页面不会重复触发预选（幂等性）", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      sessionStorage.setItem("preselected_role", "museum");
    });

    await mockLogin(page, TEST_ACCOUNTS.newUser);
    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState("networkidle");

    // 第一次：sessionStorage 被清除，显示博物馆表单
    const valueAfterFirst = await page.evaluate(() => sessionStorage.getItem("preselected_role"));
    expect(valueAfterFirst).toBeNull();

    // 刷新页面
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 第二次：应显示角色选择界面（因为 sessionStorage 已清除）
    await expect(page.locator("text=博物馆").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=设计师").first()).toBeVisible({ timeout: 5000 });
  });

  test("TC-P1B-09：Login 页面博物馆欢迎横幅在 role=museum 时正确显示", async ({ page }) => {
    await page.goto(`${BASE_URL}/login?role=museum`);
    await page.waitForLoadState("networkidle");

    // 验证博物馆欢迎横幅可见
    await expect(
      page.locator("text=博物馆").or(page.locator("text=入驻")).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("TC-P1B-10：Login 页面设计师欢迎横幅在 role=designer 时正确显示", async ({ page }) => {
    await page.goto(`${BASE_URL}/login?role=designer`);
    await page.waitForLoadState("networkidle");

    // 验证设计师欢迎横幅可见
    await expect(
      page.locator("text=设计师").or(page.locator("text=入驻")).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
