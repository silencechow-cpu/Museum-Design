/**
 * 新中式数字主义设计系统 - 征集详情页
 * 展示文物高清大图、完整征集要求、倒计时等信息
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
import { Calendar, Award, Clock, ArrowLeft, Download, ChevronLeft, ChevronRight } from 'lucide-react';

// 模拟数据 - 实际应用中应从API获取
const mockCollectionDetails: Record<string, any> = {
  '1': {
    id: 1,
    museum: { 'zh-CN': '故宫博物院', 'zh-TW': '故宮博物院', 'en': 'Palace Museum' },
    artifact: { 'zh-CN': '清代珐琅彩瓷瓶', 'zh-TW': '清代琺瑯彩瓷瓶', 'en': 'Qing Enamel Porcelain Vase' },
    description: {
      'zh-CN': '征集以珐琅彩瓷为灵感的现代文创产品设计',
      'zh-TW': '徵集以琺瑯彩瓷為靈感的現代文創產品設計',
      'en': 'Seeking modern creative product designs inspired by enamel porcelain',
    },
    fullDescription: {
      'zh-CN': '清代珐琅彩瓷器是中国陶瓷艺术的巅峰之作，以其精湛的工艺和绚丽的色彩闻名于世。本次征集希望设计师能够从珐琅彩的色彩搭配、纹样图案、工艺特点中汲取灵感，创作出既传承传统文化又符合现代审美的文创产品。',
      'zh-TW': '清代琺瑯彩瓷器是中國陶瓷藝術的巔峰之作，以其精湛的工藝和絢麗的色彩聞名於世。本次徵集希望設計師能夠從琺瑯彩的色彩搭配、紋樣圖案、工藝特點中汲取靈感，創作出既傳承傳統文化又符合現代審美的文創產品。',
      'en': 'Qing Dynasty enamel porcelain represents the pinnacle of Chinese ceramic art, renowned for its exquisite craftsmanship and brilliant colors. This collection seeks designers to draw inspiration from the color combinations, patterns, and craftsmanship of enamel porcelain to create cultural products that inherit traditional culture while meeting modern aesthetics.',
    },
    requirements: {
      'zh-CN': [
        '设计作品需体现珐琅彩瓷器的艺术特色',
        '产品类型不限：可以是日用品、装饰品、文具、服饰配件等',
        '提交完整的设计方案，包含效果图、尺寸标注、材质说明',
        '设计需具有可实现性和市场价值',
        '作品需为原创，不得侵犯他人知识产权',
      ],
      'zh-TW': [
        '設計作品需體現琺瑯彩瓷器的藝術特色',
        '產品類型不限：可以是日用品、裝飾品、文具、服飾配件等',
        '提交完整的設計方案，包含效果圖、尺寸標註、材質說明',
        '設計需具有可實現性和市場價值',
        '作品需為原創，不得侵犯他人知識產權',
      ],
      'en': [
        'Design must reflect the artistic characteristics of enamel porcelain',
        'Product type is unlimited: daily items, decorations, stationery, fashion accessories, etc.',
        'Submit complete design proposal including renderings, dimensions, and material specifications',
        'Design must be feasible and have market value',
        'Work must be original and not infringe on intellectual property rights',
      ],
    },
    prize: { 'zh-CN': '¥50,000', 'zh-TW': '¥50,000', 'en': '¥50,000' },
    prizeDetails: {
      'zh-CN': '一等奖1名：奖金¥50,000 + 荣誉证书\n二等奖3名：奖金¥10,000 + 荣誉证书\n三等奖10名：奖金¥3,000 + 荣誉证书\n优秀奖30名：荣誉证书',
      'zh-TW': '一等獎1名：獎金¥50,000 + 榮譽證書\n二等獎3名：獎金¥10,000 + 榮譽證書\n三等獎10名：獎金¥3,000 + 榮譽證書\n優秀獎30名：榮譽證書',
      'en': 'First Prize (1): ¥50,000 + Certificate\nSecond Prize (3): ¥10,000 + Certificate\nThird Prize (10): ¥3,000 + Certificate\nExcellence Award (30): Certificate',
    },
    deadline: '2026-03-31T23:59:59',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=90',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&q=90',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&q=90',
    ],
    downloads: [
      { name: '文物高清素材包.zip', size: '125 MB' },
      { name: '征集要求详细说明.pdf', size: '2.3 MB' },
    ],
  },
  '2': {
    id: 2,
    museum: { 'zh-CN': '国家博物馆', 'zh-TW': '國家博物館', 'en': 'National Museum' },
    artifact: { 'zh-CN': '商代青铜爵', 'zh-TW': '商代青銅爵', 'en': 'Shang Dynasty Bronze Jue' },
    description: {
      'zh-CN': '以青铜器纹样为元素的平面设计作品征集',
      'zh-TW': '以青銅器紋樣為元素的平面設計作品徵集',
      'en': 'Graphic design works featuring bronze vessel patterns',
    },
    fullDescription: {
      'zh-CN': '商代青铜器以其独特的饕餮纹、云雷纹等纹样著称，蕴含着深厚的历史文化内涵。本次征集面向平面设计领域，希望设计师能够将青铜器纹样与现代平面设计相结合，创作出具有视觉冲击力的作品。',
      'zh-TW': '商代青銅器以其獨特的饕餮紋、雲雷紋等紋樣著稱，蘊含著深厚的歷史文化內涵。本次徵集面向平面設計領域，希望設計師能夠將青銅器紋樣與現代平面設計相結合，創作出具有視覺衝擊力的作品。',
      'en': 'Shang Dynasty bronze vessels are renowned for their unique taotie patterns and cloud-thunder motifs, embodying profound historical and cultural significance. This collection targets graphic design, hoping designers can combine bronze vessel patterns with modern graphic design to create visually impactful works.',
    },
    requirements: {
      'zh-CN': [
        '作品类型：海报、插画、包装设计、品牌视觉等',
        '需融入青铜器纹样元素',
        '提交高清源文件（AI/PSD格式）',
        '附带设计说明（300字以内）',
        '作品尺寸不限，但需适合印刷输出',
      ],
      'zh-TW': [
        '作品類型：海報、插畫、包裝設計、品牌視覺等',
        '需融入青銅器紋樣元素',
        '提交高清源文件（AI/PSD格式）',
        '附帶設計說明（300字以內）',
        '作品尺寸不限，但需適合印刷輸出',
      ],
      'en': [
        'Work type: posters, illustrations, packaging design, brand visuals, etc.',
        'Must incorporate bronze vessel pattern elements',
        'Submit high-resolution source files (AI/PSD format)',
        'Include design description (within 300 words)',
        'Work size is unlimited but must be suitable for print output',
      ],
    },
    prize: { 'zh-CN': '¥30,000', 'zh-TW': '¥30,000', 'en': '¥30,000' },
    prizeDetails: {
      'zh-CN': '金奖1名：奖金¥30,000 + 荣誉证书\n银奖2名：奖金¥15,000 + 荣誉证书\n铜奖5名：奖金¥5,000 + 荣誉证书',
      'zh-TW': '金獎1名：獎金¥30,000 + 榮譽證書\n銀獎2名：獎金¥15,000 + 榮譽證書\n銅獎5名：獎金¥5,000 + 榮譽證書',
      'en': 'Gold Award (1): ¥30,000 + Certificate\nSilver Award (2): ¥15,000 + Certificate\nBronze Award (5): ¥5,000 + Certificate',
    },
    deadline: '2026-04-15T23:59:59',
    images: [
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&q=90',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=90',
    ],
    downloads: [
      { name: '青铜器纹样高清素材.zip', size: '89 MB' },
      { name: '征集规则说明.pdf', size: '1.8 MB' },
    ],
  },
  '3': {
    id: 3,
    museum: { 'zh-CN': '上海博物馆', 'zh-TW': '上海博物館', 'en': 'Shanghai Museum' },
    artifact: { 'zh-CN': '明代青花瓷盘', 'zh-TW': '明代青花瓷盤', 'en': 'Ming Blue-and-White Porcelain Plate' },
    description: {
      'zh-CN': '青花瓷图案在现代家居用品中的创新应用',
      'zh-TW': '青花瓷圖案在現代家居用品中的創新應用',
      'en': 'Innovative application of blue-and-white patterns in modern home products',
    },
    fullDescription: {
      'zh-CN': '明代青花瓷以其清新淡雅的蓝白色调和精美的图案设计闻名。本次征集聚焦家居用品领域，期待设计师将青花瓷的经典元素融入现代家居产品中，创造出兼具实用性与艺术性的设计作品。',
      'zh-TW': '明代青花瓷以其清新淡雅的藍白色調和精美的圖案設計聞名。本次徵集聚焦家居用品領域，期待設計師將青花瓷的經典元素融入現代家居產品中，創造出兼具實用性與藝術性的設計作品。',
      'en': 'Ming Dynasty blue-and-white porcelain is renowned for its fresh, elegant blue-white tones and exquisite pattern designs. This collection focuses on home products, expecting designers to integrate classic blue-and-white elements into modern home items, creating designs that combine practicality with artistry.',
    },
    requirements: {
      'zh-CN': [
        '产品类型：餐具、茶具、花瓶、装饰品等家居用品',
        '需体现青花瓷的艺术特色',
        '提交3D效果图或实物样品照片',
        '包含产品尺寸、材质、工艺说明',
        '考虑批量生产的可行性',
      ],
      'zh-TW': [
        '產品類型：餐具、茶具、花瓶、裝飾品等家居用品',
        '需體現青花瓷的藝術特色',
        '提交3D效果圖或實物樣品照片',
        '包含產品尺寸、材質、工藝說明',
        '考慮批量生產的可行性',
      ],
      'en': [
        'Product type: tableware, tea sets, vases, decorations, and other home items',
        'Must reflect the artistic characteristics of blue-and-white porcelain',
        'Submit 3D renderings or physical sample photos',
        'Include product dimensions, materials, and process descriptions',
        'Consider feasibility of mass production',
      ],
    },
    prize: { 'zh-CN': '¥40,000', 'zh-TW': '¥40,000', 'en': '¥40,000' },
    prizeDetails: {
      'zh-CN': '特等奖1名：奖金¥40,000 + 荣誉证书 + 产品化机会\n一等奖2名：奖金¥20,000 + 荣誉证书\n二等奖5名：奖金¥8,000 + 荣誉证书',
      'zh-TW': '特等獎1名：獎金¥40,000 + 榮譽證書 + 產品化機會\n一等獎2名：獎金¥20,000 + 榮譽證書\n二等獎5名：獎金¥8,000 + 榮譽證書',
      'en': 'Grand Prize (1): ¥40,000 + Certificate + Productization Opportunity\nFirst Prize (2): ¥20,000 + Certificate\nSecond Prize (5): ¥8,000 + Certificate',
    },
    deadline: '2026-05-01T23:59:59',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&q=90',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=90',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&q=90',
    ],
    downloads: [
      { name: '青花瓷高清图库.zip', size: '156 MB' },
      { name: '设计规范文档.pdf', size: '3.1 MB' },
    ],
  },
};

export default function CollectionDetail() {
  const [, params] = useRoute('/collection/:id');
  const { language, t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);

  const collectionId = params?.id || '1';
  const collection = mockCollectionDetails[collectionId];

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
    if (collection && currentImageIndex < collection.images.length - 1) {
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
      // 向左滑动，显示下一张
      nextImage();
    } else if (distance < -minSwipeDistance) {
      // 向右滑动，显示上一张
      prevImage();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const [, setLocation] = useLocation();

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">征集项目不存在</h2>
          <Button className="bg-[#C8102E] hover:bg-[#A00D24]" onClick={() => setLocation('/')}>
            {t('workDetail.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${collection.museum[language]} - ${collection.artifact[language]}`}
        description={collection.fullDescription[language]}
        image={collection.images[0]}
        type="article"
        keywords={`${collection.museum[language]},${collection.artifact[language]},文创征集,设计比赛,博物馆`}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navigation />

      {/* 面包屑导航 */}
      <div className="container pt-24 pb-8">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="-ml-2 hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('workDetail.backToHome')}
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
                src={collection.images[currentImageIndex]}
                alt={collection.artifact[language]}
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
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background hover:scale-110"
                  aria-label="上一张"
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
              )}
              
              {currentImageIndex < collection.images.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background hover:scale-110"
                  aria-label="下一张"
                >
                  <ChevronRight className="w-6 h-6 text-foreground" />
                </button>
              )}
              
              {/* 图片计数器 */}
              <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-foreground">
                {currentImageIndex + 1} / {collection.images.length}
              </div>
            </div>

            {/* 缩略图导航 */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {collection.images.map((image: string, index: number) => (
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
                    alt={`${collection.artifact[language]} ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：详细信息 */}
          <div className="reveal-animation" style={{ animationDelay: '0.2s' }}>
            {/* 博物馆标识 */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <span className="text-sm font-medium text-primary">{collection.museum[language]}</span>
            </div>

            {/* 标题 */}
            <h1 className="text-4xl font-bold text-foreground mb-4">{collection.artifact[language]}</h1>

            {/* 简短描述 */}
            <p className="text-lg text-muted-foreground mb-6">{collection.description[language]}</p>

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
            <div className="bg-gradient-to-r from-amber-gold/10 to-bronze-green/10 border border-amber-gold/30 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-amber-gold" />
                <span className="font-medium text-foreground">奖金设置</span>
              </div>
              <div className="text-2xl font-bold text-amber-gold mb-3">总奖金 {collection.prize[language]}</div>
              <div className="text-sm text-foreground whitespace-pre-line">{collection.prizeDetails[language]}</div>
            </div>

            {/* 截止日期 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Calendar className="w-4 h-4" />
              <span>截止日期：{new Date(collection.deadline).toLocaleDateString(language)}</span>
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
                title={collection.artifact[language]}
                description={collection.description[language]}
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
              <p className="text-foreground leading-relaxed mb-8">{collection.fullDescription[language]}</p>

              <h3 className="text-xl font-bold text-foreground mb-4">征集要求</h3>
              <ul className="space-y-3">
                {collection.requirements[language].map((req: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <span className="text-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 资料下载 */}
          <div className="reveal-animation" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-foreground mb-6">资料下载</h3>
              <div className="space-y-4">
                {collection.downloads.map((file: any, index: number) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {file.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{file.size}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

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
          collectionTitle={collection.artifact[language]}
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
        images={collection.images}
        initialIndex={currentImageIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}
