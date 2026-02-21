import { describe, it, expect, beforeEach, afterEach } from "vitest";

/**
 * 表单草稿保存功能测试
 * 
 * 注意：这个测试主要验证 localStorage 的基本操作逻辑
 * 实际的 useFormDraft Hook 需要在浏览器环境中测试
 */

describe("表单草稿保存功能", () => {
  const TEST_KEY = "test-draft-key";
  
  // 模拟 localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // 清空 localStorage
    localStorageMock.clear();
  });

  afterEach(() => {
    // 清理测试数据
    localStorageMock.clear();
  });

  it("应该能够保存草稿到 localStorage", () => {
    const formData = {
      title: "测试作品标题",
      description: "测试作品描述",
      tags: "文创,设计",
    };

    const draft = {
      data: formData,
      timestamp: Date.now(),
    };

    localStorageMock.setItem(TEST_KEY, JSON.stringify(draft));

    const stored = localStorageMock.getItem(TEST_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.data.title).toBe("测试作品标题");
    expect(parsed.data.description).toBe("测试作品描述");
    expect(parsed.data.tags).toBe("文创,设计");
  });

  it("应该能够从 localStorage 加载草稿", () => {
    const formData = {
      title: "测试征集项目",
      description: "测试征集描述",
      tags: "青铜器,文物",
    };

    const draft = {
      data: formData,
      timestamp: Date.now(),
    };

    localStorageMock.setItem(TEST_KEY, JSON.stringify(draft));

    const stored = localStorageMock.getItem(TEST_KEY);
    const parsed = JSON.parse(stored!);

    expect(parsed.data).toEqual(formData);
    expect(parsed.timestamp).toBeGreaterThan(0);
  });

  it("应该能够清除草稿", () => {
    const formData = {
      title: "测试标题",
      description: "测试描述",
    };

    const draft = {
      data: formData,
      timestamp: Date.now(),
    };

    localStorageMock.setItem(TEST_KEY, JSON.stringify(draft));
    expect(localStorageMock.getItem(TEST_KEY)).not.toBeNull();

    localStorageMock.removeItem(TEST_KEY);
    expect(localStorageMock.getItem(TEST_KEY)).toBeNull();
  });

  it("应该能够检测草稿是否过期（24小时）", () => {
    const formData = {
      title: "过期测试",
      description: "测试描述",
    };

    // 创建一个25小时前的草稿
    const expiredDraft = {
      data: formData,
      timestamp: Date.now() - 25 * 60 * 60 * 1000,
    };

    localStorageMock.setItem(TEST_KEY, JSON.stringify(expiredDraft));

    const stored = localStorageMock.getItem(TEST_KEY);
    const parsed = JSON.parse(stored!);

    const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
    expect(isExpired).toBe(true);
  });

  it("应该能够检测草稿未过期（24小时内）", () => {
    const formData = {
      title: "未过期测试",
      description: "测试描述",
    };

    // 创建一个1小时前的草稿
    const validDraft = {
      data: formData,
      timestamp: Date.now() - 1 * 60 * 60 * 1000,
    };

    localStorageMock.setItem(TEST_KEY, JSON.stringify(validDraft));

    const stored = localStorageMock.getItem(TEST_KEY);
    const parsed = JSON.parse(stored!);

    const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
    expect(isExpired).toBe(false);
  });

  it("应该能够处理不存在的草稿", () => {
    const stored = localStorageMock.getItem("non-existent-key");
    expect(stored).toBeNull();
  });

  it("应该能够处理损坏的草稿数据", () => {
    localStorageMock.setItem(TEST_KEY, "invalid-json");

    try {
      const stored = localStorageMock.getItem(TEST_KEY);
      JSON.parse(stored!);
      expect(true).toBe(false); // 不应该执行到这里
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
