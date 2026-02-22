/**
 * 用户编辑弹窗组件（管理员专用）
 *
 * 功能：
 *   - 修改用户名
 *   - 修改邮箱
 *   - 修改角色（含最后一个 admin 降级保护提示）
 *   - 操作成功/失败均通过 sonner toast 反馈
 */

import React, { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Building2, Palette, User } from "lucide-react";

/** 与 Schema 保持一致的角色列表 */
const ROLE_OPTIONS: {
  value: "user" | "admin" | "museum" | "designer";
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "user",
    label: "普通用户",
    icon: <User className="w-3.5 h-3.5" />,
    description: "未入驻，仅可浏览内容",
  },
  {
    value: "museum",
    label: "博物馆",
    icon: <Building2 className="w-3.5 h-3.5" />,
    description: "可发布征集活动",
  },
  {
    value: "designer",
    label: "设计师",
    icon: <Palette className="w-3.5 h-3.5" />,
    description: "可提交作品参与征集",
  },
  {
    value: "admin",
    label: "管理员",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    description: "拥有全平台管理权限",
  },
];

export interface EditableUser {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin" | "museum" | "designer";
  avatar: string | null;
  authProvider: string;
  createdAt: Date;
  lastSignedIn: Date;
}

interface UserEditDialogProps {
  user: EditableUser;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserEditDialog({ user, onClose, onSuccess }: UserEditDialogProps) {
  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [role, setRole] = useState<EditableUser["role"]>(user.role);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const updateMutation = trpc.user.adminUpdate.useMutation({
    onSuccess: (updated) => {
      toast.success(`用户「${updated?.name ?? updated?.email ?? "未知"}」已更新`);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`更新失败：${error.message}`);
    },
  });

  /** 前端表单校验 */
  const validate = (): boolean => {
    let valid = true;
    setNameError("");
    setEmailError("");

    if (name.trim().length === 0) {
      setNameError("用户名不能为空");
      valid = false;
    } else if (name.trim().length > 100) {
      setNameError("用户名不能超过 100 个字符");
      valid = false;
    }

    if (email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError("邮箱格式不正确");
        valid = false;
      }
    }

    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // 只提交有变化的字段
    const payload: {
      userId: number;
      name?: string;
      email?: string;
      role?: EditableUser["role"];
    } = { userId: user.id };

    if (name.trim() !== (user.name ?? "")) payload.name = name.trim();
    if (email.trim() !== (user.email ?? "")) payload.email = email.trim() || undefined;
    if (role !== user.role) payload.role = role;

    if (Object.keys(payload).length === 1) {
      toast.info("没有检测到任何修改");
      return;
    }

    updateMutation.mutate(payload);
  };

  const selectedRoleOption = ROLE_OPTIONS.find((r) => r.value === role);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
          <DialogDescription>
            修改用户 ID&nbsp;
            <span className="font-mono font-semibold text-foreground">
              #{user.id}
            </span>
            &nbsp;的基本信息和角色权限。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 用户名 */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">用户名</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="请输入用户名"
              disabled={updateMutation.isPending}
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>

          {/* 邮箱 */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">
              邮箱
              <span className="ml-1 text-xs text-muted-foreground">（可选）</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="请输入邮箱地址"
              disabled={updateMutation.isPending}
            />
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
          </div>

          {/* 角色 */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-role">角色权限</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as EditableUser["role"])}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        — {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 角色变更提示 */}
            {role !== user.role && (
              <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                <span>
                  角色将从&nbsp;
                  <Badge variant="outline" className="text-xs py-0">
                    {ROLE_OPTIONS.find((r) => r.value === user.role)?.label}
                  </Badge>
                  &nbsp;变更为&nbsp;
                  <Badge variant="outline" className="text-xs py-0">
                    {selectedRoleOption?.label}
                  </Badge>
                </span>
              </div>
            )}

            {/* admin 降级特别警告 */}
            {user.role === "admin" && role !== "admin" && (
              <p className="text-xs text-destructive">
                注意：降级管理员后，该用户将失去所有后台管理权限。系统会阻止降级最后一个管理员。
              </p>
            )}
          </div>

          {/* 只读信息 */}
          <div className="rounded-md bg-muted/50 px-3 py-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>登录方式</span>
              <span className="font-medium text-foreground capitalize">
                {user.authProvider}
              </span>
            </div>
            <div className="flex justify-between">
              <span>注册时间</span>
              <span className="font-medium text-foreground">
                {new Date(user.createdAt).toLocaleString("zh-CN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>最后登录</span>
              <span className="font-medium text-foreground">
                {new Date(user.lastSignedIn).toLocaleString("zh-CN")}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            保存修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
