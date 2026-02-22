/**
 * 新中式数字主义设计系统 - 征集详情页
 * 展示文物高清大图、完整征集要求、倒计时等信息
 * 使用真实API数据替换mock数据
 */

import { useEffect, useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import WorkSubmissionDialog from '@/components/WorkSubmissionDialog';
import FavoriteButton from '@/components/FavoriteButton';
import ShareButton from '@/components/ShareButton';
import ImageLightbox from '@/components/ImageLightbox';
import SEOHead from '@/components/SEOHead';
import RelatedCollections from '@/components/RelatedCollections';
import CollectionWorksList from '@/components/CollectionWorksList';
import { Calendar, Award, Clock, ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function CollectionDetail() {
  const [, params] = useRoute('/collection/:id');
  const { language, t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [, setLocation] = useLocation();

  const collectionId = parseInt(params?.id || '0', 10);

  // 使用tRPC从API获取征集详情
  const { data: collection, isLoading, error } = trpc.collection.getById.useQuery(
    { id: collectionId },
    { enabled: collectionId > 0 }
  );

  // 解析图片列表
  const images: string[] = (() => {
    if (!collection?.images) return ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=90'];
    try {
      const parsed = JSON.parse(collection.images);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=90'];
    } catch {
      return ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=90'];
    }
  })();

  // 倒计时计算
  useEffect(() => {
    if (!collection) return;

    const calculateTimeLeft = () => {
      const deadline = new Date(collection.deadline).getTime();
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [collection]);

  // 图片切换函数
  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // 触摸滑动支持
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance) {
      nextImage();
    } else if (distance < -minSwipeDistance) {
      prevImage();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#C8102E]" />
      </div>
    );
  }

  // 未找到或出错
  if (!collection || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">征集项目不存在</h2>
          <Button className="bg-[#C8102E] hover:bg-[#A00D24]" onClick={() => setLocation('/')}>
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  // 解析征集要求（requirements字段为文本，按换行分割展示）
  const requirementsList: string[] = (() => {
    if (!collection.requirements) return [];
    try {
      const parsed = JSON.parse(collection.requirements);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return collection.requirements.split('\n').filter(Boolean);
  })();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${collection.artifactName} - 古韵新创`}
        description={collection.description || collection.artifactDescription || ''}
        image={images[0]}
        type="article"
        keywords={`${collection.artifactName},文创征集,设计比赛,博物馆`}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navigation />

      {/* 面包屑导航 */}
      <div className="container pt-24 pb-8">
        <Button
          variant="ghost"
          onClick={() => setLocation('/collections')}
          className="-ml-2 hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回征集列表
        </Button>
      </div>

      <div className="container pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左侧：图片展示 */}
          <div className="reveal-animation">
            {/* 主图 */}
            <div 
              className="relative aspect-square rounded-lg overflow-hidden mb-4 artifact-glow group cursor-pointer"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={images[currentImageIndex]}
                alt={collection.artifactName}
                className="w-full h-full object-cover"
              />
              
              {/* 放大提示 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
                  点击查看大图
                </div>
              </div>
              
              {/* 左右箭头导航 */}
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background hover:scale-110"
                  aria-label="上一张"
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
              )}
              
              {currentImageIndex < images.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background hover:scale-110"
                  aria-label="下一张"
                >
                  <ChevronRight className="w-6 h-6 text-foreground" />
                </button>
              )}
              
              {/* 图片计数器 */}
              <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-foreground">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* 缩略图导航 */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      currentImageIndex === index
                        ? 'border-primary shadow-lg scale-105 ring-2 ring-primary/30'
                        : 'border-border hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${collection.artifactName} ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：详细信息 */}
          <div className="reveal-animation" style={{ animationDelay: '0.2s' }}>
            {/* 标题 */}
            <h1 className="text-4xl font-bold text-foreground mb-4">{collection.artifactName}</h1>

            {/* 简短描述 */}
            {collection.description && (
              <p className="text-lg text-muted-foreground mb-6">{collection.description}</p>
            )}

            {/* 状态标识 */}
            <div className="inline-block mb-8">
              <span className={`px-4 py-2 rounded-full text-base font-medium ${
                collection.status === 'active' ? 'bg-green-100 text-green-700' :
                collection.status === 'closed' ? 'bg-yellow-100 text-yellow-700' :
                collection.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {collection.status === 'active' ? '征集中' :
                 collection.status === 'closed' ? '已暂停' :
                 collection.status === 'completed' ? '已结束' : '草稿'}
              </span>
            </div>

            {/* 倒计时 */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">征集倒计时</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{timeLeft.days}</div>
                  <div className="text-xs text-muted-foreground mt-1">天</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{timeLeft.hours}</div>
                  <div className="text-xs text-muted-foreground mt-1">时</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{timeLeft.minutes}</div>
                  <div className="text-xs text-muted-foreground mt-1">分</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{timeLeft.seconds}</div>
                  <div className="text-xs text-muted-foreground mt-1">秒</div>
                </div>
              </div>
            </div>

            {/* 奖金信息 */}
            {collection.prize && (
              <div className="bg-gradient-to-r from-amber-gold/10 to-bronze-green/10 border border-amber-gold/30 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-amber-gold" />
                  <span className="font-medium text-foreground">奖金设置</span>
                </div>
                <div className="text-2xl font-bold text-amber-gold">总奖金 {collection.prize}</div>
              </div>
            )}

            {/* 截止日期 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Calendar className="w-4 h-4" />
              <span>截止日期：{new Date(collection.deadline).toLocaleDateString('zh-CN')}</span>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <button 
                onClick={() => setSubmissionDialogOpen(true)}
                className="flex-1 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                立即参与征集
              </button>
              <FavoriteButton 
                targetType="collection"
                targetId={collection.id}
                variant="outline"
                size="lg"
                className="px-6 py-4 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              />
              <ShareButton 
                title={collection.artifactName}
                description={collection.description || ''}
                variant="outline"
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* 详细信息区域 */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 征集说明 */}
          <div className="lg:col-span-2 reveal-animation">
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">征集说明</h2>
              
              {collection.artifactDescription && (
                <p className="text-foreground leading-relaxed mb-8">{collection.artifactDescription}</p>
              )}
              
              {collection.description && (
                <p className="text-foreground leading-relaxed mb-8">{collection.description}</p>
              )}

              {requirementsList.length > 0 && (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-4">征集要求</h3>
                  <ul className="space-y-3">
                    {requirementsList.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">{index + 1}</span>
                        </div>
                        <span className="text-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* 资料下载 */}
          <div className="reveal-animation" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-foreground mb-6">资料下载</h3>
              {collection.downloadUrl ? (
                <a
                  href={collection.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        下载征集资料包
                      </div>
                      <div className="text-xs text-muted-foreground">点击下载</div>
                    </div>
                  </div>
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">暂无可下载资料</p>
              )}

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  下载资料包含文物高清素材、征集详细要求等内容，请仔细阅读后再进行设计创作。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 作品提交对话框 */}
        <WorkSubmissionDialog 
          collectionId={collection.id} 
          collectionTitle={collection.artifactName}
          open={submissionDialogOpen}
          onOpenChange={setSubmissionDialogOpen}
        />

        {/* 已提交作品列表 */}
        <div className="mt-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">已提交作品</h2>
            <p className="text-muted-foreground">查看所有参赛作品，支持按评分、时间排序和状态筛选</p>
          </div>
          <CollectionWorksList collectionId={collection.id} />
        </div>
      </div>

      {/* 相关征集推荐 */}
      <RelatedCollections collectionId={collection.id} />

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
