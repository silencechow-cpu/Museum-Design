import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { works, reviews, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * 作品审核功能测试
 */
describe("Review System", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testWorkId: number;
  let testReviewerId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // 创建测试用户（管理员）
    const [user] = await db
      .insert(users)
      .values({
        openId: `test-reviewer-${Date.now()}`,
        name: "Test Reviewer",
        role: "admin",
      })
      .$returningId();
    testReviewerId = user.id;

    // 创建测试作品
    const [work] = await db
      .insert(works)
      .values({
        collectionId: 1,
        designerId: 1,
        title: "Test Work for Review",
        description: "Test work description",
        status: "submitted",
      })
      .$returningId();
    testWorkId = work.id;
  });

  it("should create reviews table", async () => {
    if (!db) throw new Error("Database not available");

    // 验证reviews表存在
    const result = await db.select().from(reviews).limit(1);
    expect(result).toBeDefined();
  });

  it("should insert review record", async () => {
    if (!db) throw new Error("Database not available");

    // 插入审核记录
    await db.insert(reviews).values({
      workId: testWorkId,
      reviewerId: testReviewerId,
      action: "approve",
      comment: "Great work!",
    });

    // 验证插入成功
    const reviewRecords = await db
      .select()
      .from(reviews)
      .where(eq(reviews.workId, testWorkId));

    expect(reviewRecords.length).toBeGreaterThan(0);
    expect(reviewRecords[0].action).toBe("approve");
    expect(reviewRecords[0].comment).toBe("Great work!");
  });

  it("should update work status", async () => {
    if (!db) throw new Error("Database not available");

    // 更新作品状态为approved
    await db
      .update(works)
      .set({ status: "approved" })
      .where(eq(works.id, testWorkId));

    // 验证更新成功
    const [work] = await db
      .select()
      .from(works)
      .where(eq(works.id, testWorkId));

    expect(work.status).toBe("approved");
  });

  it("should query work reviews with reviewer info", async () => {
    if (!db) throw new Error("Database not available");

    // 查询审核记录并关联审核人信息
    const reviewRecords = await db
      .select({
        id: reviews.id,
        workId: reviews.workId,
        action: reviews.action,
        comment: reviews.comment,
        reviewerName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.reviewerId, users.id))
      .where(eq(reviews.workId, testWorkId));

    expect(reviewRecords.length).toBeGreaterThan(0);
    expect(reviewRecords[0].reviewerName).toBe("Test Reviewer");
  });

  it("should handle multiple review actions", async () => {
    if (!db) throw new Error("Database not available");

    // 添加评论记录
    await db.insert(reviews).values({
      workId: testWorkId,
      reviewerId: testReviewerId,
      action: "comment",
      comment: "Please improve the design",
    });

    // 查询所有审核记录
    const reviewRecords = await db
      .select()
      .from(reviews)
      .where(eq(reviews.workId, testWorkId));

    expect(reviewRecords.length).toBeGreaterThanOrEqual(2);
    
    const actions = reviewRecords.map(r => r.action);
    expect(actions).toContain("approve");
    expect(actions).toContain("comment");
  });

  it("should filter works by status", async () => {
    if (!db) throw new Error("Database not available");

    // 查询已通过的作品
    const approvedWorks = await db
      .select()
      .from(works)
      .where(eq(works.status, "approved"));

    expect(approvedWorks.length).toBeGreaterThan(0);

    // 查询待审核的作品
    const submittedWorks = await db
      .select()
      .from(works)
      .where(eq(works.status, "submitted"));

    expect(submittedWorks).toBeDefined();
  });
});
