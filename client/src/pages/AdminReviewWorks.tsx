import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { CheckCircle2, XCircle, MessageSquare, Star, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useTranslation } from "react-i18next";

/**
 * 管理员作品审核页面
 * 只有admin和museum角色可以访问
 */
export default function AdminReviewWorks() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  const [selectedWorkIds, setSelectedWorkIds] = useState<number[]>([]);
  const [currentStatus, setCurrentStatus] = useState<"submitted" | "approved" | "rejected" | "winner">("submitted");
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);

  // 获取待审核作品列表
  const { data: worksData, isLoading: worksLoading, refetch } = trpc.review.getPendingWorks.useQuery({
    status: currentStatus,
    limit: 50,
    offset: 0,
  });

  // 批量审核mutation
  const batchReviewMutation = trpc.review.batchReview.useMutation({
    onSuccess: (data) => {
      alert(t('adminReview.success'));
      setSelectedWorkIds([]);
      setReviewComment("");
      setShowReviewDialog(false);
      refetch();
    },
    onError: (error) => {
      alert(t('adminReview.error'));
    },
  });

  // 添加评论mutation
  const addCommentMutation = trpc.review.addComment.useMutation({
    onSuccess: () => {
      alert("评论成功！已添加审核评论");
      setReviewComment("");
      refetch();
    },
    onError: (error) => {
      alert(`评论失败：${error.message}`);
    },
  });

  // 权限检查
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "admin" && user.role !== "museum") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>权限不足</CardTitle>
            <CardDescription>只有管理员和博物馆用户可以访问此页面</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const works = worksData?.works || [];
  const total = worksData?.total || 0;

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorkIds(works.map(w => w.id));
    } else {
      setSelectedWorkIds([]);
    }
  };

  // 处理单个作品选择
  const handleSelectWork = (workId: number, checked: boolean) => {
    if (checked) {
      setSelectedWorkIds([...selectedWorkIds, workId]);
    } else {
      setSelectedWorkIds(selectedWorkIds.filter(id => id !== workId));
    }
  };

  // 处理批量审核
  const handleBatchReview = (action: "approve" | "reject") => {
    if (selectedWorkIds.length === 0) {
      alert("请至少选择一个作品进行审核");
      return;
    }
    setReviewAction(action);
    setShowReviewDialog(true);
  };

  // 确认审核
  const confirmReview = () => {
    if (!reviewAction) return;
    
    batchReviewMutation.mutate({
      workIds: selectedWorkIds,
      action: reviewAction,
      comment: reviewComment || undefined,
    });
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusMap = {
      submitted: { label: "待审核", variant: "secondary" as const },
      approved: { label: "已通过", variant: "default" as const },
      rejected: { label: "已拒绝", variant: "destructive" as const },
      winner: { label: "获奖作品", variant: "default" as const },
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.submitted;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">作品审核管理</h1>
          <p className="text-muted-foreground">审核设计师提交的创意作品</p>
        </div>

        {/* 状态筛选标签 */}
        <Tabs value={currentStatus} onValueChange={(v) => setCurrentStatus(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="submitted">待审核</TabsTrigger>
            <TabsTrigger value="approved">已通过</TabsTrigger>
            <TabsTrigger value="rejected">已拒绝</TabsTrigger>
            <TabsTrigger value="winner">获奖作品</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 批量操作工具栏 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedWorkIds.length === works.length && works.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  已选择 {selectedWorkIds.length} / {total} 个作品
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleBatchReview("approve")}
                  disabled={selectedWorkIds.length === 0 || batchReviewMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  批量通过
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBatchReview("reject")}
                  disabled={selectedWorkIds.length === 0 || batchReviewMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  批量拒绝
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 作品列表 */}
        {worksLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : works.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">暂无{currentStatus === "submitted" ? "待审核" : ""}作品</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work) => {
              const images = work.images ? JSON.parse(work.images) : [];
              const imageUrl = images[0] || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400";

              return (
                <Card key={work.id} className="overflow-hidden">
                  <div className="relative">
                    <Checkbox
                      className="absolute top-3 left-3 z-10 bg-white"
                      checked={selectedWorkIds.includes(work.id)}
                      onCheckedChange={(checked) => handleSelectWork(work.id, checked as boolean)}
                    />
                    <img
                      src={imageUrl}
                      alt={work.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{work.title}</CardTitle>
                      {getStatusBadge(work.status)}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {work.description || "暂无描述"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>浏览: {work.viewCount}</span>
                      <span>点赞: {work.likeCount}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedWorkIds([work.id]);
                          setReviewAction("approve");
                          setShowReviewDialog(true);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        通过
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedWorkIds([work.id]);
                          setReviewAction("reject");
                          setShowReviewDialog(true);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        拒绝
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 审核确认对话框 */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === "approve" ? "通过作品" : "拒绝作品"}
              </DialogTitle>
              <DialogDescription>
                您正在{reviewAction === "approve" ? "通过" : "拒绝"} {selectedWorkIds.length} 个作品
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">审核意见（可选）</label>
              <Textarea
                placeholder="输入审核意见..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                取消
              </Button>
              <Button
                onClick={confirmReview}
                disabled={batchReviewMutation.isPending}
                variant={reviewAction === "approve" ? "default" : "destructive"}
              >
                {batchReviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                确认{reviewAction === "approve" ? "通过" : "拒绝"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
