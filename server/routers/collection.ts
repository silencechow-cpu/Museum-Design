import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const collectionRouter = router({
  // 创建征集项目（仅博物馆）
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        artifactName: z.string().min(1),
        artifactDescription: z.string().optional(),
        images: z.string().optional(), // JSON string array
        requirements: z.string().optional(),
        prize: z.string().optional(),
        prizeAmount: z.number().default(0),
        deadline: z.date(),
        status: z.enum(["draft", "active", "closed", "completed"]).default("draft"),
        downloadUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查用户是否是博物馆
      if (ctx.user.role !== "museum") {
        throw new Error("只有博物馆账号可以创建征集项目");
      }

      // 获取博物馆ID
      const museum = await db.getMuseumByUserId(ctx.user.id);
      if (!museum) {
        throw new Error("请先完善博物馆资料");
      }

      return db.createCollection({
        museumId: museum.id,
        ...input,
      });
    }),

  // 获取所有征集项目
  list: publicProcedure.query(async () => {
    return db.getAllCollections();
  }),

  // 搜索和筛选征集项目
  search: publicProcedure
    .input(
      z.object({
        keyword: z.string().optional(),
        museumId: z.number().optional(),
        minPrize: z.number().optional(),
        maxPrize: z.number().optional(),
        deadlineStart: z.date().optional(),
        deadlineEnd: z.date().optional(),
        status: z.enum(["draft", "active", "closed", "completed"]).optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      return db.searchCollections(input);
    }),

  // 根据ID获取征集详情
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getCollectionById(input.id);
    }),

  // 获取当前博物馆的所有征集项目
  getMyCollections: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "museum") {
      return [];
    }

    const museum = await db.getMuseumByUserId(ctx.user.id);
    if (!museum) {
      return [];
    }

    return db.getCollectionsByMuseumId(museum.id);
  }),

  // 获取相关征集推荐
  getRelated: publicProcedure
    .input(
      z.object({
        collectionId: z.number(),
        limit: z.number().default(6),
      })
    )
    .query(async ({ input }) => {
      return db.getRelatedCollections(input.collectionId, input.limit);
    }),

  // 更新征集项目（仅博物馆所有者）
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        artifactName: z.string().min(1).optional(),
        artifactDescription: z.string().optional(),
        images: z.string().optional(),
        requirements: z.string().optional(),
        prize: z.string().optional(),
        prizeAmount: z.number().optional(),
        deadline: z.date().optional(),
        status: z.enum(["draft", "active", "closed", "completed"]).optional(),
        downloadUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查用户是否是博物馆
      if (ctx.user.role !== "museum") {
        throw new Error("只有博物馆账号可以编辑征集项目");
      }

      // 获取博物馆ID
      const museum = await db.getMuseumByUserId(ctx.user.id);
      if (!museum) {
        throw new Error("请先完善博物馆资料");
      }

      // 获取征集项目并检查所有权
      const collection = await db.getCollectionById(input.id);
      if (!collection) {
        throw new Error("征集项目不存在");
      }

      if (collection.museumId !== museum.id) {
        throw new Error("您没有权限编辑此征集项目");
      }

      return db.updateCollection(input.id, input);
    }),

  // 更新征集状态（仅博物馆所有者）
  updateStatus: protectedProcedure
    .input(
      z.object({
        collectionId: z.number(),
        status: z.enum(["draft", "active", "closed", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查用户是否是博物馆
      if (ctx.user.role !== "museum") {
        throw new Error("只有博物馆账号可以管理征集项目");
      }

      // 获取博物馆ID
      const museum = await db.getMuseumByUserId(ctx.user.id);
      if (!museum) {
        throw new Error("请先完善博物馆资料");
      }

      // 获取征集项目并检查所有权
      const collection = await db.getCollectionById(input.collectionId);
      if (!collection) {
        throw new Error("征集项目不存在");
      }

      if (collection.museumId !== museum.id) {
        throw new Error("您没有权限管理此征集项目");
      }

      return db.updateCollectionStatus(input.collectionId, input.status);
    }),

  // 获取征集下的作品列表（支持排序和筛选）
  getWorks: publicProcedure
    .input(
      z.object({
        collectionId: z.number(),
        page: z.number().default(1),
        pageSize: z.number().default(12),
        sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        status: z.enum(['submitted', 'approved', 'rejected', 'winner']).optional(),
      })
    )
    .query(async ({ input }) => {
      return db.getWorksByCollection(input);
    }),
});
