import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useFormDraft } from "@/hooks/useFormDraft";
import { trpc } from "@/lib/trpc";
import { compressImages, getCompressionStats } from "@/lib/imageCompression";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

interface WorkSubmissionFormProps {
  collectionId: number;
  collectionTitle: string;
}

export default function WorkSubmissionForm({ collectionId, collectionTitle }: WorkSubmissionFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // 草稿保存（每30秒自动保存）
  const draftKey = `work-submission-draft-${collectionId}`;
  const { loadDraft, clearDraft, hasDraft } = useFormDraft(
    draftKey,
    { ...formData, imagePreviews },
    30000
  );

  const utils = trpc.useUtils();

  const submitWorkMutation = trpc.work.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("作品提交成功！");
      utils.work.getMyWorks.invalidate();
      // 3秒后关闭对话框
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 3000);
    },
    onError: (error: any) => {
      toast.error(error.message || "提交失败，请重试");
      setSubmitting(false);
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", tags: "" });
    setImageFiles([]);
    setImagePreviews([]);
    setSubmitted(false);
    setSubmitting(false);
    clearDraft(); // 清除草稿
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 限制最多上传6张图片
    const totalImages = imageFiles.length + files.length;
    if (totalImages > 6) {
      toast.error("最多只能上传6张图片");
      return;
    }

    // 检查文件大小（每个文件最大5MB）
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("图片大小不能超过5MB");
      return;
    }

    // 压缩图片
    toast.info("正在压缩图片...");
    try {
      const compressedFiles = await compressImages(files, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
      });

      // 计算压缩统计
      let totalSaved = 0;
      compressedFiles.forEach((compressedFile, index) => {
        const stats = getCompressionStats(files[index], compressedFile);
        totalSaved += stats.savedPercent;
      });
      const avgSaved = Math.round(totalSaved / compressedFiles.length);
      
      if (avgSaved > 0) {
        toast.success(`图片压缩完成，平均减少${avgSaved}%文件大小`);
      }

      // 添加压缩后的文件
      setImageFiles(prev => [...prev, ...compressedFiles]);

      // 生成预览
      compressedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('图片压缩失败:', error);
      toast.error("图片压缩失败，请重试");
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("请输入作品标题");
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("请至少上传一张作品图片");
      return;
    }

    setSubmitting(true);

    try {
      // 这里应该先上传图片到S3，然后获取URL
      // 为了演示，我们暂时使用预览URL
      const imageUrls = imagePreviews; // 实际应该是上传后的S3 URL

      await submitWorkMutation.mutateAsync({
        collectionId,
        title: formData.title,
        description: formData.description,
        images: JSON.stringify(imageUrls),
        tags: formData.tags,
      });
      
      // 提交成功后清除草稿
      clearDraft();
    } catch (error) {
      // 错误已在mutation的onError中处理
    }
  };

  // 组件加载时恢复草稿
  useEffect(() => {
    if (open && hasDraft()) {
      const draft = loadDraft();
      if (draft) {
        setFormData({
          title: draft.title || "",
          description: draft.description || "",
          tags: draft.tags || "",
        });
        if (draft.imagePreviews && Array.isArray(draft.imagePreviews)) {
          setImagePreviews(draft.imagePreviews);
        }
        toast.info("已恢复上次编辑的内容");
      }
    }
  }, [open]);

  // 如果未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-r from-[#C8102E]/5 to-[#C8102E]/10 rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold mb-4">立即参与征集</h3>
        <p className="text-muted-foreground mb-6">
          登录后即可提交您的设计作品
        </p>
        <Button
          onClick={() => window.location.href = getLoginUrl()}
          className="bg-[#C8102E] hover:bg-[#A00D24]"
        >
          登录参与
        </Button>
      </div>
    );
  }

  // 如果已提交，显示成功状态
  if (submitted) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">作品提交成功！</h3>
        <p className="text-muted-foreground">
          您的作品已成功提交，请等待审核
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>参与征集</CardTitle>
        <CardDescription>
          提交您的设计作品参与「{collectionTitle}」征集
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-[#C8102E] hover:bg-[#A00D24]" size="lg">
              立即参与
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>提交作品</DialogTitle>
              <DialogDescription>
                填写作品信息并上传图片 {hasDraft() && "· 已自动保存草稿"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 作品标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">作品标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="请输入作品标题"
                  required
                />
              </div>

              {/* 作品描述 */}
              <div className="space-y-2">
                <Label htmlFor="description">作品描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请描述您的设计理念和创作思路"
                  rows={4}
                />
              </div>

              {/* 标签 */}
              <div className="space-y-2">
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="用逗号分隔，如：文创,包装设计,现代风格"
                />
                <p className="text-xs text-muted-foreground">
                  添加标签有助于其他人发现您的作品
                </p>
              </div>

              {/* 图片上传 */}
              <div className="space-y-2">
                <Label>作品图片 * (最多6张，每张最大5MB)</Label>
                
                {/* 图片预览网格 */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`预览 ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 上传按钮 */}
                {imageFiles.length < 6 && (
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-[#C8102E] transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="images" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        点击上传或拖拽图片到此处
                      </p>
                      <p className="text-xs text-muted-foreground">
                        支持 JPG、PNG、GIF 格式
                      </p>
                    </label>
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    "提交作品"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          提交前请确保作品符合征集要求
        </p>
      </CardContent>
    </Card>
  );
}
