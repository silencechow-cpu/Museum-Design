import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const workRouter = router({
  // 提交作品（仅设计师）
  submit: protectedProcedure
    .input(
      z.object({
        collectionId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        images: z.string(), // JSON string array
        tags: z.string().optional(), // JSON string array
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查用户是否是设计师
      if (ctx.user.role !== "designer") {
        throw new Error("只有设计师账号可以提交作品");
      }

      // 获取设计师ID
      const designer = await db.getDesignerByUserId(ctx.user.id);
      if (!designer) {
        throw new Error("请先完善设计师资料");
      }

      return db.createWork({
        designerId: designer.id,
        ...input,
        status: "submitted",
      });
    }),

  // 获取征集项目的所有作品
  getByCollectionId: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input }) => {
      return db.getWorksByCollectionId(input.collectionId);
    }),

  // 获取设计师的所有作品
  getByDesignerId: publicProcedure
    .input(z.object({ designerId: z.number() }))
    .query(async ({ input }) => {
      return db.getWorksByDesignerId(input.designerId);
    }),

  // 获取当前设计师的所有作品
  getMyWorks: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "designer") {
      return [];
    }

    const designer = await db.getDesignerByUserId(ctx.user.id);
    if (!designer) {
      return [];
    }

    return db.getWorksByDesignerId(designer.id);
  }),

  // 获取所有作品（用于首页展示）
  getAll: publicProcedure.query(async () => {
    return db.getAllWorks();
  }),

  // 搜索和筛选作品（支持分页）
  search: publicProcedure
    .input(
      z.object({
        keyword: z.string().optional(),
        status: z.enum(["submitted", "approved", "rejected", "winner"]).optional(),
        collectionId: z.number().optional(),
        designerId: z.number().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      return db.searchWorks(input);
    }),

  // 根据ID获取作品详情
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getWorkById(input.id);
    }),

  // 获取作品完整详情（包含设计师和征集信息）
  getDetailById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const work = await db.getWorkById(input.id);
      if (!work) {
        return null;
      }

      // 获取设计师信息
      const designer = await db.getDesignerById(work.designerId);
      
      // 获取征集项目信息
      const collection = await db.getCollectionById(work.collectionId);

      return {
        ...work,
        designer,
        collection,
      };
    }),

  // 删除作品（仅设计师所有者）
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // 检查用户是否是设计师
      if (ctx.user.role !== "designer") {
        throw new Error("只有设计师账号可以删除作品");
      }

      // 获取设计师ID
      const designer = await db.getDesignerByUserId(ctx.user.id);
      if (!designer) {
        throw new Error("请先完善设计师资料");
      }

      // 获取作品并检查所有权
      const work = await db.getWorkById(input.id);
      if (!work) {
        throw new Error("作品不存在");
      }

      if (work.designerId !== designer.id) {
        throw new Error("您没有权限删除此作品");
      }

      return db.deleteWork(input.id);
    }),

  // 获取相关作品推荐（基于标签和分类）
  getRelated: publicProcedure
    .input(z.object({ 
      workId: z.number(),
      limit: z.number().default(6),
    }))
    .query(async ({ input }) => {
      const work = await db.getWorkById(input.workId);
      if (!work) {
        return [];
      }

      // 获取所有作品
      const allWorks = await db.getAllWorks();
      
      // 过滤掉当前作品
      const otherWorks = allWorks.filter(w => w.id !== input.workId);
      
      // 解析当前作品的标签
      let currentTags: string[] = [];
      if (work.tags) {
        try {
          currentTags = JSON.parse(work.tags);
        } catch (e) {
          currentTags = [];
        }
      }
      
      // 计算相似度并排序
      const worksWithScore = otherWorks.map(w => {
        let score = 0;
        
        // 同一征集项目，加分
        if (w.collectionId === work.collectionId) {
          score += 10;
        }
        
        // 同一设计师，加分
        if (w.designerId === work.designerId) {
          score += 5;
        }
        
        // 标签匹配，每个匹配的标签加分
        if (w.tags) {
          try {
            const workTags = JSON.parse(w.tags);
            const matchingTags = workTags.filter((tag: string) => currentTags.includes(tag));
            score += matchingTags.length * 3;
          } catch (e) {
            // 忽略解析错误
          }
        }
        
        // 获奖作品优先
        if (w.status === 'winner') {
          score += 2;
        }
        
        // 已通过作品优先
        if (w.status === 'approved') {
          score += 1;
        }
        
        return { ...w, score };
      });
      
      // 按相似度排序，然后按创建时间排序
      worksWithScore.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // 返回前 N 个作品
      return worksWithScore.slice(0, input.limit);
    }),
});
