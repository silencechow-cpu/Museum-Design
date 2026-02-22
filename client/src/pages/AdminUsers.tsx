/**
 * 用户管理页面（管理员专用）
 *
 * 功能：
 *   - 分页展示平台所有用户
 *   - 按关键词（用户名/邮箱）实时搜索（300ms 防抖）
 *   - 按角色筛选
 *   - 按注册时间/最后登录/用户名排序
 *   - 点击编辑按钮打开 UserEditDialog 弹窗
 *   - 删除用户（含二次确认）
 *   - 顶部统计卡片展示用户分布
 *
 * 权限：仅 admin 角色可访问，其他角色重定向至登录页
 */

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Search,
  Edit,
  Trash2,
  Users,
  ShieldCheck,
  Building2,
  Palette,
  User,
  RefreshCw,
} from "lucide-react";

import { UserEditDialog, type EditableUser } from "@/components/UserEditDialog";

// ─── 类型 ────────────────────────────────────────────────────────────────────

type Role = "user" | "admin" | "museum" | "designer";
type SortBy = "createdAt" | "lastSignedIn" | "name";
type SortOrder = "asc" | "desc";

// ─── 常量 ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const ROLE_FILTER_OPTIONS: { value: Role | "all"; label: string }[] = [
  { value: "all", label: "全部角色" },
  { value: "user", label: "普通用户" },
  { value: "museum", label: "博物馆" },
  { value: "designer", label: "设计师" },
  { value: "admin", label: "管理员" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "createdAt", label: "注册时间" },
  { value: "lastSignedIn", label: "最后登录" },
  { value: "name", label: "用户名" },
];

// ─── 辅助函数 ─────────────────────────────────────────────────────────────────

function getRoleBadge(role: Role) {
  const map: Record<Role, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
    admin: { label: "管理员", variant: "destructive", icon: <ShieldCheck className="w-3 h-3" /> },
    museum: { label: "博物馆", variant: "secondary", icon: <Building2 className="w-3 h-3" /> },
    designer: { label: "设计师", variant: "outline", icon: <Palette className="w-3 h-3" /> },
    user: { label: "普通用户", variant: "default", icon: <User className="w-3 h-3" /> },
  };
  const { label, variant, icon } = map[role] ?? map.user;
  return (
    <Badge variant={variant} className="gap-1 text-xs">
      {icon}
      {label}
    </Badge>
  );
}

function getAvatarFallback(name: string | null, email: string | null): string {
  const source = name ?? email ?? "?";
  return source.slice(0, 2).toUpperCase();
}

/** 简单的内联 useDebounce，避免引入外部依赖 */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── 统计卡片 ─────────────────────────────────────────────────────────────────

