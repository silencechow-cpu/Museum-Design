/**
 * 设计师作品管理页面
 * 提供作品上传、编辑、删除等功能
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2, Trash2, Edit, Eye, Plus, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MyWorksManagement() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 获取当前设计师信息
  const { data: designer } = trpc.designer.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === 'designer' }
  );

  // 获取我的作品列表
  const { data: works, refetch } = trpc.work.getMyWorks.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === 'designer' }
  );

  const handleDeleteWork = async (workId: number) => {
    // TODO: 实现删除功能（需要后端支持）
    toast.info(t('myWorks.deleteComingSoon'));
  };

  // 过滤作品
  const filteredWorks = works?.filter(work => {
    if (filterStatus === 'all') return true;
    return work.status === filterStatus;
  }) || [];

  // 状态标签样式
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      submitted: { label: t('myWorks.status.submitted'), variant: 'default' },
      approved: { label: t('myWorks.status.approved'), variant: 'secondary' },
      rejected: { label: t('myWorks.status.rejected'), variant: 'destructive' },
      winner: { label: t('myWorks.status.winner'), variant: 'outline' },
    };
    const config = statusConfig[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!isAuthenticated || user?.role !== 'designer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t('myWorks.accessDenied')}</CardTitle>
            <CardDescription>{t('myWorks.designerOnly')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-[#C8102E] hover:bg-[#A00D24]" onClick={() => setLocation('/')}>
              {t('myWorks.backToHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container pt-24 pb-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('myWorks.title')}</h1>
          <p className="text-muted-foreground">{t('myWorks.subtitle')}</p>
        </div>

        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => setUploadDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('myWorks.uploadNew')}
          </Button>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t('myWorks.filterStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('myWorks.filter.all')}</SelectItem>
              <SelectItem value="submitted">{t('myWorks.status.submitted')}</SelectItem>
              <SelectItem value="approved">{t('myWorks.status.approved')}</SelectItem>
              <SelectItem value="rejected">{t('myWorks.status.rejected')}</SelectItem>
              <SelectItem value="winner">{t('myWorks.status.winner')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 作品列表 */}
        {filteredWorks.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('myWorks.noWorks')}</h3>
            <p className="text-muted-foreground mb-6">
              {filterStatus === 'all' ? t('myWorks.uploadFirst') : t('myWorks.noWorksInStatus')}
            </p>
            {filterStatus === 'all' && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('myWorks.upload')}
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => {
              const images = work.images ? JSON.parse(work.images) : [];
              const tags = work.tags ? JSON.parse(work.tags) : [];
              
              return (
                <Card key={work.id} className="overflow-hidden group">
                  {/* 作品封面 */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {images.length > 0 ? (
                      <img
                        src={images[0]}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* 状态标签 */}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(work.status)}
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">{work.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {work.description || t('myWorks.noDescription')}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* 标签 */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <Link href={`/work/${work.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Eye className="w-4 h-4" />
                          {t('myWorks.view')}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingWork(work)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        {t('myWorks.edit')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteWork(work.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* 上传作品对话框 */}
      <UploadWorkDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => {
          refetch();
          setUploadDialogOpen(false);
        }}
      />

      {/* 编辑作品对话框 */}
      {editingWork && (
        <EditWorkDialog
          work={editingWork}
          open={!!editingWork}
          onOpenChange={(open) => !open && setEditingWork(null)}
          onSuccess={() => {
            refetch();
            setEditingWork(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

// 上传作品对话框组件
function UploadWorkDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // TODO: 集成S3上传
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...urls]);
      toast.success(t('myWorks.uploadSuccess', { count: urls.length }));
    } catch (error) {
      toast.error(t('myWorks.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('myWorks.uploadDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('myWorks.uploadDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 作品标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('myWorks.uploadDialog.titleLabel')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('myWorks.uploadDialog.titlePlaceholder')}
            />
          </div>

          {/* 作品描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('myWorks.uploadDialog.descriptionLabel')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('myWorks.uploadDialog.descriptionPlaceholder')}
              rows={5}
            />
          </div>

          {/* 图片上传 */}
          <div className="space-y-2">
            <Label>{t('myWorks.uploadDialog.imagesLabel')}</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('batch-upload')?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('myWorks.uploadDialog.uploading')}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {t('myWorks.uploadDialog.batchUpload')}
                    </>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('myWorks.uploadDialog.imageHint')}
                </span>
                <input
                  id="batch-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading || images.length >= 9}
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                    >
                      <img
                        src={url}
                        alt={t('myWorks.uploadDialog.imageAlt', { index: index + 1 })}
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
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t('myWorks.uploadDialog.tagsLabel')}</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t('myWorks.uploadDialog.tagsPlaceholder')}
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('myWorks.uploadDialog.cancel')}
            </Button>
            <Button
              type="button"
              disabled={!title || images.length === 0}
              className="flex-1"
              onClick={() => {
                toast.success(t('myWorks.uploadDialog.success'));
                onSuccess();
              }}
            >
              {t('myWorks.uploadDialog.submit')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 编辑作品对话框组件
function EditWorkDialog({
  work,
  open,
  onOpenChange,
  onSuccess,
}: {
  work: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(work.title);
  const [description, setDescription] = useState(work.description || '');
  const [tags, setTags] = useState(
    work.tags ? JSON.parse(work.tags).join(', ') : ''
  );

  const handleUpdate = async () => {
    // TODO: 实现更新功能（需要后端支持）
    toast.info(t('myWorks.editDialog.updateComingSoon'));
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('myWorks.editDialog.title')}</DialogTitle>
          <DialogDescription>{t('myWorks.editDialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">{t('myWorks.editDialog.titleLabel')}</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{t('myWorks.editDialog.descriptionLabel')}</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tags">{t('myWorks.editDialog.tagsLabel')}</Label>
            <Input
              id="edit-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t('myWorks.editDialog.tagsPlaceholder')}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('myWorks.editDialog.cancel')}
            </Button>
            <Button
              onClick={handleUpdate}
              className="flex-1"
            >
              {t('myWorks.editDialog.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
