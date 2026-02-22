/**
 * P0 自动化测试：退出登录状态清理
 *
 * 测试目标：
 *   1. auth.logout 正确清除服务端 Cookie
 *   2. 返回 { success: true }
 *   3. Cookie 清除参数符合安全规范（maxAge=-1, secure, httpOnly, sameSite=none）
 *   4. 未登录状态下调用 logout 不抛出异常
 *   5. auth.me 在 Cookie 清除后返回 null
 */
import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── 辅助函数 ────────────────────────────────────────────────────────────────

type CookieCall = { name: string; options: Record<string, unknown> };

function createAuthenticatedContext(role: "user" | "museum" | "designer" | "admin" = "user"): {
  ctx: TrpcContext;
  clearedCookies: CookieCall[];
} {
  const clearedCookies: CookieCall[] = [];
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: `test-openid-${role}`,
      name: `Test ${role} User`,
      email: `test-${role}@example.com`,
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
    req: {
      protocol: "https",
      headers: { host: "museum-creative-platform-production.up.railway.app" },
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function createUnauthenticatedContext(): {
  ctx: TrpcContext;
  clearedCookies: CookieCall[];
} {
  const clearedCookies: CookieCall[] = [];
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: { host: "museum-creative-platform-production.up.railway.app" },
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

// ─── P0 测试套件 ──────────────────────────────────────────────────────────────

describe("P0：退出登录状态清理", () => {

  // ── P0-1：基础退出功能 ──────────────────────────────────────────────────────

  describe("P0-1：已登录用户退出", () => {
    it("应返回 { success: true }", async () => {
      const { ctx } = createAuthenticatedContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
    });

    it("应清除且仅清除一个 Cookie", async () => {
      const { ctx, clearedCookies } = createAuthenticatedContext("user");
      const caller = appRouter.createCaller(ctx);

      await caller.auth.logout();

      expect(clearedCookies).toHaveLength(1);
    });

    it("应清除名称正确的 Cookie（COOKIE_NAME 常量）", async () => {
      const { ctx, clearedCookies } = createAuthenticatedContext("user");
      const caller = appRouter.createCaller(ctx);

      await caller.auth.logout();

      expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    });
  });

  // ── P0-2：Cookie 安全属性验证 ───────────────────────────────────────────────

  describe("P0-2：Cookie 清除参数安全规范", () => {
    let clearedCookies: CookieCall[];

    beforeEach(async () => {
      const result = createAuthenticatedContext("user");
      clearedCookies = result.clearedCookies;
      const caller = appRouter.createCaller(result.ctx);
      await caller.auth.logout();
    });

    it("maxAge 应为 -1（立即过期）", () => {
      expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
    });

    it("应设置 httpOnly=true（防 XSS）", () => {
      expect(clearedCookies[0]?.options).toMatchObject({ httpOnly: true });
    });

    it("应设置 secure=true（仅 HTTPS）", () => {
      expect(clearedCookies[0]?.options).toMatchObject({ secure: true });
    });

    it("应设置 sameSite='none'（跨域 Cookie 策略）", () => {
      expect(clearedCookies[0]?.options).toMatchObject({ sameSite: "none" });
    });

    it("应设置 path='/'（全站生效）", () => {
      expect(clearedCookies[0]?.options).toMatchObject({ path: "/" });
    });
  });

  // ── P0-3：不同角色退出均有效 ────────────────────────────────────────────────

  describe("P0-3：不同角色退出均应清除 Cookie", () => {
    const roles = ["user", "museum", "designer", "admin"] as const;

    for (const role of roles) {
      it(`角色 '${role}' 退出应清除 Cookie`, async () => {
        const { ctx, clearedCookies } = createAuthenticatedContext(role);
        const caller = appRouter.createCaller(ctx);

        await caller.auth.logout();

        expect(clearedCookies).toHaveLength(1);
        expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
      });
    }
  });

  // ── P0-4：未登录状态下调用 logout ───────────────────────────────────────────

  describe("P0-4：未登录状态下调用 logout", () => {
    it("应不抛出异常（publicProcedure 无需鉴权）", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.auth.logout()).resolves.not.toThrow();
    });

    it("应仍然清除 Cookie（幂等性）", async () => {
      const { ctx, clearedCookies } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      await caller.auth.logout();

      expect(clearedCookies).toHaveLength(1);
      expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    });
  });

  // ── P0-5：auth.me 在无 Cookie 上下文中返回 null ─────────────────────────────

  describe("P0-5：auth.me 未认证时返回 null", () => {
    it("未登录上下文中 auth.me 应返回 null", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const me = await caller.auth.me();

      expect(me).toBeNull();
    });

    it("已登录上下文中 auth.me 应返回用户对象", async () => {
      const { ctx } = createAuthenticatedContext("museum");
      const caller = appRouter.createCaller(ctx);

      const me = await caller.auth.me();

      expect(me).not.toBeNull();
      expect(me?.role).toBe("museum");
      expect(me?.openId).toBe("test-openid-museum");
    });
  });
});
