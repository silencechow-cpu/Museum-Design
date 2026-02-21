import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadMultipleImages, validateImageFiles } from "@/lib/uploadImage";
import { useAuth } from "@/_core/hooks/useAuth";

interface WorkSubmissionDialogProps {
  collectionId: number;
  collectionTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function WorkSubmissionDialog({
  collectionId,
  collectionTitle,
  open,
  onOpenChange,
  onSuccess,
}: WorkSubmissionDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const { user } = useAuth();
  const submitMutation = trpc.work.submit.useMutation();
  const uploadMutation = trpc.upload.uploadMultipleImages.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // 验证文件
    const validation = validateImageFiles(fileArray);
    if (!validation.valid) {
      toast.error(validation.error || '文件验证失败');
      return;
    }

    // 检查图片数量限制
    if (imageUrls.length + fileArray.length > 9) {
      toast.error('最多只能上传 9 张图片');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: fileArray.length });

    try {
      // 转换为Base64并上传到S3
      const uploadFiles = await Promise.all(
        fileArray.map(async (file) => {
          const reader = new FileReader();
          return new Promise<{ fileName: string; fileData: string; contentType: string }>((resolve, reject) => {
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve({
                fileName: file.name,
                fileData: base64,
                contentType: file.type,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const results = await uploadMutation.mutateAsync({ files: uploadFiles });
      const urls = results.map(r => r.url);
      
      setImageUrls([...imageUrls, ...urls]);
      toast.success(`成功上传 ${urls.length} 张图片`);
    } catch (error: any) {
      console.error('图片上传失败:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("请输入作品标题");
      return;
    }

    if (imageUrls.length === 0) {
      toast.error("请至少上传一张作品图片");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        collectionId,
        title: title.trim(),
        description: description.trim() || undefined,
        images: JSON.stringify(imageUrls),
        tags: tags.trim() ? JSON.stringify(tags.split(",").map(t => t.trim()).filter(Boolean)) : undefined,
      });

      toast.success("作品提交成功！");
      
      // 重置表单
      setTitle("");
      setDescription("");
      setTags("");
      setImageUrls([]);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "作品提交失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>提交作品</DialogTitle>
          <DialogDescription>
            为"{collectionTitle}"征集项目提交您的设计作品
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 作品标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              作品标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="为您的作品起一个吸引人的名字"
              required
            />
          </div>

          {/* 作品描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">作品描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="介绍您的设计理念、创作灵感和作品特色..."
              rows={5}
            />
          </div>

          {/* 图片上传 */}
          <div className="space-y-2">
            <Label>
              作品图片 <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-4">
              {/* 上传按钮 */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      上传中... ({uploadProgress.current}/{uploadProgress.total})
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      选择图片
                    </>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  支持 JPG、PNG 格式，最多上传 9 张
                </span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading || imageUrls.length >= 9}
                />
              </div>

              {/* 图片预览网格 */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                    >
                      <img
                        src={url}
                        alt={`作品图片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imageUrls.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    点击上方按钮上传作品图片
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label htmlFor="tags">标签</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="用逗号分隔多个标签，如：传统工艺,现代设计,文创产品"
            />
            <p className="text-xs text-muted-foreground">
              添加标签有助于您的作品被更多人发现
            </p>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={submitMutation.isPending || uploading}
              className="flex-1 gap-2"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
  );
}
