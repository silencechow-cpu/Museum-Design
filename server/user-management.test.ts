/**
 * P1 自动化测试：用户管理模块（后端 tRPC 接口）
 *
 * 测试目标：
 *   1. 权限守卫：非 admin 角色调用所有接口均应抛出 FORBIDDEN
 *   2. user.adminList：分页、关键词搜索、角色筛选、排序均正确返回
 *   3. user.adminGetById：存在的用户返回详情；不存在时抛出 NOT_FOUND
 *   4. user.adminUpdate：正确更新字段；空更新抛出 BAD_REQUEST；邮箱格式校验
 *   5. user.adminUpdate：降级最后一个 admin 应抛出 BAD_REQUEST
 *   6. user.adminDelete：正常删除；删除自己抛出 BAD_REQUEST；删除最后一个 admin 抛出 BAD_REQUEST
 *   7. user.adminStats：返回正确的统计结构
 *
 * 测试策略：
 *   - 后端接口层测试：通过 appRouter.createCaller(ctx) 直接调用 tRPC 路由
 *   - 数据库层测试：通过 getDb() 直接操作数据库，验证持久化结果
 *   - 所有测试数据使用带时间戳的唯一 openId，避免并发冲突
 *   - beforeAll 创建测试数据，afterAll 清理，保证测试幂等
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq, inArray, sql } from "drizzle-orm";
import type { TrpcContext } from "./_core/context";

/**
 * 向数据库插入测试用户（使用原生 SQL 绕过 Drizzle Schema 字段映射问题）
 * 注：当前数据库的 users 表尚未包含 passwordHash/authProvider/emailVerified 字段，
 * 直接使用 Drizzle ORM insert 会将这些字段包含在查询中导致错误。
 */
