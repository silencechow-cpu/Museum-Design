import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Building2, Palette, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type UserType = "museum" | "designer" | null;

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"select" | "form" | "complete">("select");
  const [userType, setUserType] = useState<UserType>(null);

  // 博物馆表单状态
  const [museumForm, setMuseumForm] = useState({
    name: "",
    description: "",
    address: "",
    contactEmail: user?.email || "",
    contactPhone: "",
    website: "",
  });

  // 设计师表单状态
  const [designerForm, setDesignerForm] = useState({
    displayName: user?.name || "",
    bio: "",
    type: "individual" as "individual" | "team" | "school",
    organization: "",
    portfolio: "",
  });

  const createMuseumMutation = trpc.museum.create.useMutation({
    onSuccess: () => {
      toast.success("博物馆资料创建成功！");
      // 跳转到引导页面
      setLocation("/onboarding-complete");
    },
    onError: (error) => {
      toast.error(error.message || "创建失败，请重试");
    },
  });

  const createDesignerMutation = trpc.designer.create.useMutation({
    onSuccess: () => {
      toast.success("设计师资料创建成功！");
      // 跳转到引导页面
      setLocation("/onboarding-complete");
    },
    onError: (error) => {
      toast.error(error.message || "创建失败，请重试");
    },
  });

  const handleSelectType = (type: UserType) => {
    setUserType(type);
    setStep("form");
  };

  const handleMuseumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!museumForm.name) {
      toast.error("请填写博物馆名称");
      return;
    }
    createMuseumMutation.mutate(museumForm);
  };

  const handleDesignerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designerForm.displayName) {
      toast.error("请填写显示名称");
      return;
    }
    createDesignerMutation.mutate(designerForm);
  };

  const handleComplete = () => {
    window.location.href = "/"; // 刷新页面以更新用户角色
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E] mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* 步骤指示器 */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step === "select" ? "text-[#C8102E]" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "select" ? "border-[#C8102E] bg-[#C8102E] text-white" : "border-muted"}`}>
              1
            </div>
            <span className="hidden sm:inline">选择身份</span>
          </div>
          <div className="w-12 h-0.5 bg-muted"></div>
          <div className={`flex items-center gap-2 ${step === "form" ? "text-[#C8102E]" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "form" ? "border-[#C8102E] bg-[#C8102E] text-white" : "border-muted"}`}>
              2
            </div>
            <span className="hidden sm:inline">填写资料</span>
          </div>
          <div className="w-12 h-0.5 bg-muted"></div>
          <div className={`flex items-center gap-2 ${step === "complete" ? "text-[#C8102E]" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "complete" ? "border-[#C8102E] bg-[#C8102E] text-white" : "border-muted"}`}>
              3
            </div>
            <span className="hidden sm:inline">完成</span>
          </div>
        </div>

        {/* 选择身份 */}
        {step === "select" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#2C1810] mb-2">欢迎来到古韵新创</h1>
              <p className="text-muted-foreground">请选择您的身份类型</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 博物馆卡片 */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-[#C8102E] group"
                onClick={() => handleSelectType("museum")}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#C8102E]/10 flex items-center justify-center group-hover:bg-[#C8102E]/20 transition-colors">
                    <Building2 className="w-8 h-8 text-[#C8102E]" />
                  </div>
                  <CardTitle className="text-xl">博物馆</CardTitle>
                  <CardDescription>
                    发布文创设计征集项目，寻找优秀设计师合作
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C8102E]"></div>
                      发布征集项目
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C8102E]"></div>
                      管理作品投稿
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C8102E]"></div>
                      评选优秀作品
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* 设计师卡片 */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-[#C8102E] group"
                onClick={() => handleSelectType("designer")}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#C8102E]/10 flex items-center justify-center group-hover:bg-[#C8102E]/20 transition-colors">
                    <Palette className="w-8 h-8 text-[#C8102E]" />
                  </div>
                  <CardTitle className="text-xl">设计师</CardTitle>
                  <CardDescription>
                    参与文创设计征集，展示您的创意才华
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C8102E]"></div>
                      参与征集项目
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C8102E]"></div>
                      提交设计作品
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C8102E]"></div>
                      赢取奖金荣誉
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 博物馆表单 */}
        {step === "form" && userType === "museum" && (
          <Card>
            <CardHeader>
              <CardTitle>完善博物馆资料</CardTitle>
              <CardDescription>请填写以下信息以完成注册</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMuseumSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">博物馆名称 *</Label>
                  <Input
                    id="name"
                    value={museumForm.name}
                    onChange={(e) => setMuseumForm({ ...museumForm, name: e.target.value })}
                    placeholder="请输入博物馆名称"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">简介</Label>
                  <Textarea
                    id="description"
                    value={museumForm.description}
                    onChange={(e) => setMuseumForm({ ...museumForm, description: e.target.value })}
                    placeholder="请简要介绍您的博物馆"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">地址</Label>
                  <Input
                    id="address"
                    value={museumForm.address}
                    onChange={(e) => setMuseumForm({ ...museumForm, address: e.target.value })}
                    placeholder="请输入博物馆地址"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">联系邮箱</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={museumForm.contactEmail}
                      onChange={(e) => setMuseumForm({ ...museumForm, contactEmail: e.target.value })}
                      placeholder="请输入联系邮箱"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">联系电话</Label>
                    <Input
                      id="contactPhone"
                      value={museumForm.contactPhone}
                      onChange={(e) => setMuseumForm({ ...museumForm, contactPhone: e.target.value })}
                      placeholder="请输入联系电话"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">官方网站</Label>
                  <Input
                    id="website"
                    type="url"
                    value={museumForm.website}
                    onChange={(e) => setMuseumForm({ ...museumForm, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("select")}
                    className="flex-1"
                  >
                    返回
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]"
                    disabled={createMuseumMutation.isPending}
                  >
                    {createMuseumMutation.isPending ? "提交中..." : "完成注册"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 设计师表单 */}
        {step === "form" && userType === "designer" && (
          <Card>
            <CardHeader>
              <CardTitle>完善设计师资料</CardTitle>
              <CardDescription>请填写以下信息以完成注册</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDesignerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">显示名称 *</Label>
                  <Input
                    id="displayName"
                    value={designerForm.displayName}
                    onChange={(e) => setDesignerForm({ ...designerForm, displayName: e.target.value })}
                    placeholder="请输入您的显示名称"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">类型</Label>
                  <Select
                    value={designerForm.type}
                    onValueChange={(value: "individual" | "team" | "school") =>
                      setDesignerForm({ ...designerForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">个人设计师</SelectItem>
                      <SelectItem value="team">设计团队</SelectItem>
                      <SelectItem value="school">高校社团</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={designerForm.bio}
                    onChange={(e) => setDesignerForm({ ...designerForm, bio: e.target.value })}
                    placeholder="请简要介绍您的设计经历和风格"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">所属机构/学校</Label>
                  <Input
                    id="organization"
                    value={designerForm.organization}
                    onChange={(e) => setDesignerForm({ ...designerForm, organization: e.target.value })}
                    placeholder="请输入所属机构或学校名称"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio">作品集链接</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    value={designerForm.portfolio}
                    onChange={(e) => setDesignerForm({ ...designerForm, portfolio: e.target.value })}
                    placeholder="https://example.com/portfolio"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("select")}
                    className="flex-1"
                  >
                    返回
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]"
                    disabled={createDesignerMutation.isPending}
                  >
                    {createDesignerMutation.isPending ? "提交中..." : "完成注册"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 完成页面 */}
        {step === "complete" && (
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">注册成功！</CardTitle>
              <CardDescription>
                您已成功完成{userType === "museum" ? "博物馆" : "设计师"}资料填写
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                {userType === "museum"
                  ? "现在您可以开始发布文创设计征集项目了"
                  : "现在您可以开始参与征集项目并提交作品了"}
              </p>
              <Button
                onClick={handleComplete}
                className="bg-[#C8102E] hover:bg-[#A00D24]"
              >
                进入平台
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
