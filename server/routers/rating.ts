import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const ratingRouter = router({
  /**
   * 创建或更新评分（通用，支持作品和征集）
   * 任何登录用户都可以评分
   */
  createOrUpdate: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(["work", "collection"]),
        targetId: z.number(),
        score: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 验证目标是否存在
      if (input.targetType === "work") {
        const work = await db.getWorkById(input.targetId);
        if (!work) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "作品不存在",
          });
        }
      } else if (input.targetType === "collection") {
        const collection = await db.getCollectionById(input.targetId);
        if (!collection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "征集不存在",
          });
        }
      }

      // 创建或更新评分
      const rating = await db.createOrUpdateRating({
        userId: ctx.user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        score: input.score,
      });

      return rating;
    }),

  /**
   * 获取目标的所有评分
   */
  getByTarget: publicProcedure
    .input(
      z.object({
        targetType: z.enum(["work", "collection"]),
        targetId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return db.getRatingsByTarget(input.targetType, input.targetId);
    }),

  /**
   * 获取目标的平均评分和评分数量
   */
  getStats: publicProcedure
    .input(
      z.object({
        targetType: z.enum(["work", "collection"]),
        targetId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const [averageRating, ratingCount] = await Promise.all([
        db.getAverageRating(input.targetType, input.targetId),
        db.getRatingCount(input.targetType, input.targetId),
      ]);

      return {
        averageRating: Math.round(averageRating * 10) / 10, // 保留一位小数
        ratingCount,
      };
    }),

  /**
   * 获取当前用户对某目标的评分
   */
  getMyRating: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(["work", "collection"]),
        targetId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      return db.getUserRating(ctx.user.id, input.targetType, input.targetId);
    }),

  /**
   * 删除评分（仅评分者本人可删除）
   */
  delete: protectedProcedure
    .input(z.object({ ratingId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // 检查评分是否属于该用户
      const rating = await db.getRatingById(input.ratingId);
      if (!rating || rating.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "无权删除此评分",
        });
      }

      await db.deleteRating(input.ratingId);
      return { success: true };
    }),

  // ===== 向后兼容的旧API =====

  /**
   * @deprecated 使用 getStats 替代
   * 获取作品的平均评分和评分数量
   */
  getWorkRatingStats: publicProcedure
    .input(z.object({ workId: z.number() }))
    .query(async ({ input }) => {
      const [averageRating, ratingCount] = await Promise.all([
        db.getAverageRatingForWork(input.workId),
        db.getRatingCountForWork(input.workId),
      ]);

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        ratingCount,
      };
    }),
});
