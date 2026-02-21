/**
 * 个人资料编辑页面
 * 移动端优先设计
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Camera, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("个人资料已更新");
      setLocation("/profile");
    },
    onError: (error) => {
      toast.error(`保存失败：${error.message}`);
    },
  });

  const uploadAvatarMutation = trpc.auth.uploadAvatar.useMutation({
    onSuccess: () => {
      toast.success("头像已更新");
    },
    onError: (error) => {
      toast.error(`上传失败：${error.message}`);
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 先上传头像（如果有）
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await uploadAvatarMutation.mutateAsync({
          imageData: reader.result as string,
        });
        
        // 然后更新其他资料
        await updateProfileMutation.mutateAsync({
          name: name || undefined,
          email: email || undefined,
        });
      };
      reader.readAsDataURL(avatarFile);
    } else {
      // 只更新资料
      await updateProfileMutation.mutateAsync({
        name: name || undefined,
        email: email || undefined,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* 返回按钮 */}
      <div className="max-w-2xl mx-auto mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/profile")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回个人中心
        </Button>
      </div>

      {/* 编辑表单 */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">编辑个人资料</CardTitle>
          <CardDescription>
            更新您的个人信息和头像
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 头像上传 */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">
                      {name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">
                点击相机图标上传新头像
              </p>
            </div>

            {/* 姓名 */}
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入您的姓名"
                className="h-12 text-base"
              />
            </div>

            {/* 邮箱 */}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入您的邮箱"
                className="h-12 text-base"
              />
              <p className="text-sm text-gray-500">
                用于接收重要通知和找回密码
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/profile")}
                className="flex-1 h-12"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending || uploadAvatarMutation.isPending}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700"
              >
                {updateProfileMutation.isPending || uploadAvatarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    保存更改
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
