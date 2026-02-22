/**
 * P1-A 自动化测试：导航栏角色专属菜单（服务端逻辑层）
 *
 * 测试目标：
 *   1. auth.me 返回正确的 role 字段，供前端渲染角色标签和菜单
 *   2. auth.checkOnboardingStatus 对不同角色返回正确的 needsOnboarding 和 userType
 *   3. 已入驻博物馆用户 needsOnboarding=false，userType='museum'
 *   4. 已入驻设计师用户 needsOnboarding=false，userType='designer'
 *   5. 未入驻用户 needsOnboarding=true，userType=null
 *
 * 架构说明：
 *   checkOnboardingStatus 依赖 getMuseumByUserId / getDesignerByUserId 查询数据库。
 *   测试环境无数据库，故通过 vi.mock 对 db 模块进行 mock，隔离外部依赖。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// ─── Mock 数据库模块 ──────────────────────────────────────────────────────────
// 必须在 import appRouter 之前声明，确保 mock 在模块加载时生效

vi.mock("./db", async (importOriginal) => {
  const original = await importOriginal<typeof import("./db")>();
  return {
    ...original,
    // 默认返回 undefined（未入驻）
    getMuseumByUserId: vi.fn().mockResolvedValue(undefined),
    getDesignerByUserId: vi.fn().mockResolvedValue(undefined),
    createMuseum: vi.fn().mockResolvedValue({ id: 1, userId: 1, name: "Mock Museum" }),
    createDesigner: vi.fn().mockResolvedValue({ id: 1, userId: 1, displayName: "Mock Designer" }),
    getDb: vi.fn().mockResolvedValue(undefined),
  };
});

// mock 必须在最顶层，appRouter 在 mock 之后引入
import { appRouter } from "./routers";
import * as db from "./db";

// ─── 辅助函数 ────────────────────────────────────────────────────────────────

const randomBase = Math.floor(Math.random() * 900000) + 100000;

function createCtx(role: "user" | "museum" | "designer" | "admin", userId: number): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-openid-${role}-${userId}`,
      name: `Test ${role}`,
      email: `${role}-${userId}@test.com`,
      passwordHash: null,
      authProvider: "manus",
      emailVerified: 1,
      avatar: null,
      loginMethod: "manus",
      role,
      socialAccounts: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ─── P1-A 测试套件 ────────────────────────────────────────────────────────────

describe("P1-A：导航栏角色专属菜单（服务端数据层）", () => {

  beforeEach(() => {
    // 每个测试前重置 mock，默认返回 undefined（未入驻）
    vi.mocked(db.getMuseumByUserId).mockResolvedValue(undefined);
    vi.mocked(db.getDesignerByUserId).mockResolvedValue(undefined);
  });

  // ── auth.me 角色字段验证 ────────────────────────────────────────────────────
  // auth.me 直接返回 ctx.user，不依赖数据库，无需 mock

  describe("auth.me 返回正确的 role 字段", () => {
    const cases: Array<{ role: "user" | "museum" | "designer" | "admin"; userId: number }> = [
      { role: "museum",   userId: randomBase },
      { role: "designer", userId: randomBase + 1 },
      { role: "admin",    userId: randomBase + 2 },
      { role: "user",     userId: randomBase + 3 },
    ];

    for (const { role, userId } of cases) {
      it(`角色 '${role}' 的 auth.me 应返回 role='${role}'`, async () => {
        const caller = appRouter.createCaller(createCtx(role, userId));
        const me = await caller.auth.me();
        expect(me).not.toBeNull();
        expect(me?.role).toBe(role);
      });
    }
  });

  // ── auth.me 返回完整用户对象 ────────────────────────────────────────────────

  describe("auth.me 返回完整用户对象", () => {
    it("应包含 id、name、role、openId 字段", async () => {
      const userId = randomBase + 10;
      const caller = appRouter.createCaller(createCtx("museum", userId));
      const me = await caller.auth.me();
      expect(me).toMatchObject({
        id: userId,
        name: "Test museum",
        role: "museum",
        openId: `test-openid-museum-${userId}`,
      });
    });

    it("未认证时 auth.me 应返回 null", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);
      const me = await caller.auth.me();
      expect(me).toBeNull();
    });
  });

  // ── auth.checkOnboardingStatus：未入驻用户 ─────────────────────────────────

  describe("auth.checkOnboardingStatus：未入驻用户", () => {
    it("无 museums/designers 记录时 needsOnboarding=true，userType=null", async () => {
      // mock 默认已返回 undefined，无需额外设置
      const caller = appRouter.createCaller(createCtx("user", randomBase + 20));
      const status = await caller.auth.checkOnboardingStatus();
      expect(status.needsOnboarding).toBe(true);
      expect(status.userType).toBeNull();
    });
  });

  // ── auth.checkOnboardingStatus：已入驻博物馆用户 ───────────────────────────

  describe("auth.checkOnboardingStatus：已入驻博物馆用户", () => {
    it("getMuseumByUserId 返回记录时 needsOnboarding=false，userType='museum'", async () => {
      // 模拟数据库中存在 museum 记录
      vi.mocked(db.getMuseumByUserId).mockResolvedValue({
        id: 1,
        userId: randomBase + 30,
        name: "故宫博物院",
        description: null,
        address: null,
        logo: null,
        coverImage: null,
        contactEmail: null,
        contactPhone: null,
        website: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const caller = appRouter.createCaller(createCtx("museum", randomBase + 30));
      const status = await caller.auth.checkOnboardingStatus();

      expect(status.needsOnboarding).toBe(false);
      expect(status.userType).toBe("museum");
    });
  });

  // ── auth.checkOnboardingStatus：已入驻设计师用户 ───────────────────────────

  describe("auth.checkOnboardingStatus：已入驻设计师用户", () => {
    it("getDesignerByUserId 返回记录时 needsOnboarding=false，userType='designer'", async () => {
      // 模拟数据库中存在 designer 记录
      vi.mocked(db.getDesignerByUserId).mockResolvedValue({
        id: 1,
        userId: randomBase + 40,
        displayName: "林晓雨",
        bio: null,
        avatar: null,
        type: "individual",
        organization: null,
        portfolio: null,
        skills: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const caller = appRouter.createCaller(createCtx("designer", randomBase + 40));
      const status = await caller.auth.checkOnboardingStatus();

      expect(status.needsOnboarding).toBe(false);
      expect(status.userType).toBe("designer");
    });
  });

  // ── auth.checkOnboardingStatus：返回值结构 ─────────────────────────────────

  describe("auth.checkOnboardingStatus：返回值结构", () => {
    it("返回值应包含 needsOnboarding 和 userType 两个字段", async () => {
      const caller = appRouter.createCaller(createCtx("user", randomBase + 50));
      const status = await caller.auth.checkOnboardingStatus();
      expect(status).toHaveProperty("needsOnboarding");
      expect(status).toHaveProperty("userType");
    });

    it("needsOnboarding 应为 boolean 类型", async () => {
      const caller = appRouter.createCaller(createCtx("user", randomBase + 51));
      const status = await caller.auth.checkOnboardingStatus();
      expect(typeof status.needsOnboarding).toBe("boolean");
    });

    it("userType 的值应为 'museum'、'designer' 或 null 之一", async () => {
      const caller = appRouter.createCaller(createCtx("user", randomBase + 52));
      const status = await caller.auth.checkOnboardingStatus();
      expect(["museum", "designer", null]).toContain(status.userType);
    });
  });
});
