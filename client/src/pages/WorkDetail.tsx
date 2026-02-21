/**
 * 作品详情页面
 * 展示作品完整信息、高清大图、评分数据和评分功能
 */

import { useParams, Link } from 'wouter';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Calendar, 
  Eye, 
  Heart, 
  ArrowLeft, 
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ImageLightbox from '@/components/ImageLightbox';
import WorkRating from '@/components/WorkRating';
import SEOHead from '@/components/SEOHead';
import ShareButton from '@/components/ShareButton';
import RelatedWorks from '@/components/RelatedWorks';

export default function WorkDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const workId = parseInt(params.id || '0');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // 获取作品完整详情
  const { data: workDetail, isLoading } = trpc.work.getDetailById.useQuery({ id: workId });

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '.');
  };

  // 获取状态标签样式
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      submitted: { label: t('work.statusSubmitted'), className: 'bg-yellow-100 text-yellow-700' },
      approved: { label: t('work.statusApproved'), className: 'bg-green-100 text-green-700' },
      rejected: { label: t('work.statusRejected'), className: 'bg-red-100 text-red-700' },
      winner: { label: t('work.statusWinner'), className: 'bg-amber-100 text-amber-700' },
    };
    return statusMap[status] || statusMap.submitted;
  };

  // 图片导航
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (workDetail && workDetail.images) {
      const images = JSON.parse(workDetail.images);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (workDetail && workDetail.images) {
      const images = JSON.parse(workDetail.images);
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
      </div>
    );
  }

  if (!workDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
        <Navigation />
        <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('workDetail.notFound')}</h1>
          <Link href="/">
            <Button className="bg-[#C8102E] hover:bg-[#A00D24]">{t('workDetail.backToHome')}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = workDetail.images ? JSON.parse(workDetail.images) : [];
  const tags = workDetail.tags ? JSON.parse(workDetail.tags) : [];
  const statusBadge = getStatusBadge(workDetail.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
      <SEOHead
        title={workDetail.title}
        description={workDetail.description || `${workDetail.title}的详细信息`}
        type="article"
        keywords={`${workDetail.title},文创设计,${tags.join(',')}`}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navigation />

      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* 返回按钮和分享按钮 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('workDetail.back')}
          </Button>
          <ShareButton
            title={workDetail.title}
            description={workDetail.description || `${workDetail.title}的详细信息`}
            variant="outline"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：作品图片和基本信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 主图展示 */}
            {images.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div 
                    className="relative aspect-video bg-gray-100 cursor-pointer group overflow-hidden"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={workDetail.title}
                      className="w-full h-full object-contain"
                    />
                    
                    {/* 放大提示 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
                        {t('workDetail.clickToView')}
                      </div>
                    </div>

                    {/* 左右箭头 */}
                    {images.length > 1 && (
                      <>
                        {currentImageIndex > 0 && (
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                        )}
                        {currentImageIndex < images.length - 1 && (
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        )}
                      </>
                    )}

                    {/* 图片计数 */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>

                  {/* 缩略图 */}
                  {images.length > 1 && (
                    <div className="p-4 flex gap-3 overflow-x-auto">
                      {images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? 'border-[#C8102E] ring-2 ring-[#C8102E]/30'
                              : 'border-gray-200 hover:border-[#C8102E]/50'
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`${workDetail.title} ${index + 1}`}
                            className="w-full h-full object-cover" 
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 作品详细信息 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{workDetail.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(workDetail.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {workDetail.viewCount || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {workDetail.likeCount || 0}
                      </div>
                    </div>
                  </div>
                  <Badge className={statusBadge.className}>
                    {statusBadge.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 作品描述 */}
                {workDetail.description && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('workDetail.workDescription')}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {workDetail.description}
                    </p>
                  </div>
                )}

                {/* 标签 */}
                {tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('workDetail.tags')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：设计师、征集信息和评分 */}
          <div className="space-y-6">
            {/* 设计师信息 */}
            {workDetail.designer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('workDetail.designer')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/designer/${workDetail.designer.id}`}>
                    <div className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-[#C8102E]/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-[#C8102E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">
                          {workDetail.designer.displayName}
                        </div>
                        {workDetail.designer.bio && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {workDetail.designer.bio}
                          </div>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* 征集项目信息 */}
            {workDetail.collection && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('workDetail.collection')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/collection/${workDetail.collection.id}`}>
                    <div className="hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-start gap-3 mb-3">
                        <Building2 className="w-5 h-5 text-[#C8102E] mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold mb-1 line-clamp-2">
                            {workDetail.collection.title}
                          </div>
                          {workDetail.collection.description && (
                            <div className="text-sm text-muted-foreground line-clamp-3">
                              {workDetail.collection.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                      >
                        {t('collection.details')}
                      </Button>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* 评分组件 */}
            <WorkRating workId={workId} />
          </div>
        </div>
      </div>

      {/* 相关作品推荐 */}
      <RelatedWorks workId={workId} limit={6} />

      <Footer />

      {/* 图片灯箱 */}
      <ImageLightbox
        images={images}
        initialIndex={currentImageIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}
