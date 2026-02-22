import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, ArrowLeft } from "lucide-react";
import { getLoginUrl } from "@/const";

/**
 * 征集项目编辑页面
 * 只有征集创建者（博物馆）可以访问
 */
export default function EditCollection() {
  const { t } = useTranslation();
  const params = useParams();
  const collectionId = params.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [artifactName, setArtifactName] = useState("");
  const [artifactDescription, setArtifactDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [prize, setPrize] = useState("");
  const [prizeAmount, setPrizeAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "closed" | "completed">("draft");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // 获取征集详情
  const { data: collection, isLoading: collectionLoading } = trpc.collection.getById.useQuery(
    { id: collectionId! },
    { enabled: !!collectionId }
  );

  // 更新征集mutation
  const updateMutation = trpc.collection.update.useMutation({
    onSuccess: () => {
      alert(t('editCollection.updateSuccess'));
      setLocation(`/collection/${collectionId}`);
    },
    onError: (error) => {
      alert(t('editCollection.updateError', { message: error.message }));
    },
  });

  // 加载征集数据到表单
  useEffect(() => {
    if (collection) {
      setTitle(collection.title || "");
      setDescription(collection.description || "");
      setArtifactName(collection.artifactName || "");
      setArtifactDescription(collection.artifactDescription || "");
      setRequirements(collection.requirements || "");
      setPrize(collection.prize || "");
      setPrizeAmount(collection.prizeAmount || 0);
      setDeadline(collection.deadline ? new Date(collection.deadline).toISOString().split('T')[0] : "");
      setStatus(collection.status as "draft" | "active" | "closed" | "completed");
      setDownloadUrl(collection.downloadUrl || "");
      
      // 解析images JSON字符串
      if (collection.images) {
        try {
          const parsedImages = JSON.parse(collection.images);
          setImages(Array.isArray(parsedImages) ? parsedImages : []);
        } catch (e) {
          console.error("Failed to parse images:", e);
          setImages([]);
        }
      }
    }
  }, [collection]);

  // 权限检查
  if (authLoading || collectionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "museum") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('editCollection.accessDenied')}</CardTitle>
            <CardDescription>{t('editCollection.museumOnly')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('editCollection.notFound')}</CardTitle>
            <CardDescription>{t('editCollection.notFoundDesc')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!collectionId) return;

    updateMutation.mutate({
      id: collectionId,
      title,
      description,
      artifactName,
      artifactDescription,
      requirements,
      prize,
      prizeAmount,
      deadline: new Date(deadline),
      status,
      downloadUrl,
      images: JSON.stringify(images),
    });
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => setLocation(`/collection/${collectionId}`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('editCollection.backToDetail')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t('editCollection.title')}</CardTitle>
          <CardDescription>{t('editCollection.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">{t('editCollection.form.title')}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder={t('editCollection.form.titlePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="description">{t('editCollection.form.description')}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t('editCollection.form.descriptionPlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="artifactName">{t('editCollection.form.artifactName')}</Label>
                <Input
                  id="artifactName"
                  value={artifactName}
                  onChange={(e) => setArtifactName(e.target.value)}
                  required
                  placeholder={t('editCollection.form.artifactNamePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="artifactDescription">{t('editCollection.form.artifactDescription')}</Label>
                <Textarea
                  id="artifactDescription"
                  value={artifactDescription}
                  onChange={(e) => setArtifactDescription(e.target.value)}
                  rows={4}
                  placeholder={t('editCollection.form.artifactDescriptionPlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="requirements">{t('editCollection.form.requirements')}</Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder={t('editCollection.form.requirementsPlaceholder')}
                />
              </div>
            </div>

            {/* 奖金信息 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="prize">{t('editCollection.form.prize')}</Label>
                <Input
                  id="prize"
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  placeholder={t('editCollection.form.prizePlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="prizeAmount">{t('editCollection.form.prizeAmount')}</Label>
                <Input
                  id="prizeAmount"
                  type="number"
                  value={prizeAmount}
                  onChange={(e) => setPrizeAmount(parseFloat(e.target.value) || 0)}
                  placeholder={t('editCollection.form.prizeAmountPlaceholder')}
                />
              </div>
            </div>

            {/* 时间和状态 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="deadline">{t('editCollection.form.deadline')}</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">{t('editCollection.form.status')}</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('editCollection.form.statusPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('editCollection.form.statusDraft')}</SelectItem>
                    <SelectItem value="active">{t('editCollection.form.statusActive')}</SelectItem>
                    <SelectItem value="closed">{t('editCollection.form.statusClosed')}</SelectItem>
                    <SelectItem value="completed">{t('editCollection.form.statusCompleted')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="downloadUrl">{t('editCollection.form.downloadUrl')}</Label>
                <Input
                  id="downloadUrl"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder={t('editCollection.form.downloadUrlPlaceholder')}
                />
              </div>
            </div>

            {/* 图片管理 */}
            <div className="space-y-4">
              <Label>{t('editCollection.form.images')}</Label>
              
              {/* 现有图片列表 */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={t('editCollection.form.imageAlt', { index: index + 1 })}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* 添加新图片 */}
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder={t('editCollection.form.imageUrlPlaceholder')}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddImage}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('editCollection.form.addImage')}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('editCollection.form.imageHint')}
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('editCollection.form.saving')}
                  </>
                ) : (
                  t('editCollection.form.save')
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation(`/collection/${collectionId}`)}
              >
                {t('editCollection.form.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
