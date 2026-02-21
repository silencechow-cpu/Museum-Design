import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/trpc";
import * as db from "./db";

describe("Collection Edit Feature", () => {
  let testMuseumId: number;
  let testCollectionId: number;
  let testUserId: number;

  // 模拟博物馆用户上下文
  const createMuseumContext = (userId: number): Context => ({
    user: {
      id: userId,
      openId: `test-museum-${userId}`,
      name: "Test Museum User",
      role: "museum",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 模拟普通用户上下文
  const createUserContext = (userId: number): Context => ({
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      name: "Test User",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  beforeAll(async () => {
    // 创建测试用户
    testUserId = Math.floor(Math.random() * 1000000) + 1000;
    
    // 创建测试博物馆
    const museum = await db.createMuseum({
      userId: testUserId,
      name: "Test Museum for Edit",
      description: "Test museum description",
      location: "Test Location",
    });
    testMuseumId = museum!.id;

    // 创建测试征集项目
    const collection = await db.createCollection({
      museumId: testMuseumId,
      title: "Original Title",
      description: "Original Description",
      artifactName: "Original Artifact",
      artifactDescription: "Original artifact description",
      images: JSON.stringify(["/test/image1.jpg"]),
      requirements: "Original requirements",
      prize: "Original prize",
      prizeAmount: 10000,
      deadline: new Date("2026-12-31"),
      status: "draft",
    });
    testCollectionId = collection!.id;
  });

  it("should update collection successfully by owner", async () => {
    const caller = appRouter.createCaller(createMuseumContext(testUserId));

    const result = await caller.collection.update({
      id: testCollectionId,
      title: "Updated Title",
      description: "Updated Description",
      prizeAmount: 20000,
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Updated Title");
    expect(result.description).toBe("Updated Description");
    expect(result.prizeAmount).toBe(20000);
  });

  it("should update images successfully", async () => {
    const caller = appRouter.createCaller(createMuseumContext(testUserId));

    const newImages = ["/test/image1.jpg", "/test/image2.jpg", "/test/image3.jpg"];
    const result = await caller.collection.update({
      id: testCollectionId,
      images: JSON.stringify(newImages),
    });

    expect(result).toBeDefined();
    expect(result.images).toBe(JSON.stringify(newImages));
    
    // 验证可以解析回数组
    const parsedImages = JSON.parse(result.images!);
    expect(parsedImages).toHaveLength(3);
    expect(parsedImages[0]).toBe("/test/image1.jpg");
  });

  it("should update deadline successfully", async () => {
    const caller = appRouter.createCaller(createMuseumContext(testUserId));

    const newDeadline = new Date("2027-06-30");
    const result = await caller.collection.update({
      id: testCollectionId,
      deadline: newDeadline,
    });

    expect(result).toBeDefined();
    expect(new Date(result.deadline).toISOString()).toBe(newDeadline.toISOString());
  });

  it("should update status successfully", async () => {
    const caller = appRouter.createCaller(createMuseumContext(testUserId));

    const result = await caller.collection.update({
      id: testCollectionId,
      status: "active",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("active");
  });

  it("should reject update by non-museum user", async () => {
    const caller = appRouter.createCaller(createUserContext(testUserId + 1));

    await expect(
      caller.collection.update({
        id: testCollectionId,
        title: "Hacked Title",
      })
    ).rejects.toThrow("只有博物馆账号可以编辑征集项目");
  });

  it("should reject update by non-owner museum", async () => {
    // 创建另一个博物馆用户
    const anotherUserId = testUserId + 2;
    const anotherMuseum = await db.createMuseum({
      userId: anotherUserId,
      name: "Another Museum",
      description: "Another museum description",
      location: "Another Location",
    });
    const anotherMuseumId = anotherMuseum!.id;

    const caller = appRouter.createCaller(createMuseumContext(anotherUserId));

    await expect(
      caller.collection.update({
        id: testCollectionId,
        title: "Unauthorized Update",
      })
    ).rejects.toThrow("您没有权限编辑此征集项目");
  });

  it("should reject update for non-existent collection", async () => {
    const caller = appRouter.createCaller(createMuseumContext(testUserId));

    await expect(
      caller.collection.update({
        id: 999999999,
        title: "Non-existent Collection",
      })
    ).rejects.toThrow("征集项目不存在");
  });
});
