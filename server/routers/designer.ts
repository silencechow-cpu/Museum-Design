import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";

export const designerRouter = router({
  // 创建设计师资料
  create: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1),
        bio: z.string().optional(),
        avatar: z.string().optional(),
        type: z.enum(["individual", "team", "school"]).default("individual"),
        organization: z.string().optional(),
        portfolio: z.string().url().optional(),
        skills: z.string().optional(), // JSON string
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查用户是否已经创建过设计师资料
      const existing = await db.getDesignerByUserId(ctx.user.id);
      if (existing) {
        throw new Error("您已经创建过设计师资料");
      }

      const designer = await db.createDesigner({
        userId: ctx.user.id,
        ...input,
      });

      // 更新用户角色为designer
      const dbInstance = await db.getDb();
      if (dbInstance) {
        await dbInstance
          .update(users)
          .set({ role: "designer" })
          .where(eq(users.id, ctx.user.id));
      }

      return designer;
    }),

  // 获取当前用户的设计师资料
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    return db.getDesignerByUserId(ctx.user.id);
  }),

  // 更新设计师资料
  update: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).optional(),
        bio: z.string().optional(),
        avatar: z.string().optional(),
        type: z.enum(["individual", "team", "school"]).optional(),
        organization: z.string().optional(),
        portfolio: z.string().url().optional(),
        skills: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const designer = await db.getDesignerByUserId(ctx.user.id);
      if (!designer) {
        throw new Error("未找到设计师资料");
      }

      return db.updateDesigner(designer.id, input);
    }),

  // 获取所有设计师列表
  list: publicProcedure.query(async () => {
    return db.getAllDesigners();
  }),

  // 分页查询设计师列表（带排序和筛选）
  listPaginated: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(12),
        sortBy: z.enum(['displayName', 'createdAt', 'worksCount']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        type: z.enum(['individual', 'team', 'school']).optional(),
        keyword: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return db.listDesigners(input);
    }),

  // 根据ID获取设计师详情
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getDesignerById(input.id);
    }),
});
