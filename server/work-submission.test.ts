import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import { users, designers, museums, collections, works } from "../drizzle/schema";

describe("作品提交功能测试", () => {
  let testDesignerUserId: number;
  let testDesignerId: number;
  let testMuseumUserId: number;
  let testMuseumId: number;
  let testCollectionId: number;

  beforeAll(async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) throw new Error("数据库连接失败");

    // 创建测试设计师用户
    const timestamp = Date.now();
    const designerUserResult = await dbInstance.insert(users).values({
      openId: `designer-work-test-${timestamp}`,
      email: `designer-work-test-${timestamp}@example.com`,
      name: "测试设计师用户",
      role: "designer",
    });
    testDesignerUserId = Number(designerUserResult[0].insertId);

    // 创建测试设计师资料
    const designerResult = await dbInstance.insert(designers).values({
      userId: testDesignerUserId,
      displayName: "测试设计师",
      type: "individual",
    });
    testDesignerId = Number(designerResult[0].insertId);

    // 创建测试博物馆用户
    const museumUserResult = await dbInstance.insert(users).values({
      openId: `museum-work-test-${timestamp}`,
      email: `museum-work-test-${timestamp}@example.com`,
      name: "测试博物馆用户",
      role: "museum",
    });
    testMuseumUserId = Number(museumUserResult[0].insertId);

    // 创建测试博物馆资料
    const museumResult = await dbInstance.insert(museums).values({
      userId: testMuseumUserId,
      name: "测试博物馆",
    });
    testMuseumId = Number(museumResult[0].insertId);

    // 创建测试征集项目
    const collectionResult = await dbInstance.insert(collections).values({
      museumId: testMuseumId,
      title: "测试征集项目",
      artifactName: "测试文物",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      status: "active",
    });
    testCollectionId = Number(collectionResult[0].insertId);
  });

  it("应该能够提交作品", async () => {
    const work = await db.createWork({
      designerId: testDesignerId,
      collectionId: testCollectionId,
      title: "测试作品",
      description: "这是一个测试作品",
      images: JSON.stringify(["https://example.com/image1.jpg"]),
      status: "submitted",
    });

    expect(work).toBeDefined();
    expect(work?.title).toBe("测试作品");
    expect(work?.status).toBe("submitted");
  });

  it("应该能够获取征集项目的所有作品", async () => {
    const works = await db.getWorksByCollectionId(testCollectionId);
    expect(Array.isArray(works)).toBe(true);
    expect(works.length).toBeGreaterThan(0);
  });

  it("应该能够获取设计师的所有作品", async () => {
    const works = await db.getWorksByDesignerId(testDesignerId);
    expect(Array.isArray(works)).toBe(true);
    expect(works.length).toBeGreaterThan(0);
  });

  it("应该能够根据ID获取作品详情", async () => {
    const works = await db.getWorksByDesignerId(testDesignerId);
    if (works.length > 0) {
      const work = await db.getWorkById(works[0].id);
      expect(work).toBeDefined();
      expect(work?.id).toBe(works[0].id);
    }
  });

  it("提交的作品应该包含必要的字段", async () => {
    const work = await db.createWork({
      designerId: testDesignerId,
      collectionId: testCollectionId,
      title: "完整字段测试作品",
      description: "测试描述",
      images: JSON.stringify(["https://example.com/image1.jpg", "https://example.com/image2.jpg"]),
      tags: "测试,文创,设计",
      status: "submitted",
    });

    expect(work).toBeDefined();
    expect(work?.title).toBe("完整字段测试作品");
    expect(work?.description).toBe("测试描述");
    expect(work?.tags).toBe("测试,文创,设计");
    
    const images = JSON.parse(work?.images || "[]");
    expect(images.length).toBe(2);
  });
});
