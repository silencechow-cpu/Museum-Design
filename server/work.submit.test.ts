import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Work Submission and Favorites", () => {
  let testUserId: number = 0;
  let testDesignerId: number = 0;
  let testMuseumId: number = 0;
  let testCollectionId: number = 0;
  let testWorkId: number = 0;

  beforeAll(async () => {
    const designerOpenId = "test-designer-openid-" + Date.now();
    const museumOpenId = "test-museum-openid-" + Date.now();

    // 创建测试用户（设计师）
    await db.upsertUser({
      openId: designerOpenId,
      name: "测试设计师",
      email: "designer@test.com",
      role: "designer",
    });

    const designerUser = await db.getUserByOpenId(designerOpenId);
    if (designerUser) {
      testUserId = designerUser.id;

      // 创建设计师资料
      const designer = await db.createDesigner({
        userId: testUserId,
        displayName: "测试设计师",
        type: "individual",
      });
      if (designer) {
        testDesignerId = designer.id;
      }
    }

    // 创建测试博物馆用户
    await db.upsertUser({
      openId: museumOpenId,
      name: "测试博物馆",
      email: "museum@test.com",
      role: "museum",
    });

    const museumUser = await db.getUserByOpenId(museumOpenId);
    if (museumUser) {
      const museum = await db.createMuseum({
        userId: museumUser.id,
        name: "测试博物馆",
      });
      if (museum) {
        testMuseumId = museum.id;

        // 创建测试征集
        const collection = await db.createCollection({
          museumId: testMuseumId,
          title: "测试征集项目",
          artifactName: "测试文物",
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "active",
        });
        if (collection) {
          testCollectionId = collection.id;
        }
      }
    }
  });

  describe("Work Submission", () => {
    it("should allow designer to submit work", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-designer-openid",
          name: "测试设计师",
          role: "designer",
        },
      });

      const work = await caller.work.submit({
        collectionId: testCollectionId,
        title: "测试作品",
        description: "这是一个测试作品",
        images: JSON.stringify(["https://example.com/image1.jpg"]),
        tags: JSON.stringify(["测试", "设计"]),
      });

      expect(work).toBeDefined();
      expect(work?.title).toBe("测试作品");
      expect(work?.status).toBe("submitted");
      
      if (work) {
        testWorkId = work.id;
      }
    });

    it("should not allow non-designer to submit work", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: 999,
          openId: "test-user-openid",
          name: "普通用户",
          role: "user",
        },
      });

      await expect(
        caller.work.submit({
          collectionId: testCollectionId,
          title: "测试作品",
          images: JSON.stringify(["https://example.com/image1.jpg"]),
        })
      ).rejects.toThrow("只有设计师账号可以提交作品");
    });

    it("should validate required fields", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-designer-openid",
          name: "测试设计师",
          role: "designer",
        },
      });

      await expect(
        caller.work.submit({
          collectionId: testCollectionId,
          title: "",
          images: JSON.stringify([]),
        })
      ).rejects.toThrow();
    });
  });

  describe("Favorites", () => {
    it("should allow user to favorite a collection", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-designer-openid",
          name: "测试设计师",
          role: "designer",
        },
      });

      const favorite = await caller.favorite.add({
        targetType: "collection",
        targetId: testCollectionId,
      });

      expect(favorite).toBeDefined();
      expect(favorite?.targetType).toBe("collection");
      expect(favorite?.targetId).toBe(testCollectionId);
    });

    it("should check if collection is favorited", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-designer-openid",
          name: "测试设计师",
          role: "designer",
        },
      });

      const result = await caller.favorite.check({
        targetType: "collection",
        targetId: testCollectionId,
      });

      expect(result.isFavorited).toBe(true);
      expect(result.favorite).toBeDefined();
    });

    it("should not allow duplicate favorites", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-designer-openid",
          name: "测试设计师",
          role: "designer",
        },
      });

      await expect(
        caller.favorite.add({
          targetType: "collection",
          targetId: testCollectionId,
        })
      ).rejects.toThrow("已经收藏过了");
    });

    it("should allow user to remove favorite", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-designer-openid",
          name: "测试设计师",
          role: "designer",
        },
      });

      await caller.favorite.removeByTarget({
        targetType: "collection",
        targetId: testCollectionId,
      });

      const result = await caller.favorite.check({
        targetType: "collection",
        targetId: testCollectionId,
      });

      expect(result.isFavorited).toBe(false);
    });

    it("should get user's favorites list", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-designer-openid",
          name: "测试设计师",
          role: "designer",
        },
      });

      // 重新添加收藏
      await caller.favorite.add({
        targetType: "collection",
        targetId: testCollectionId,
      });

      const favorites = await caller.favorite.getMyFavorites();

      expect(Array.isArray(favorites)).toBe(true);
      expect(favorites.length).toBeGreaterThan(0);
    });
  });

  describe("Related Collections", () => {
    it("should get related collections", async () => {
      const caller = appRouter.createCaller({
        user: undefined,
      });

      const related = await caller.collection.getRelated({
        collectionId: testCollectionId,
        limit: 6,
      });

      expect(Array.isArray(related)).toBe(true);
    });
  });
});
