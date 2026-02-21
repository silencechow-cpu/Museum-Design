import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import type { Request, Response } from "express";

// Mock user for testing - use random IDs within safe range
const randomId = Math.floor(Math.random() * 1000000) + 100000;

const mockMuseumUser = {
  id: randomId,
  openId: `test-museum-user-${randomId}`,
  name: "Test Museum User",
  email: `museum-${randomId}@test.com`,
  role: "user" as const,
  loginMethod: "oauth",
  lastSignedIn: new Date(),
};

const mockDesignerUser = {
  id: randomId + 1,
  openId: `test-designer-user-${randomId + 1}`,
  name: "Test Designer User",
  email: `designer-${randomId + 1}@test.com`,
  role: "user" as const,
  loginMethod: "oauth",
  lastSignedIn: new Date(),
};

// Create mock context
function createMockContext(user: typeof mockMuseumUser | null): Context {
  return {
    user,
    req: {} as Request,
    res: {} as Response,
  };
}

describe("Onboarding Flow", () => {
  const caller = appRouter.createCaller(createMockContext(mockMuseumUser));

  it("should check onboarding status for new user", async () => {
    const status = await caller.auth.checkOnboardingStatus();
    
    expect(status).toBeDefined();
    expect(status).toHaveProperty("needsOnboarding");
    expect(status).toHaveProperty("userType");
  });

  it("should create museum profile", async () => {
    const museumData = {
      name: "测试博物馆",
      description: "这是一个测试博物馆",
      address: "测试地址123号",
      contactEmail: "contact@museum.test",
      contactPhone: "1234567890",
      website: "https://museum.test",
    };

    const result = await caller.museum.create(museumData);
    
    expect(result).toBeDefined();
    expect(result.name).toBe(museumData.name);
    expect(result.userId).toBe(mockMuseumUser.id);
  });

  it("should create designer profile", async () => {
    const designerCaller = appRouter.createCaller(createMockContext(mockDesignerUser));
    
    const designerData = {
      displayName: "测试设计师",
      bio: "这是一个测试设计师的简介",
      type: "individual" as const,
      organization: "测试机构",
      portfolio: "https://portfolio.test",
    };

    const result = await designerCaller.designer.create(designerData);
    
    expect(result).toBeDefined();
    expect(result.displayName).toBe(designerData.displayName);
    expect(result.userId).toBe(mockDesignerUser.id);
  });

  it("should return correct onboarding status after profile creation", async () => {
    // After creating museum profile, user should not need onboarding
    const status = await caller.auth.checkOnboardingStatus();
    
    // User type should be 'museum' after creating museum profile
    expect(status.userType).toBe("museum");
  });
});
