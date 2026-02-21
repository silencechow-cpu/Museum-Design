import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";

export const museumRouter = router({
  // 创建博物馆资料
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        address: z.string().optional(),
        logo: z.string().optional(),
        coverImage: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        website: z.string().url().optional().or(z.literal('')),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查用户是否已经创建过博物馆资料
      const existing = await db.getMuseumByUserId(ctx.user.id);
      if (existing) {
        throw new Error("您已经创建过博物馆资料");
      }

      const museum = await db.createMuseum({
        userId: ctx.user.id,
        ...input,
      });

      // 更新用户角色为museum
      const dbInstance = await db.getDb();
      if (dbInstance) {
        await dbInstance
          .update(users)
          .set({ role: "museum" })
          .where(eq(users.id, ctx.user.id));
      }

      return museum;
    }),

  // 获取当前用户的博物馆资料
  getMyMuseum: protectedProcedure.query(async ({ ctx }) => {
    return db.getMuseumByUserId(ctx.user.id);
  }),

  // 获取当前用户的博物馆资料（别名）
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    return db.getMuseumByUserId(ctx.user.id);
  }),

  // 更新博物馆资料
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        logo: z.string().optional(),
        coverImage: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        website: z.string().url().optional().or(z.literal('')),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const museum = await db.getMuseumByUserId(ctx.user.id);
      if (!museum) {
        throw new Error("未找到博物馆资料");
      }

      return db.updateMuseum(museum.id, input);
    }),

  // 获取所有博物馆列表
  list: publicProcedure.query(async () => {
    return db.getAllMuseums();
  }),

  // 分页查询博物馆列表（带排序和筛选）
  listPaginated: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(12),
        sortBy: z.enum(['name', 'createdAt', 'collectionsCount']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        province: z.string().optional(),
        city: z.string().optional(),
        keyword: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return db.listMuseums(input);
    }),

  // 根据ID获取博物馆详情
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getMuseumById(input.id);
    }),
});
