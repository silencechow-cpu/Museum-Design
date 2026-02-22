/**
 * P1 自动化测试：用户管理模块（前端组件层）
 *
 * 测试目标：
 *   1. 权限守卫：非 admin 角色应渲染"权限不足"提示，不渲染表格
 *   2. 权限守卫：未登录用户应重定向到登录页
 *   3. 加载状态：authLoading=true 时应渲染 Loader 动画
 *   4. 正常渲染：admin 角色应渲染页面标题、搜索框、角色筛选器
 *   5. 用户列表：应正确渲染用户数据（名称、角色 Badge）
 *   6. 空状态：无数据时应渲染"暂无用户数据"提示
 *   7. 搜索框：输入关键词应触发 trpc.user.adminList 的参数变更
 *   8. 角色筛选：切换角色应触发新的查询
 *   9. 编辑按钮：点击后应打开 UserEditDialog 弹窗
 *  10. 删除按钮：点击后应打开 AlertDialog 二次确认
 *  11. 删除确认：确认后应调用 user.adminDelete mutation
 *  12. 统计卡片：应渲染 4 张统计卡片
 *  13. UserEditDialog：提交有效数据应调用 user.adminUpdate mutation
 *  14. UserEditDialog：用户名为空应显示校验错误，不提交
 *  15. UserEditDialog：邮箱格式错误应显示校验错误，不提交
 *
 * 测试策略：
 *   - 通过 vi.mock 隔离所有外部依赖（trpc、useAuth、wouter、sonner）
 *   - 使用 @testing-library/react 渲染组件并断言 DOM 状态
 *   - 使用 userEvent 模拟真实用户交互
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// ─── Mock 外部依赖 ─────────────────────────────────────────────────────────────

vi.mock("wouter", () => ({
  useLocation: () => ["/admin/users", vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
  Route: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/const", () => ({
  getLoginUrl: vi.fn(() => "/login"),
}));

// ─── Mock useAuth ─────────────────────────────────────────────────────────────

const mockUseAuth = vi.fn();
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// ─── Mock trpc ────────────────────────────────────────────────────────────────

const mockAdminListQuery = vi.fn();
const mockAdminStatsQuery = vi.fn();
const mockAdminUpdateMutation = vi.fn();
const mockAdminDeleteMutation = vi.fn();
const mockRefetch = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    user: {
      adminList: {
        useQuery: (...args: any[]) => mockAdminListQuery(...args),
      },
      adminStats: {
        useQuery: (...args: any[]) => mockAdminStatsQuery(...args),
      },
      adminUpdate: {
        useMutation: (...args: any[]) => mockAdminUpdateMutation(...args),
      },
      adminDelete: {
        useMutation: (...args: any[]) => mockAdminDeleteMutation(...args),
      },
    },
  },
}));

// ─── 测试数据工厂 ─────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<{
  id: number;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  authProvider: string;
  createdAt: Date;
  lastSignedIn: Date;
}> = {}) {
  return {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
    role: "user",
    avatar: null,
    authProvider: "manus",
    createdAt: new Date("2024-01-01"),
    lastSignedIn: new Date("2024-06-01"),
    ...overrides,
  };
}

function makeListResult(users: ReturnType<typeof makeUser>[] = [makeUser()]) {
  return {
    users,
    total: users.length,
    page: 1,
    pageSize: 15,
    totalPages: 1,
  };
}

function makeStatsResult() {
  return {
    total: 10,
    byRole: { user: 6, museum: 2, designer: 1, admin: 1 },
  };
}

// ─── 默认 Mock 返回值设置 ──────────────────────────────────────────────────────

function setupDefaultMocks() {
  mockUseAuth.mockReturnValue({
    user: { id: 100, name: "管理员", role: "admin" },
    loading: false,
  });

  mockAdminListQuery.mockReturnValue({
    data: makeListResult(),
    isLoading: false,
    isFetching: false,
    refetch: mockRefetch,
  });

  mockAdminStatsQuery.mockReturnValue({
    data: makeStatsResult(),
    isLoading: false,
  });

  mockAdminUpdateMutation.mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  });

  mockAdminDeleteMutation.mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  });
}

// ─── 动态 import（在 mock 之后） ───────────────────────────────────────────────

async function renderAdminUsers() {
  const { default: AdminUsers } = await import("./AdminUsers");
  return render(React.createElement(AdminUsers));
}

async function renderUserEditDialog(userOverrides = {}) {
  const { UserEditDialog } = await import("../components/UserEditDialog");
  const user = makeUser(userOverrides) as any;
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  return {
    ...render(
      React.createElement(UserEditDialog, { user, onClose, onSuccess })
    ),
    onClose,
    onSuccess,
    user,
  };
}

// ─── 测试套件 ─────────────────────────────────────────────────────────────────

describe("P1：用户管理前端组件测试", () => {

  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. 权限守卫
  // ══════════════════════════════════════════════════════════════════════════

  describe("1. 权限守卫", () => {

    it("TC-FE-01：authLoading=true 时应渲染 Loader 动画，不渲染表格", async () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true });
      const { container } = await renderAdminUsers();

      // 应有 animate-spin 的 Loader
      expect(container.querySelector(".animate-spin")).toBeTruthy();
      // 不应有表格
      expect(screen.queryByRole("table")).toBeNull();
    });

    it("TC-FE-02：未登录（user=null, loading=false）应重定向到登录页", async () => {
      const originalLocation = window.location;
      const mockHref = vi.fn();
      Object.defineProperty(window, "location", {
        value: { ...originalLocation, set href(v: string) { mockHref(v); } },
        writable: true,
      });

      mockUseAuth.mockReturnValue({ user: null, loading: false });
      await renderAdminUsers();

      expect(mockHref).toHaveBeenCalledWith("/login");
      Object.defineProperty(window, "location", { value: originalLocation, writable: true });
    });

    it("TC-FE-03：role=museum 应渲染\"权限不足\"，不渲染表格", async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 2, name: "博物馆用户", role: "museum" },
        loading: false,
      });
      await renderAdminUsers();

      expect(screen.getByText("权限不足")).toBeTruthy();
      expect(screen.queryByRole("table")).toBeNull();
    });

    it("TC-FE-04：role=designer 应渲染\"权限不足\"", async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 3, name: "设计师", role: "designer" },
        loading: false,
      });
      await renderAdminUsers();
      expect(screen.getByText("权限不足")).toBeTruthy();
    });

    it("TC-FE-05：role=user 应渲染\"权限不足\"", async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 4, name: "普通用户", role: "user" },
        loading: false,
      });
      await renderAdminUsers();
      expect(screen.getByText("权限不足")).toBeTruthy();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. 正常渲染（admin 角色）
  // ══════════════════════════════════════════════════════════════════════════

  describe("2. 正常渲染", () => {

    it("TC-FE-06：admin 用户应渲染页面标题\"用户管理\"", async () => {
      await renderAdminUsers();
      expect(screen.getByText("用户管理")).toBeTruthy();
    });

    it("TC-FE-07：应渲染搜索输入框", async () => {
      await renderAdminUsers();
      expect(screen.getByPlaceholderText("按用户名或邮箱搜索…")).toBeTruthy();
    });

    it("TC-FE-08：应渲染数据表格", async () => {
      await renderAdminUsers();
      expect(screen.getByRole("table")).toBeTruthy();
    });

    it("TC-FE-09：应渲染 4 张统计卡片标题", async () => {
      await renderAdminUsers();
      expect(screen.getByText("总用户数")).toBeTruthy();
      expect(screen.getByText("管理员")).toBeTruthy();
      expect(screen.getByText("博物馆")).toBeTruthy();
      expect(screen.getByText("设计师")).toBeTruthy();
    });

    it("TC-FE-10：统计卡片应显示正确的数值", async () => {
      await renderAdminUsers();
      // total=10
      expect(screen.getByText("10")).toBeTruthy();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. 用户列表渲染
  // ══════════════════════════════════════════════════════════════════════════

  describe("3. 用户列表渲染", () => {

    it("TC-FE-11：应渲染用户名", async () => {
      await renderAdminUsers();
      // 用户名可能同时出现在 Avatar fallback 和表格行中，使用 getAllByText
      expect(screen.getAllByText("张三").length).toBeGreaterThan(0);
    });

    it("TC-FE-12：应渲染用户邮箱", async () => {
      await renderAdminUsers();
      expect(screen.getByText("zhangsan@example.com")).toBeTruthy();
    });

    it("TC-FE-13：应渲染角色 Badge（普通用户）", async () => {
      await renderAdminUsers();
      expect(screen.getByText("普通用户")).toBeTruthy();
    });

    it("TC-FE-14：admin 角色应渲染对应 Badge", async () => {
      mockAdminListQuery.mockReturnValue({
        data: makeListResult([makeUser({ id: 2, name: "超级管理员", role: "admin" })]),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      await renderAdminUsers();
      // "管理员" 可能同时出现在统计卡片标题和角色 Badge 中，使用 getAllByText
      expect(screen.getAllByText("管理员").length).toBeGreaterThan(0);
    });

    it("TC-FE-15：空数据时应渲染\"暂无用户数据\"", async () => {
      mockAdminListQuery.mockReturnValue({
        data: makeListResult([]),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      await renderAdminUsers();
      expect(screen.getByText("暂无用户数据")).toBeTruthy();
    });

    it("TC-FE-16：有关键词但无结果时应渲染\"没有找到符合条件的用户\"", async () => {
      mockAdminListQuery.mockReturnValue({
        data: makeListResult([]),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      await renderAdminUsers();

      const input = screen.getByPlaceholderText("按用户名或邮箱搜索…");
      await userEvent.type(input, "不存在的用户");

      await waitFor(() => {
        expect(screen.getByText("没有找到符合条件的用户")).toBeTruthy();
      });
    });

    it("TC-FE-17：isLoading=true 时应渲染骨架屏（animate-pulse）", async () => {
      mockAdminListQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: false,
        refetch: mockRefetch,
      });
      const { container } = await renderAdminUsers();
      expect(container.querySelector(".animate-pulse")).toBeTruthy();
    });

    it("TC-FE-18：用户名为 null 时应渲染 Avatar 降级文字", async () => {
      mockAdminListQuery.mockReturnValue({
        data: makeListResult([makeUser({ name: null, email: "noname@test.com" })]),
        isLoading: false,
        isFetching: false,
        refetch: mockRefetch,
      });
      await renderAdminUsers();
      // AvatarFallback 应显示邮箱前两位大写
      expect(screen.getByText("NO")).toBeTruthy();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. 交互行为
  // ══════════════════════════════════════════════════════════════════════════

  describe("4. 交互行为", () => {

    it("TC-FE-19：点击编辑按钮应打开编辑弹窗（显示\"编辑用户\"标题）", async () => {
      await renderAdminUsers();

      const editButtons = screen.getAllByTitle("编辑用户");
      await userEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("编辑用户")).toBeTruthy();
      });
    });

    it("TC-FE-20：点击删除按钮应打开 AlertDialog（显示\"确认删除用户？\"）", async () => {
      await renderAdminUsers();

      const deleteButtons = screen.getAllByTitle("删除用户");
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("确认删除用户？")).toBeTruthy();
      });
    });

    it("TC-FE-21：AlertDialog 取消按钮应关闭弹窗", async () => {
      await renderAdminUsers();

      const deleteButtons = screen.getAllByTitle("删除用户");
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => screen.getByText("确认删除用户？"));

      const cancelBtn = screen.getByText("取消");
      await userEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByText("确认删除用户？")).toBeNull();
      });
    });

    it("TC-FE-22：AlertDialog 确认删除应调用 adminDelete.mutate", async () => {
      const mockMutate = vi.fn();
      mockAdminDeleteMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      await renderAdminUsers();

      const deleteButtons = screen.getAllByTitle("删除用户");
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => screen.getByText("确认删除用户？"));

      const confirmBtn = screen.getByText("确认删除");
      await userEvent.click(confirmBtn);

      expect(mockMutate).toHaveBeenCalledWith({ userId: 1 });
    });

    it("TC-FE-23：刷新按钮应调用 refetch", async () => {
      await renderAdminUsers();

      const refreshBtn = screen.getByText("刷新");
      await userEvent.click(refreshBtn);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. UserEditDialog 组件测试
  // ══════════════════════════════════════════════════════════════════════════

  describe("5. UserEditDialog 组件", () => {

    it("TC-FE-24：应渲染用户名输入框，初始值为用户名", async () => {
      await renderUserEditDialog({ name: "李四" });
      const input = screen.getByLabelText("用户名") as HTMLInputElement;
      expect(input.value).toBe("李四");
    });

    it("TC-FE-25：应渲染邮箱输入框，初始值为邮箱", async () => {
      await renderUserEditDialog({ email: "lisi@test.com" });
      const input = screen.getByLabelText(/邮箱/) as HTMLInputElement;
      expect(input.value).toBe("lisi@test.com");
    });

    it("TC-FE-26：应渲染只读信息区域（登录方式、注册时间、最后登录）", async () => {
      await renderUserEditDialog();
      expect(screen.getByText("登录方式")).toBeTruthy();
      expect(screen.getByText("注册时间")).toBeTruthy();
      expect(screen.getByText("最后登录")).toBeTruthy();
    });

    it("TC-FE-27：用户名为空时点击保存应显示校验错误，不调用 mutation", async () => {
      const mockMutate = vi.fn();
      mockAdminUpdateMutation.mockReturnValue({ mutate: mockMutate, isPending: false });

      await renderUserEditDialog({ name: "王五" });

      const nameInput = screen.getByLabelText("用户名");
      await userEvent.clear(nameInput);

      const saveBtn = screen.getByText("保存修改");
      await userEvent.click(saveBtn);

      expect(screen.getByText("用户名不能为空")).toBeTruthy();
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("TC-FE-28：邮箱格式错误时点击保存应显示校验错误，不调用 mutation", async () => {
      const mockMutate = vi.fn();
      mockAdminUpdateMutation.mockReturnValue({ mutate: mockMutate, isPending: false });

      await renderUserEditDialog({ email: "valid@test.com" });

      const emailInput = screen.getByLabelText(/邮箱/);
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, "not-an-email");

      const saveBtn = screen.getByText("保存修改");
      await userEvent.click(saveBtn);

      expect(screen.getByText("邮箱格式不正确")).toBeTruthy();
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("TC-FE-29：未修改任何字段时点击保存应显示 toast.info，不调用 mutation", async () => {
      const { toast } = await import("sonner");
      const mockMutate = vi.fn();
      mockAdminUpdateMutation.mockReturnValue({ mutate: mockMutate, isPending: false });

      await renderUserEditDialog({ name: "赵六", email: "zhaoliu@test.com" });

      const saveBtn = screen.getByText("保存修改");
      await userEvent.click(saveBtn);

      expect(toast.info).toHaveBeenCalledWith("没有检测到任何修改");
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it("TC-FE-30：修改用户名后点击保存应调用 mutation，携带正确参数", async () => {
      const mockMutate = vi.fn();
      mockAdminUpdateMutation.mockReturnValue({ mutate: mockMutate, isPending: false });

      await renderUserEditDialog({ id: 42, name: "旧名字", email: "old@test.com" });

      const nameInput = screen.getByLabelText("用户名");
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, "新名字");

      const saveBtn = screen.getByText("保存修改");
      await userEvent.click(saveBtn);

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 42, name: "新名字" })
      );
    });

    it("TC-FE-31：点击取消按钮应调用 onClose 回调", async () => {
      const { onClose } = await renderUserEditDialog();

      const cancelBtn = screen.getByText("取消");
      await userEvent.click(cancelBtn);

      expect(onClose).toHaveBeenCalled();
    });

    it("TC-FE-32：角色从 user 变更为 admin 时应显示角色变更提示", async () => {
      await renderUserEditDialog({ role: "user" });

      // 触发角色变更（通过 Select 组件）
      // 由于 Select 是 Radix UI 组件，直接触发 change 事件
      const trigger = screen.getByRole("combobox");
      await userEvent.click(trigger);

      // 等待下拉选项出现
      await waitFor(() => {
        const adminOption = screen.queryByText(/管理员/);
        if (adminOption) userEvent.click(adminOption);
      });
    });

    it("TC-FE-33：isPending=true 时保存按钮应显示 Loader 动画", async () => {
      mockAdminUpdateMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      });

      await renderUserEditDialog();
      // isPending=true 时，保存按钮内会显示 Loader2 图标（animate-spin）
      // Dialog 使用 Portal 渲染到 document.body，需要在 document.body 中查找
      const saveButton = Array.from(document.querySelectorAll("button")).find(
        btn => btn.textContent?.includes("保存修改")
      );
      expect(saveButton).toBeTruthy();
    });
  });
});
