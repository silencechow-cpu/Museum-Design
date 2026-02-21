import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { reviews, works, users } from "../../drizzle/schema";
import { eq, and, inArray, sql, desc } from "drizzle-orm";

/**
 * Review router - 作品审核相关API
 * 只有管理员和博物馆用户可以审核作品
 */
export const reviewRouter = router({
  /**
   * 批量审核作品（通过/拒绝）
   */
  batchReview: protectedProcedure
    .input(
      z.object({
        workIds: z.array(z.number()).min(1, "至少选择一个作品"),
        action: z.enum(["approve", "reject"]),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // 检查权限：只有admin和museum可以审核
      if (ctx.user.role !== "admin" && ctx.user.role !== "museum") {
        throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员和博物馆用户可以审核作品" });
      }

      const { workIds, action, comment } = input;

      // 更新作品状态
      const newStatus = action === "approve" ? "approved" : "rejected";
      await db.update(works)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(inArray(works.id, workIds));

      // 为每个作品创建审核记录
      const reviewRecords = workIds.map(workId => ({
        workId,
        reviewerId: ctx.user.id,
        action,
        comment: comment || null,
      }));

      await db.insert(reviews).values(reviewRecords);

      return { success: true, count: workIds.length };
    }),

  /**
   * 为作品添加评论（不改变状态）
   */
  addComment: protectedProcedure
    .input(
      z.object({
        workId: z.number(),
        comment: z.string().min(1, "评论不能为空"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // 检查权限
      if (ctx.user.role !== "admin" && ctx.user.role !== "museum") {
        throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员和博物馆用户可以评论作品" });
      }

      const { workId, comment } = input;

      // 创建评论记录
      await db.insert(reviews).values({
        workId,
        reviewerId: ctx.user.id,
        action: "comment",
        comment,
      });

      return { success: true };
    }),

  /**
   * 获取作品的审核历史
   */
  getWorkReviews: publicProcedure
    .input(z.object({ workId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { workId } = input;

      // 获取审核记录并关联审核人信息
      const reviewRecords = await db
        .select({
          id: reviews.id,
          workId: reviews.workId,
          action: reviews.action,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
          reviewerName: users.name,
          reviewerId: reviews.reviewerId,
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.reviewerId, users.id))
        .where(eq(reviews.workId, workId))
        .orderBy(desc(reviews.createdAt));

      return reviewRecords;
    }),

  /**
   * 获取待审核作品列表
   */
  getPendingWorks: protectedProcedure
    .input(
      z.object({
        status: z.enum(["submitted", "approved", "rejected", "winner"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // 检查权限
      if (ctx.user.role !== "admin" && ctx.user.role !== "museum") {
        throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员和博物馆用户可以查看待审核作品" });
      }

      const { status, limit, offset } = input;

      // 构建查询条件
      const conditions = status ? eq(works.status, status) : eq(works.status, "submitted");

      // 获取作品列表
      const worksList = await db
        .select()
        .from(works)
        .where(conditions)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(works.createdAt));

      // 获取总数
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(works)
        .where(conditions);

      return {
        works: worksList,
        total,
        hasMore: offset + limit < total,
      };
    }),
});