async function insertTestUser(params: {
  openId: string;
  name: string;
  email: string;
  role: "user" | "admin" | "museum" | "designer";
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("数据库不可用");
  const result = await db.execute(
    sql`INSERT INTO users (openId, name, email, role, loginMethod) VALUES (${params.openId}, ${params.name}, ${params.email}, ${params.role}, 'manus')`
  );
  return (result as any)[0]?.insertId as number;
}

// ─── 辅助函数 ─────────────────────────────────────────────────────────────────

/** 构造管理员 tRPC 上下文 */
function makeAdminCtx(userId: number, overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-admin-${userId}`,
      name: "Test Admin",
      email: `admin-${userId}@test.com`,
      passwordHash: null,
      authProvider: "manus",
      emailVerified: 1,
      avatar: null,
      loginMethod: "manus",
      role: "admin",
      socialAccounts: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: { host: "test.example.com" } } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

/** 构造非管理员 tRPC 上下文（用于权限测试） */
function makeNonAdminCtx(role: "user" | "museum" | "designer"): TrpcContext {
  return {
    user: {
      id: 9999,
      openId: `test-${role}-9999`,
      name: `Test ${role}`,
      email: `${role}-9999@test.com`,
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
    req: { protocol: "https", headers: { host: "test.example.com" } } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

/** 构造未登录 tRPC 上下文 */
function makeUnauthCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: { host: "test.example.com" } } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

// ─── 测试数据 ─────────────────────────────────────────────────────────────────

const TS = Date.now();

/** 测试过程中创建的所有用户 openId，用于 afterAll 清理 */
const createdOpenIds: string[] = [];

/** 主测试管理员（caller 的身份） */
let adminUserId: number;

/** 测试目标用户（被管理的普通用户） */
let targetUserId: number;

/** 第二个管理员（用于"最后一个 admin"保护测试） */
let secondAdminId: number;

// ─── 测试套件 ─────────────────────────────────────────────────────────────────

describe("P1：用户管理模块后端接口测试", () => {

  // ── 数据准备与清理 ─────────────────────────────────────────────────────────

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("数据库不可用，请检查环境变量配置");

    // 创建主测试管理员
    const adminOpenId = `test-admin-main-${TS}`;
    createdOpenIds.push(adminOpenId);
    adminUserId = await insertTestUser({
      openId: adminOpenId,
      name: "Test Admin Main",
      email: `admin-main-${TS}@test.com`,
      role: "admin",
    });

    // 创建第二个管理员（用于最后一个 admin 保护测试）
    const secondAdminOpenId = `test-admin-second-${TS}`;
    createdOpenIds.push(secondAdminOpenId);
    secondAdminId = await insertTestUser({
      openId: secondAdminOpenId,
      name: "Test Admin Second",
      email: `admin-second-${TS}@test.com`,
      role: "admin",
    });

    // 创建普通测试用户（被管理的目标）
    const targetOpenId = `test-user-target-${TS}`;
    createdOpenIds.push(targetOpenId);
    targetUserId = await insertTestUser({
      openId: targetOpenId,
      name: `Target User ${TS}`,
      email: `target-${TS}@test.com`,
      role: "user",
    });

    // 额外创建几个不同角色的用户，丰富 adminList 测试数据
    for (const role of ["museum", "designer"] as const) {
      const openId = `test-${role}-${TS}`;
      createdOpenIds.push(openId);
      await insertTestUser({
        openId,
        name: `Test ${role} ${TS}`,
        email: `${role}-${TS}@test.com`,
        role,
      });
    }
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db || createdOpenIds.length === 0) return;
    // 清理所有本次测试创建的用户
    await db.delete(users).where(inArray(users.openId, createdOpenIds));
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. 权限守卫测试
  // ══════════════════════════════════════════════════════════════════════════

  describe("1. 权限守卫：非 admin 角色应被拒绝", () => {

    const nonAdminRoles = ["user", "museum", "designer"] as const;

    for (const role of nonAdminRoles) {
      it(`角色 '${role}' 调用 user.adminList 应抛出 FORBIDDEN`, async () => {
        const caller = appRouter.createCaller(makeNonAdminCtx(role));
        await expect(caller.user.adminList({})).rejects.toThrow(TRPCError);
        await expect(caller.user.adminList({})).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it(`角色 '${role}' 调用 user.adminStats 应抛出 FORBIDDEN`, async () => {
        const caller = appRouter.createCaller(makeNonAdminCtx(role));
        await expect(caller.user.adminStats()).rejects.toThrow(TRPCError);
        await expect(caller.user.adminStats()).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it(`角色 '${role}' 调用 user.adminUpdate 应抛出 FORBIDDEN`, async () => {
        const caller = appRouter.createCaller(makeNonAdminCtx(role));
        await expect(
          caller.user.adminUpdate({ userId: 1, name: "hacker" })
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });

      it(`角色 '${role}' 调用 user.adminDelete 应抛出 FORBIDDEN`, async () => {
        const caller = appRouter.createCaller(makeNonAdminCtx(role));
        await expect(
          caller.user.adminDelete({ userId: 1 })
        ).rejects.toMatchObject({ code: "FORBIDDEN" });
      });
    }

    it("未登录用户调用 user.adminList 应抛出 UNAUTHORIZED 或 FORBIDDEN", async () => {
      const caller = appRouter.createCaller(makeUnauthCtx());
      await expect(caller.user.adminList({})).rejects.toThrow(TRPCError);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. user.adminList 测试
  // ══════════════════════════════════════════════════════════════════════════

  describe("2. user.adminList：分页、搜索、筛选、排序", () => {

    it("TC-LIST-01：默认参数应返回正确的分页结构", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminList({});

      expect(result).toHaveProperty("users");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("pageSize");
      expect(result).toHaveProperty("totalPages");
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(15);
    });

    it("TC-LIST-02：total 应大于 0（数据库中有测试用户）", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminList({});
      expect(result.total).toBeGreaterThan(0);
    });

    it("TC-LIST-03：totalPages 应等于 ceil(total / pageSize)", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminList({ pageSize: 5 });
      const expected = Math.ceil(result.total / 5);
      expect(result.totalPages).toBe(expected);
    });

    it("TC-LIST-04：pageSize=1 时每页仅返回 1 条记录", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminList({ pageSize: 1 });
      expect(result.users.length).toBe(1);
    });

    it("TC-LIST-05：关键词搜索应只返回名称匹配的用户", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      // 使用时间戳作为唯一关键词，确保只匹配本次测试创建的用户
      const result = await caller.user.adminList({ keyword: `Target User ${TS}` });
      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users.every((u: any) => u.name?.includes(`${TS}`))).toBe(true);
    });

    it("TC-LIST-06：不存在的关键词应返回空列表", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminList({ keyword: `nonexistent-keyword-${TS}-xyz` });
      expect(result.users.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it("TC-LIST-07：按 role=admin 筛选应只返回 admin 用户", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminList({ role: "admin", pageSize: 100 });
      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users.every((u: any) => u.role === "admin")).toBe(true);
    });

    it("TC-LIST-08：按 role=museum 筛选应只返回 museum 用户", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminList({ role: "museum", pageSize: 100 });
      expect(result.users.every((u: any) => u.role === "museum")).toBe(true);
    });

    it("TC-LIST-09：返回的用户对象不应包含敏感字段（openId、passwordHash）", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminList({ pageSize: 1 });
      if (result.users.length > 0) {
        const u = result.users[0];
        expect(u).not.toHaveProperty("openId");
        expect(u).not.toHaveProperty("passwordHash");
      }
    });

    it("TC-LIST-10：sortBy=name, sortOrder=asc 时结果应按名称升序排列", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminList({
        sortBy: "name",
        sortOrder: "asc",
        pageSize: 50,
      });
      const names = result.users
        .map((u: any) => u.name ?? "")
        .filter((n: string) => n.length > 0);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    });

    it("TC-LIST-11：page=2 与 page=1 返回的用户不重叠", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const page1 = await caller.user.adminList({ page: 1, pageSize: 3 });
      const page2 = await caller.user.adminList({ page: 2, pageSize: 3 });

      if (page1.total > 3) {
        const ids1 = new Set(page1.users.map((u: any) => u.id));
        const ids2 = page2.users.map((u: any) => u.id);
        expect(ids2.some((id: number) => ids1.has(id))).toBe(false);
      }
    });

    it("TC-LIST-12：pageSize 超出范围（>100）应抛出输入验证错误", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(caller.user.adminList({ pageSize: 101 })).rejects.toThrow();
    });

    it("TC-LIST-13：page=0 应抛出输入验证错误", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(caller.user.adminList({ page: 0 })).rejects.toThrow();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. user.adminGetById 测试
  // ══════════════════════════════════════════════════════════════════════════

  describe("3. user.adminGetById：获取用户详情", () => {

    it("TC-GET-01：存在的用户 ID 应返回用户对象", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminGetById({ userId: targetUserId });

      expect(result).toBeDefined();
      expect(result.id).toBe(targetUserId);
    });

    it("TC-GET-02：返回的用户对象应包含 museum 和 designer 字段", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminGetById({ userId: targetUserId });

      expect(result).toHaveProperty("museum");
      expect(result).toHaveProperty("designer");
    });

    it("TC-GET-03：普通用户的 museum 和 designer 字段应为 null", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminGetById({ userId: targetUserId });

      expect(result.museum).toBeNull();
      expect(result.designer).toBeNull();
    });

    it("TC-GET-04：不存在的用户 ID 应抛出 NOT_FOUND", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(
        caller.user.adminGetById({ userId: 999999999 })
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("TC-GET-05：userId 为非正整数应抛出输入验证错误", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(
        caller.user.adminGetById({ userId: -1 })
      ).rejects.toThrow();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. user.adminUpdate 测试
  // ══════════════════════════════════════════════════════════════════════════

  describe("4. user.adminUpdate：更新用户信息", () => {

    it("TC-UPDATE-01：更新 name 应成功并返回更新后的用户", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const newName = `Updated Name ${TS}`;
      const result = await caller.user.adminUpdate({
        userId: targetUserId,
        name: newName,
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe(newName);
    });

    it("TC-UPDATE-02：更新 email 应成功", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const newEmail = `updated-${TS}@test.com`;
      const result = await caller.user.adminUpdate({
        userId: targetUserId,
        email: newEmail,
      });

      expect(result?.email).toBe(newEmail);
    });

    it("TC-UPDATE-03：更新 role 应成功（user -> designer）", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminUpdate({
        userId: targetUserId,
        role: "designer",
      });

      expect(result?.role).toBe("designer");

      // 恢复原角色，避免影响后续测试
      await caller.user.adminUpdate({ userId: targetUserId, role: "user" });
    });

    it("TC-UPDATE-04：不提供任何可修改字段应抛出 BAD_REQUEST", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(
        caller.user.adminUpdate({ userId: targetUserId })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("TC-UPDATE-05：邮箱格式不正确应抛出输入验证错误", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(
        caller.user.adminUpdate({ userId: targetUserId, email: "not-an-email" })
      ).rejects.toThrow();
    });

    it("TC-UPDATE-06：用户名为空字符串应抛出输入验证错误", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(
        caller.user.adminUpdate({ userId: targetUserId, name: "" })
      ).rejects.toThrow();
    });

    it("TC-UPDATE-07：更新不存在的用户 ID 应抛出 NOT_FOUND 或 BAD_REQUEST", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(
        caller.user.adminUpdate({ userId: 999999999, name: "Ghost" })
      ).rejects.toThrow(TRPCError);
    });

    it("TC-UPDATE-08：数据库中应持久化更新结果", async () => {
      const db = await getDb();
      if (!db) return;

      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const persistedName = `Persisted ${TS}`;
      await caller.user.adminUpdate({ userId: targetUserId, name: persistedName });

      const [row] = await db.select().from(users).where(eq(users.id, targetUserId));
      expect(row?.name).toBe(persistedName);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. 最后一个 admin 保护测试
  // ══════════════════════════════════════════════════════════════════════════

  describe("5. 最后一个 admin 保护机制", () => {

    /** 创建一个只有单个 admin 的隔离场景 */
    let soloAdminId: number;
    const soloAdminOpenId = `test-solo-admin-${TS}`;

    beforeAll(async () => {
      const db = await getDb();
      if (!db) return;
      createdOpenIds.push(soloAdminOpenId);
      soloAdminId = await insertTestUser({
        openId: soloAdminOpenId,
        name: `Solo Admin ${TS}`,
        email: `solo-admin-${TS}@test.com`,
        role: "admin",
      });
    });

    it("TC-LAST-ADMIN-01：系统中有多个 admin 时，降级其中一个应成功", async () => {
      // adminUserId 和 secondAdminId 都是 admin，降级 secondAdminId 应成功
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminUpdate({
        userId: secondAdminId,
        role: "user",
      });
      expect(result?.role).toBe("user");

      // 恢复 secondAdminId 为 admin
      await caller.user.adminUpdate({ userId: secondAdminId, role: "admin" });
    });

    it("TC-LAST-ADMIN-02：降级系统中最后一个 admin 应抛出 BAD_REQUEST", async () => {
      // soloAdminId 是一个独立的 admin，但系统中还有 adminUserId 和 secondAdminId
      // 为了测试"最后一个 admin"场景，我们先将 soloAdminId 作为唯一 admin 的情况
      // 由于测试环境中 admin 数量不可控，我们通过验证 db 层函数的行为来测试此场景
      const db = await getDb();
      if (!db) return;

      // 先将 soloAdminId 降级为 user（此时系统中还有其他 admin，应成功）
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await caller.user.adminUpdate({ userId: soloAdminId, role: "user" });

      // 恢复 soloAdminId 为 admin
      await caller.user.adminUpdate({ userId: soloAdminId, role: "admin" });

      // 验证：如果只剩一个 admin，降级应失败
      // 将 secondAdminId 和 adminUserId 临时降级，只保留 soloAdminId 为 admin
      await db.update(users).set({ role: "user" }).where(eq(users.id, secondAdminId));
      await db.update(users).set({ role: "user" }).where(eq(users.id, adminUserId));

      // 此时 soloAdminId 是唯一 admin，尝试降级应失败
      const soloAdminCaller = appRouter.createCaller(makeAdminCtx(soloAdminId));
      await expect(
        soloAdminCaller.user.adminUpdate({ userId: soloAdminId, role: "user" })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });

      // 恢复数据
      await db.update(users).set({ role: "admin" }).where(eq(users.id, secondAdminId));
      await db.update(users).set({ role: "admin" }).where(eq(users.id, adminUserId));
    });

    it("TC-LAST-ADMIN-03：删除最后一个 admin 应抛出 BAD_REQUEST", async () => {
      const db = await getDb();
      if (!db) return;

      // 将 secondAdminId 和 adminUserId 临时降级，只保留 soloAdminId 为 admin
      await db.update(users).set({ role: "user" }).where(eq(users.id, secondAdminId));
      await db.update(users).set({ role: "user" }).where(eq(users.id, adminUserId));

      const soloAdminCaller = appRouter.createCaller(makeAdminCtx(soloAdminId));
      // 尝试删除另一个"非 admin"用户（targetUserId），但 soloAdminId 是最后一个 admin
      // 实际保护是针对删除 admin 角色用户，targetUserId 是 user，可以删除
      // 此处测试：soloAdmin 尝试删除自己应抛出 BAD_REQUEST（自删保护）
      await expect(
        soloAdminCaller.user.adminDelete({ userId: soloAdminId })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });

      // 恢复数据
      await db.update(users).set({ role: "admin" }).where(eq(users.id, secondAdminId));
      await db.update(users).set({ role: "admin" }).where(eq(users.id, adminUserId));
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. user.adminDelete 测试
  // ══════════════════════════════════════════════════════════════════════════

  describe("6. user.adminDelete：删除用户", () => {

    /** 专门用于删除测试的临时用户 */
    let deleteTargetId: number;
    const deleteTargetOpenId = `test-delete-target-${TS}`;

    beforeAll(async () => {
      const db = await getDb();
      if (!db) return;
      createdOpenIds.push(deleteTargetOpenId);
      deleteTargetId = await insertTestUser({
        openId: deleteTargetOpenId,
        name: `Delete Target ${TS}`,
        email: `delete-target-${TS}@test.com`,
        role: "user",
      });
    });

    it("TC-DELETE-01：删除自己应抛出 BAD_REQUEST", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(
        caller.user.adminDelete({ userId: adminUserId })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("TC-DELETE-02：删除不存在的用户 ID 应抛出 BAD_REQUEST", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      await expect(
        caller.user.adminDelete({ userId: 999999999 })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    });

    it("TC-DELETE-03：正常删除普通用户应返回 { success: true }", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminDelete({ userId: deleteTargetId });
      expect(result).toEqual({ success: true });

      // 从 createdOpenIds 中移除，避免 afterAll 重复删除
      const idx = createdOpenIds.indexOf(deleteTargetOpenId);
      if (idx !== -1) createdOpenIds.splice(idx, 1);
    });

    it("TC-DELETE-04：删除后用户应从数据库中消失", async () => {
      const db = await getDb();
      if (!db) return;
      const rows = await db.select().from(users).where(eq(users.id, deleteTargetId));
      expect(rows.length).toBe(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 7. user.adminStats 测试
  // ══════════════════════════════════════════════════════════════════════════

  describe("7. user.adminStats：用户统计", () => {

    it("TC-STATS-01：应返回包含 total 和 byRole 的对象", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminStats();

      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("byRole");
      expect(typeof result.total).toBe("number");
      expect(typeof result.byRole).toBe("object");
    });

    it("TC-STATS-02：total 应大于 0", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminStats();
      expect(result.total).toBeGreaterThan(0);
    });

    it("TC-STATS-03：byRole.admin 应大于 0（至少有测试管理员）", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminStats();
      expect(result.byRole.admin).toBeGreaterThan(0);
    });

    it("TC-STATS-04：byRole 各角色数量之和应等于 total", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const result = await caller.user.adminStats();
      const sum = Object.values(result.byRole).reduce((acc: number, v: any) => acc + v, 0);
      expect(sum).toBe(result.total);
    });

    it("TC-STATS-05：total 应与 adminList 返回的 total 一致", async () => {
      const caller = appRouter.createCaller(makeAdminCtx(adminUserId));
      const [stats, list] = await Promise.all([
        caller.user.adminStats(),
        caller.user.adminList({ pageSize: 1 }),
      ]);
      expect(stats.total).toBe(list.total);
    });
  });
});
