import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import { users, museums, designers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("个人中心功能测试", () => {
  let testMuseumUserId: number;
  let testDesignerUserId: number;
  let testMuseumId: number;
  let testDesignerId: number;

  beforeAll(async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) throw new Error("数据库连接失败");

    // 创建测试博物馆用户
    const timestamp = Date.now();
    const museumUserResult = await dbInstance.insert(users).values({
      openId: `museum-test-${timestamp}`,
      email: `museum-test-${timestamp}@example.com`,
      name: "测试博物馆用户",
      role: "museum",
    });
    testMuseumUserId = Number(museumUserResult[0].insertId);

    // 创建测试设计师用户
    const designerUserResult = await dbInstance.insert(users).values({
      openId: `designer-test-${timestamp}`,
      email: `designer-test-${timestamp}@example.com`,
      name: "测试设计师用户",
      role: "designer",
    });
    testDesignerUserId = Number(designerUserResult[0].insertId);

    // 创建测试博物馆资料
    const museumResult = await dbInstance.insert(museums).values({
      userId: testMuseumUserId,
      name: "测试博物馆",
      description: "这是一个测试博物馆",
      address: "测试地址",
      contactEmail: "museum@test.com",
      contactPhone: "1234567890",
    });
    testMuseumId = Number(museumResult[0].insertId);

    // 创建测试设计师资料
    const designerResult = await dbInstance.insert(designers).values({
      userId: testDesignerUserId,
      displayName: "测试设计师",
      bio: "这是一个测试设计师",
      type: "individual",
      organization: "测试机构",
    });
    testDesignerId = Number(designerResult[0].insertId);
  });

  it("应该能够获取博物馆资料", async () => {
    const museum = await db.getMuseumByUserId(testMuseumUserId);
    expect(museum).toBeDefined();
    expect(museum?.name).toBe("测试博物馆");
    expect(museum?.description).toBe("这是一个测试博物馆");
  });

  it("应该能够更新博物馆资料", async () => {
    const updatedMuseum = await db.updateMuseum(testMuseumId, {
      name: "更新后的博物馆名称",
      description: "更新后的描述",
    });
    expect(updatedMuseum).toBeDefined();
    expect(updatedMuseum?.name).toBe("更新后的博物馆名称");
    expect(updatedMuseum?.description).toBe("更新后的描述");
  });

  it("应该能够获取设计师资料", async () => {
    const designer = await db.getDesignerByUserId(testDesignerUserId);
    expect(designer).toBeDefined();
    expect(designer?.displayName).toBe("测试设计师");
    expect(designer?.bio).toBe("这是一个测试设计师");
  });

  it("应该能够更新设计师资料", async () => {
    const updatedDesigner = await db.updateDesigner(testDesignerId, {
      displayName: "更新后的设计师名称",
      bio: "更新后的简介",
    });
    expect(updatedDesigner).toBeDefined();
    expect(updatedDesigner?.displayName).toBe("更新后的设计师名称");
    expect(updatedDesigner?.bio).toBe("更新后的简介");
  });

  it("应该能够获取博物馆的征集列表", async () => {
    const collections = await db.getCollectionsByMuseumId(testMuseumId);
    expect(Array.isArray(collections)).toBe(true);
  });

  it("应该能够获取设计师的作品列表", async () => {
    const works = await db.getWorksByDesignerId(testDesignerId);
    expect(Array.isArray(works)).toBe(true);
  });

  it("应该能够获取用户的收藏列表", async () => {
    const favorites = await db.getFavoritesByUserId(testMuseumUserId);
    expect(Array.isArray(favorites)).toBe(true);
  });
});
