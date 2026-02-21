import { describe, it, expect, beforeAll } from "vitest";
import { updateCollectionStatus, getCollectionById } from "./db";
import { db } from "./db";
import { collections, museums, users } from "../drizzle/schema";

describe("征集项目状态管理", () => {
  let testMuseumId: number;
  let testCollectionId: number;
  let testUserId: number;

  beforeAll(async () => {
    // 创建测试用户
    const [user] = await db
      .insert(users)
      .values({
        openId: `test-user-${Date.now()}`,
        name: "测试用户",
        email: `test-${Date.now()}@example.com`,
      })
      .$returningId();
    testUserId = user.id;

    // 创建测试博物馆
    const [museum] = await db
      .insert(museums)
      .values({
        userId: testUserId,
        name: "测试博物馆",
        description: "用于测试的博物馆",
        address: "测试地址",
        contactEmail: `museum-${Date.now()}@example.com`,
      })
      .$returningId();
    testMuseumId = museum.id;

    // 创建测试征集项目
    const [collection] = await db
      .insert(collections)
      .values({
        museumId: testMuseumId,
        title: "测试征集项目",
        description: "用于测试状态管理的征集项目",
        artifactName: "测试文物",
        artifactDescription: "测试文物描述",
        prizeAmount: 10000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        status: "draft",
      })
      .$returningId();
    testCollectionId = collection.id;
  });

  it("应该能将征集项目从草稿状态改为征集中", async () => {
    await updateCollectionStatus(testCollectionId, "active");
    const collection = await getCollectionById(testCollectionId);
    expect(collection?.status).toBe("active");
  });

  it("应该能将征集中的项目暂停", async () => {
    await updateCollectionStatus(testCollectionId, "closed");
    const collection = await getCollectionById(testCollectionId);
    expect(collection?.status).toBe("closed");
  });

  it("应该能将暂停的项目继续征集", async () => {
    await updateCollectionStatus(testCollectionId, "active");
    const collection = await getCollectionById(testCollectionId);
    expect(collection?.status).toBe("active");
  });

  it("应该能结束征集项目", async () => {
    await updateCollectionStatus(testCollectionId, "completed");
    const collection = await getCollectionById(testCollectionId);
    expect(collection?.status).toBe("completed");
  });

  it("更新不存在的征集项目应该抛出错误", async () => {
    await expect(updateCollectionStatus(999999, "active")).rejects.toThrow();
  });
});
