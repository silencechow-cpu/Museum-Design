import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Image Upload and Work Management", () => {
  let testUserId: number;
  let testDesignerId: number;

  beforeAll(async () => {
    const designerOpenId = "test-upload-designer-" + Date.now();

    // 创建测试设计师用户
    await db.upsertUser({
      openId: designerOpenId,
      name: "测试上传设计师",
      email: "upload-designer@test.com",
      role: "designer",
    });

    const designerUser = await db.getUserByOpenId(designerOpenId);
    if (designerUser) {
      testUserId = designerUser.id;

      // 创建设计师资料
      const designer = await db.createDesigner({
        userId: testUserId,
        displayName: "测试上传设计师",
        type: "individual",
      });
      if (designer) {
        testDesignerId = designer.id;
      }
    }
  });

  describe("Image Upload", () => {
    it("should upload single image to S3", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-upload-designer",
          name: "测试上传设计师",
          role: "designer",
        },
      });

      // 创建测试图片数据（1x1 像素的PNG图片）
      const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const result = await caller.upload.uploadImage({
        fileName: "test.png",
        fileData: testImageBase64,
        contentType: "image/png",
      });

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.url).toContain("http");
    });

    it("should upload multiple images", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-upload-designer",
          name: "测试上传设计师",
          role: "designer",
        },
      });

      const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const results = await caller.upload.uploadMultipleImages({
        files: [
          {
            fileName: "test1.png",
            fileData: testImageBase64,
            contentType: "image/png",
          },
          {
            fileName: "test2.png",
            fileData: testImageBase64,
            contentType: "image/png",
          },
        ],
      });

      expect(results).toBeDefined();
      expect(results.length).toBe(2);
      expect(results[0].url).toBeDefined();
      expect(results[1].url).toBeDefined();
    });

    it("should require authentication for upload", async () => {
      const caller = appRouter.createCaller({
        user: undefined,
      });

      const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      await expect(
        caller.upload.uploadImage({
          fileName: "test.png",
          fileData: testImageBase64,
          contentType: "image/png",
        })
      ).rejects.toThrow();
    });
  });

  describe("Work Management", () => {
    it("should get designer's works", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-upload-designer",
          name: "测试上传设计师",
          role: "designer",
        },
      });

      const works = await caller.work.getMyWorks();

      expect(Array.isArray(works)).toBe(true);
    });

    it("should get designer profile", async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          openId: "test-upload-designer",
          name: "测试上传设计师",
          role: "designer",
        },
      });

      const profile = await caller.designer.getMyProfile();

      expect(profile).toBeDefined();
      expect(profile?.userId).toBe(testUserId);
    });
  });
});
