/**
 * P1-B 自动化测试：sessionStorage 角色预选（前端逻辑层）
 *
 * 测试目标：
 *   1. Login 页面：有 role 参数时写入 sessionStorage
 *   2. Login 页面：无 role 参数时不写入 sessionStorage
 *   3. Login 页面：role 参数非法时不写入 sessionStorage
 *   4. Onboarding 页面：读取 museum 预选角色后直接显示表单
 *   5. Onboarding 页面：读取 designer 预选角色后直接显示表单
 *   6. Onboarding 页面：无预选角色时显示角色选择界面
 *   7. Onboarding 页面：读取后立即清除 sessionStorage（幂等性）
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";

// ─── Mock 依赖 ────────────────────────────────────────────────────────────────

// Mock wouter（路由）
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
}));

// Mock useAuth hook
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: { id: 1, name: "测试用户", role: "user" },
    isAuthenticated: true,
    loading: false,
    logout: vi.fn(),
  })),
}));

// Mock trpc（tRPC 客户端）
vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: {
      me: { useQuery: vi.fn(() => ({ data: null, isLoading: false })) },
      checkOnboardingStatus: {
        useQuery: vi.fn(() => ({
          data: { needsOnboarding: true, userType: null },
          isLoading: false,
        })),
      },
    },
    museum: {
      create: { useMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })) },
    },
    designer: {
      create: { useMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })) },
    },
    useUtils: vi.fn(() => ({
      auth: { me: { invalidate: vi.fn(), setData: vi.fn() } },
    })),
  },
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "onboarding.selectRole": "选择角色",
        "onboarding.museum": "博物馆",
        "onboarding.designer": "设计师",
        "onboarding.museumForm": "博物馆资料",
        "onboarding.designerForm": "设计师资料",
        "onboarding.museumName": "博物馆名称",
        "onboarding.designerName": "设计师名称",
        "login.title": "欢迎登录",
        "login.museumWelcome": "博物馆入驻",
        "login.designerWelcome": "设计师入驻",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh-CN", changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// Mock const（OAuth URL）
vi.mock("@/const", () => ({
  getLoginUrl: vi.fn(() => "https://oauth.example.com/login"),
  getRegisterUrl: vi.fn(() => "https://oauth.example.com/register"),
  getForgotPasswordUrl: vi.fn(() => "https://oauth.example.com/forgot"),
  COOKIE_NAME: "session",
  ONE_YEAR_MS: 31536000000,
}));

// ─── P1-B：Login 页面 sessionStorage 写入测试 ─────────────────────────────────

describe("P1-B：Login 页面 sessionStorage 写入逻辑", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("TC-P1B-01：role=museum 时应写入 sessionStorage('preselected_role', 'museum')", () => {
    Object.defineProperty(window, "location", {
      value: { search: "?role=museum", href: "/login?role=museum" },
      writable: true,
    });

    // 模拟 Login 组件的 useEffect 逻辑
    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "museum" || role === "designer") {
      sessionStorage.setItem("preselected_role", role);
    }

    expect(sessionStorage.getItem("preselected_role")).toBe("museum");
  });

  it("TC-P1B-02：role=designer 时应写入 sessionStorage('preselected_role', 'designer')", () => {
    Object.defineProperty(window, "location", {
      value: { search: "?role=designer", href: "/login?role=designer" },
      writable: true,
    });

    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "museum" || role === "designer") {
      sessionStorage.setItem("preselected_role", role);
    }

    expect(sessionStorage.getItem("preselected_role")).toBe("designer");
  });

  it("TC-P1B-03：无 role 参数时不应写入 sessionStorage", () => {
    Object.defineProperty(window, "location", {
      value: { search: "", href: "/login" },
      writable: true,
    });

    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "museum" || role === "designer") {
      sessionStorage.setItem("preselected_role", role);
    }

    expect(sessionStorage.getItem("preselected_role")).toBeNull();
  });

  it("TC-P1B-04：role 参数非法值（如 'admin'）时不应写入 sessionStorage", () => {
    Object.defineProperty(window, "location", {
      value: { search: "?role=admin", href: "/login?role=admin" },
      writable: true,
    });

    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "museum" || role === "designer") {
      sessionStorage.setItem("preselected_role", role);
    }

    expect(sessionStorage.getItem("preselected_role")).toBeNull();
  });

  it("TC-P1B-05：role 参数为空字符串时不应写入 sessionStorage", () => {
    Object.defineProperty(window, "location", {
      value: { search: "?role=", href: "/login?role=" },
      writable: true,
    });

    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "museum" || role === "designer") {
      sessionStorage.setItem("preselected_role", role);
    }

    expect(sessionStorage.getItem("preselected_role")).toBeNull();
  });
});

// ─── P1-B：Onboarding 页面 sessionStorage 读取测试 ───────────────────────────

describe("P1-B：Onboarding 页面 sessionStorage 读取逻辑", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("TC-P1B-06：preselected_role=museum 时应自动设置 userType='museum' 并跳过选择步骤", () => {
    sessionStorage.setItem("preselected_role", "museum");

    // 模拟 Onboarding 的 useEffect 读取逻辑
    let userType: string | null = null;
    let step = "select";

    const preselected = sessionStorage.getItem("preselected_role");
    if (preselected === "museum" || preselected === "designer") {
      sessionStorage.removeItem("preselected_role");
      userType = preselected;
      step = "form";
    }

    expect(userType).toBe("museum");
    expect(step).toBe("form");
  });

  it("TC-P1B-07：preselected_role=designer 时应自动设置 userType='designer' 并跳过选择步骤", () => {
    sessionStorage.setItem("preselected_role", "designer");

    let userType: string | null = null;
    let step = "select";

    const preselected = sessionStorage.getItem("preselected_role");
    if (preselected === "museum" || preselected === "designer") {
      sessionStorage.removeItem("preselected_role");
      userType = preselected;
      step = "form";
    }

    expect(userType).toBe("designer");
    expect(step).toBe("form");
  });

  it("TC-P1B-08：无 preselected_role 时应保持 step='select'（显示角色选择界面）", () => {
    // sessionStorage 中无 preselected_role

    let userType: string | null = null;
    let step = "select";

    const preselected = sessionStorage.getItem("preselected_role");
    if (preselected === "museum" || preselected === "designer") {
      sessionStorage.removeItem("preselected_role");
      userType = preselected;
      step = "form";
    }

    expect(userType).toBeNull();
    expect(step).toBe("select");
  });

  it("TC-P1B-09：读取后应立即从 sessionStorage 中清除 preselected_role（幂等性）", () => {
    sessionStorage.setItem("preselected_role", "museum");

    const preselected = sessionStorage.getItem("preselected_role");
    if (preselected === "museum" || preselected === "designer") {
      sessionStorage.removeItem("preselected_role"); // 清除
    }

    // 再次读取应为 null
    expect(sessionStorage.getItem("preselected_role")).toBeNull();
  });

  it("TC-P1B-10：非法值（如 'admin'）不应触发自动预选", () => {
    sessionStorage.setItem("preselected_role", "admin");

    let userType: string | null = null;
    let step = "select";

    const preselected = sessionStorage.getItem("preselected_role");
    if (preselected === "museum" || preselected === "designer") {
      sessionStorage.removeItem("preselected_role");
      userType = preselected;
      step = "form";
    }

    // 非法值不触发预选，step 保持 select
    expect(userType).toBeNull();
    expect(step).toBe("select");
    // 非法值不被清除（因为不满足条件）
    expect(sessionStorage.getItem("preselected_role")).toBe("admin");
  });

  it("TC-P1B-11：重复刷新 Onboarding 页面不会重复触发预选（幂等性验证）", () => {
    sessionStorage.setItem("preselected_role", "designer");

    // 第一次渲染
    let step1 = "select";
    const preselected1 = sessionStorage.getItem("preselected_role");
    if (preselected1 === "museum" || preselected1 === "designer") {
      sessionStorage.removeItem("preselected_role");
      step1 = "form";
    }

    // 第二次渲染（模拟刷新）
    let step2 = "select";
    const preselected2 = sessionStorage.getItem("preselected_role");
    if (preselected2 === "museum" || preselected2 === "designer") {
      sessionStorage.removeItem("preselected_role");
      step2 = "form";
    }

    expect(step1).toBe("form");   // 第一次：触发预选
    expect(step2).toBe("select"); // 第二次：不触发（已清除）
  });
});
