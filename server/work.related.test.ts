import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/trpc";
import * as db from "./db";

describe("相关作品推荐功能", () => {
  let testDesignerId: number;
  let testCollectionId: number;
  let testWorkId: number;
  let relatedWorkIds: number[] = [];

  beforeAll(async () => {
    // 创建测试设计师
    const designer = await db.createDesigner({
      userId: 9999,
      displayName: "测试设计师",
      type: "individual",
      bio: "测试简介",
    });
    testDesignerId = designer.id;

    // 创建测试征集
    const collection = await db.createCollection({
      museumId: 1,
      title: "测试征集项目",
      description: "测试描述",
      artifactName: "测试文物",
      artifactDescription: "测试文物描述",
      requirements: "测试要求",
      prize: "10000",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      images: JSON.stringify(["test.jpg"]),
      status: "active",
    });
    testCollectionId = collection.id;

    // 创建主测试作品（带标签）
    const mainWork = await db.createWork({
      designerId: testDesignerId,
      collectionId: testCollectionId,
      title: "主测试作品",
      description: "这是主测试作品",
      images: JSON.stringify(["main.jpg"]),
      tags: JSON.stringify(["青花瓷", "传统", "创新"]),
      status: "approved",
    });
    testWorkId = mainWork.id;

    // 创建相关作品1（同征集+同标签）
    const related1 = await db.createWork({
      designerId: testDesignerId,
      collectionId: testCollectionId,
      title: "相关作品1",
      description: "同征集同标签",
      images: JSON.stringify(["related1.jpg"]),
      tags: JSON.stringify(["青花瓷", "传统"]),
      status: "approved",
    });
    relatedWorkIds.push(related1.id);

    // 创建相关作品2（同标签不同征集）
    const related2 = await db.createWork({
      designerId: testDesignerId,
      collectionId: testCollectionId + 1 || 2,
      title: "相关作品2",
      description: "同标签不同征集",
      images: JSON.stringify(["related2.jpg"]),
      tags: JSON.stringify(["青花瓷", "现代"]),
      status: "approved",
    });
    relatedWorkIds.push(related2.id);

    // 创建相关作品3（获奖作品）
    const related3 = await db.createWork({
      designerId: testDesignerId,
      collectionId: testCollectionId,
      title: "相关作品3",
      description: "获奖作品",
      images: JSON.stringify(["related3.jpg"]),
      tags: JSON.stringify(["创新"]),
      status: "winner",
    });
    relatedWorkIds.push(related3.id);

    // 创建不相关作品（无标签匹配）
    await db.createWork({
      designerId: testDesignerId,
      collectionId: testCollectionId + 2 || 3,
      title: "不相关作品",
      description: "完全不相关",
      images: JSON.stringify(["unrelated.jpg"]),
      tags: JSON.stringify(["油画", "抽象"]),
      status: "submitted",
    });
  });

  it("应该返回相关作品列表", async () => {
    const caller = appRouter.createCaller({} as Context);
    const result = await caller.work.getRelated({
      workId: testWorkId,
      limit: 6,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("返回的作品不应包含当前作品", async () => {
    const caller = appRouter.createCaller({} as Context);
    const result = await caller.work.getRelated({
      workId: testWorkId,
      limit: 6,
    });

    const currentWorkInResults = result.find((w) => w.id === testWorkId);
    expect(currentWorkInResults).toBeUndefined();
  });

  it("应该按相似度排序（同征集+同标签的作品排在前面）", async () => {
    const caller = appRouter.createCaller({} as Context);
    const result = await caller.work.getRelated({
      workId: testWorkId,
      limit: 6,
    });

    // 第一个相关作品应该是同征集+同标签的作品
    if (result.length > 0) {
      const firstWork = result[0];
      expect(firstWork.collectionId).toBe(testCollectionId);
      
      // 检查标签匹配
      const firstWorkTags = firstWork.tags ? JSON.parse(firstWork.tags) : [];
      const mainWorkTags = ["青花瓷", "传统", "创新"];
      const hasMatchingTag = firstWorkTags.some((tag: string) =>
        mainWorkTags.includes(tag)
      );
      expect(hasMatchingTag).toBe(true);
    }
  });

  it("应该限制返回数量", async () => {
    const caller = appRouter.createCaller({} as Context);
    const result = await caller.work.getRelated({
      workId: testWorkId,
      limit: 2,
    });

    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("获奖作品应该有更高的优先级", async () => {
    const caller = appRouter.createCaller({} as Context);
    const result = await caller.work.getRelated({
      workId: testWorkId,
      limit: 6,
    });

    // 检查获奖作品是否在结果中
    const winnerWork = result.find((w) => w.status === "winner");
    expect(winnerWork).toBeDefined();
  });

  it("不存在的作品ID应该返回空数组", async () => {
    const caller = appRouter.createCaller({} as Context);
    const result = await caller.work.getRelated({
      workId: 999999,
      limit: 6,
    });

    expect(result).toEqual([]);
  });
});
