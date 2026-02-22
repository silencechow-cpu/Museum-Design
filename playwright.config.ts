/**
 * Playwright E2E 测试配置
 * 用于 P0 & P1 端到端测试
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  /* 每个测试的超时时间 */
  timeout: 30 * 1000,
  /* 期望断言的超时时间 */
  expect: {
    timeout: 10 * 1000,
  },
  /* 失败时重试次数（CI 环境建议设为 2） */
  retries: process.env.CI ? 2 : 0,
  /* 并发 worker 数 */
  workers: process.env.CI ? 1 : undefined,
  /* 测试报告格式 */
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    /* 测试目标 URL */
    baseURL: "https://museum-creative-platform-production.up.railway.app",
    /* 截图策略：仅在失败时截图 */
    screenshot: "only-on-failure",
    /* 视频录制：仅在失败时录制 */
    video: "retain-on-failure",
    /* 追踪记录：仅在失败时保留 */
    trace: "retain-on-failure",
    /* 忽略 HTTPS 证书错误 */
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium（桌面端）",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "mobile（移动端）",
      use: {
        ...devices["iPhone 13"],
      },
    },
  ],
});
