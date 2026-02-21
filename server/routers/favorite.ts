import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const favoriteRouter = router({
  // 添加收藏
  add: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(["collection", "work"]),
        targetId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 检查是否已收藏
      const existing = await db.checkFavorite(ctx.user.id, input.targetType, input.targetId);
      if (existing) {
        throw new Error("已经收藏过了");
      }
      return db.createFavorite({
        userId: ctx.user.id,
        ...input,
      });
    }),

  // 获取我的收藏列表
  getMyFavorites: protectedProcedure.query(async ({ ctx }) => {
    return db.getFavoritesByUserId(ctx.user.id);
  }),

  // 删除收藏（通过ID）
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteFavorite(input.id);
    }),

  // 删除收藏（通过目标类型和ID）
  removeByTarget: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(["collection", "work"]),
        targetId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.deleteFavoriteByTarget(ctx.user.id, input.targetType, input.targetId);
    }),

  // 检查是否已收藏
  check: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(["collection", "work"]),
        targetId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const favorite = await db.checkFavorite(ctx.user.id, input.targetType, input.targetId);
      return { isFavorited: !!favorite, favorite };
    }),
});
