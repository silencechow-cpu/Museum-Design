/**
 * 用户管理路由（管理员专用）
 *
 * 所有接口均使用 adminProcedure 保护，要求请求方具有 admin 角色。
 * 普通用户、博物馆、设计师无权访问这些接口。
 *
 * 接口列表：
 *   - user.adminList       GET  分页获取用户列表（支持关键词搜索、角色筛选、排序）
 *   - user.adminGetById    GET  获取单个用户详情（含关联博物馆/设计师信息）
 *   - user.adminUpdate     POST 更新用户信息（name / email / role）
 *   - user.adminDelete     POST 删除用户（硬删除，含最后一个 admin 保护）
 *   - user.adminStats      GET  获取用户统计数据（总数、按角色分布）
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import {
  listUsers,
  getUserDetailById,
  updateUserAsAdmin,
  deleteUserAsAdmin,
  getUserStats,
} from "../db";

/** 角色枚举，与 Schema 保持一致 */
const roleEnum = z.enum(["user", "admin", "museum", "designer"]);

export const userRouter = router({
  /**
   * 分页获取用户列表
   *
   * @param page      页码，从 1 开始，默认 1
   * @param pageSize  每页条数，1-100，默认 15
   * @param keyword   关键词，模糊匹配 name 或 email
   * @param role      角色筛选，不传则返回所有角色
   * @param sortBy    排序字段：createdAt | lastSignedIn | name，默认 createdAt
   * @param sortOrder 排序方向：asc | desc，默认 desc
   *
   * @returns { users, total, page, pageSize, totalPages }
   */
  adminList: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(15),
        keyword: z.string().trim().optional(),
        role: roleEnum.optional(),
        sortBy: z.enum(["createdAt", "lastSignedIn", "name"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input }) => {
      return listUsers(input);
    }),

  /**
   * 获取单个用户详情
   *
   * @param userId 目标用户 ID
   * @returns 用户信息 + 关联的 museum / designer 对象（无则为 null）
   * @throws NOT_FOUND 用户不存在时
   */
  adminGetById: adminProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const user = await getUserDetailById(input.userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `用户 ID ${input.userId} 不存在`,
        });
      }
      return user;
    }),

  /**
   * 更新用户信息
   *
   * 可修改字段：name、email、role。
   * 不允许修改 openId、passwordHash 等核心认证字段。
   * 内置保护：不允许将系统中最后一个 admin 的角色降级。
   *
   * @param userId 目标用户 ID
   * @param name   新用户名（可选）
   * @param email  新邮箱（可选，需符合 email 格式）
   * @param role   新角色（可选）
   *
   * @returns 更新后的用户对象
   * @throws NOT_FOUND 用户不存在时
   * @throws BAD_REQUEST 违反业务规则时（如降级最后一个 admin）
   */
  adminUpdate: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        name: z.string().min(1, "用户名不能为空").max(100).optional(),
        email: z.string().email("邮箱格式不正确").optional(),
        role: roleEnum.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, ...data } = input;

      // 至少需要一个可修改字段
      if (Object.keys(data).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "请至少提供一个需要更新的字段",
        });
      }

      try {
        const updated = await updateUserAsAdmin(userId, data);
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `用户 ID ${userId} 不存在`,
          });
        }
        return updated;
      } catch (err: any) {
        // 将 db 层抛出的业务错误转换为 tRPC 错误
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.message ?? "更新用户失败",
        });
      }
    }),

  /**
   * 删除用户（硬删除）
   *
   * 内置保护：不允许删除系统中最后一个 admin。
   *
   * @param userId 目标用户 ID
   * @returns { success: true }
   * @throws NOT_FOUND 用户不存在时
   * @throws BAD_REQUEST 违反业务规则时
   */
  adminDelete: adminProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // 不允许管理员删除自己
      if (ctx.user.id === input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "不能删除当前登录的管理员账号",
        });
      }

      try {
        await deleteUserAsAdmin(input.userId);
        return { success: true } as const;
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.message ?? "删除用户失败",
        });
      }
    }),

  /**
   * 获取用户统计数据（管理员仪表盘用）
   *
   * @returns { total: number, byRole: Record<string, number> }
   *   例：{ total: 120, byRole: { user: 100, museum: 10, designer: 8, admin: 2 } }
   */
  adminStats: adminProcedure.query(async () => {
    return getUserStats();
  }),
});