function StatsCards() {
  const { data, isLoading } = trpc.user.adminStats.useQuery();

  const cards = [
    {
      title: "总用户数",
      value: data?.total ?? 0,
      icon: <Users className="w-5 h-5 text-muted-foreground" />,
    },
    {
      title: "管理员",
      value: data?.byRole?.admin ?? 0,
      icon: <ShieldCheck className="w-5 h-5 text-destructive" />,
    },
    {
      title: "博物馆",
      value: data?.byRole?.museum ?? 0,
      icon: <Building2 className="w-5 h-5 text-blue-500" />,
    },
    {
      title: "设计师",
      value: data?.byRole?.designer ?? 0,
      icon: <Palette className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── 分页组件 ─────────────────────────────────────────────────────────────────

interface TablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function TablePagination({ page, totalPages, total, pageSize, onPageChange }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // 生成显示的页码列表（最多显示 5 个）
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        共 <span className="font-medium text-foreground">{total}</span> 条，
        当前显示第 {start}–{end} 条
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); if (page > 1) onPageChange(page - 1); }}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {getPageNumbers().map((p, idx) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => { e.preventDefault(); onPageChange(p); }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); if (page < totalPages) onPageChange(page + 1); }}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const { user: currentUser, loading: authLoading } = useAuth();

  // 筛选 & 排序状态
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // 弹窗状态
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deletingUserName, setDeletingUserName] = useState<string>("");

  const debouncedKeyword = useDebounce(keyword, 300);

  // 关键词或筛选条件变化时重置到第一页
  const prevKeyword = useRef(debouncedKeyword);
  const prevRole = useRef(roleFilter);
  useEffect(() => {
    if (debouncedKeyword !== prevKeyword.current || roleFilter !== prevRole.current) {
      setPage(1);
      prevKeyword.current = debouncedKeyword;
      prevRole.current = roleFilter;
    }
  }, [debouncedKeyword, roleFilter]);

  // 查询用户列表
  const { data, isLoading, isFetching, refetch } = trpc.user.adminList.useQuery(
    {
      page,
      pageSize: PAGE_SIZE,
      keyword: debouncedKeyword || undefined,
      role: roleFilter === "all" ? undefined : roleFilter,
      sortBy,
      sortOrder,
    },
    { placeholderData: (prev: any) => prev }
  );

  // 删除 mutation
  const deleteMutation = trpc.user.adminDelete.useMutation({
    onSuccess: () => {
      toast.success(`用户「${deletingUserName}」已删除`);
      setDeletingUserId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`删除失败：${error.message}`);
      setDeletingUserId(null);
    },
  });

  // ── 权限守卫 ──────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentUser) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>权限不足</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              只有管理员可以访问用户管理页面。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── 事件处理 ──────────────────────────────────────────────────────────────

  const handleSortChange = (field: SortBy) => {
    if (field === sortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleDeleteClick = (userId: number, userName: string) => {
    setDeletingUserId(userId);
    setDeletingUserName(userName);
  };

  const handleDeleteConfirm = () => {
    if (deletingUserId !== null) {
      deleteMutation.mutate({ userId: deletingUserId });
    }
  };

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // ── 渲染 ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              查看、搜索和管理平台所有用户账号
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>

        {/* 统计卡片 */}
        <StatsCards />

        {/* 筛选工具栏 */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 关键词搜索 */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="按用户名或邮箱搜索…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          {/* 角色筛选 */}
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as Role | "all")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 排序字段 */}
          <Select
            value={sortBy}
            onValueChange={(v) => handleSortChange(v as SortBy)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                  {sortBy === opt.value && (
                    <span className="ml-1 text-muted-foreground">
                      {sortOrder === "desc" ? "↓" : "↑"}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 用户表格 */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">ID</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>登录方式</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground select-none"
                  onClick={() => handleSortChange("createdAt")}
                >
                  注册时间
                  {sortBy === "createdAt" && (
                    <span className="ml-1">{sortOrder === "desc" ? "↓" : "↑"}</span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground select-none"
                  onClick={() => handleSortChange("lastSignedIn")}
                >
                  最后登录
                  {sortBy === "lastSignedIn" && (
                    <span className="ml-1">{sortOrder === "desc" ? "↓" : "↑"}</span>
                  )}
                </TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                // 骨架屏
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                    {keyword || roleFilter !== "all"
                      ? "没有找到符合条件的用户"
                      : "暂无用户数据"}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow
                    key={u.id}
                    className={`transition-colors ${isFetching ? "opacity-60" : ""}`}
                  >
                    {/* ID */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{u.id}
                    </TableCell>

                    {/* 用户（头像 + 名称） */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={u.avatar ?? undefined} alt={u.name ?? ""} />
                          <AvatarFallback className="text-xs">
                            {getAvatarFallback(u.name, u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {u.name ?? (
                            <span className="text-muted-foreground italic">未设置</span>
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* 邮箱 */}
                    <TableCell className="text-sm text-muted-foreground">
                      {u.email ?? "—"}
                    </TableCell>

                    {/* 角色 */}
                    <TableCell>{getRoleBadge(u.role as Role)}</TableCell>

                    {/* 登录方式 */}
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {u.authProvider}
                      </Badge>
                    </TableCell>

                    {/* 注册时间 */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                    </TableCell>

                    {/* 最后登录 */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(u.lastSignedIn).toLocaleDateString("zh-CN")}
                    </TableCell>

                    {/* 操作按钮 */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="编辑用户"
                          onClick={() => setEditingUser(u as EditableUser)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="删除用户"
                          disabled={u.id === currentUser.id}
                          onClick={() =>
                            handleDeleteClick(u.id, u.name ?? u.email ?? `#${u.id}`)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {/* 编辑弹窗 */}
      {editingUser && (
        <UserEditDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            refetch();
          }}
        />
      )}

      {/* 删除确认弹窗 */}
      <AlertDialog
        open={deletingUserId !== null}
        onOpenChange={(open) => !open && setDeletingUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除用户？</AlertDialogTitle>
            <AlertDialogDescription>
              您即将永久删除用户&nbsp;
              <span className="font-semibold text-foreground">
                「{deletingUserName}」
              </span>
              。此操作不可撤销，该用户的所有数据将被移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
