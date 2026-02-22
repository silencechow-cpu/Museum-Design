/**
 * 新中式数字主义设计系统 - 文物征集展示
 * 采用非对称布局，文物图片配合印章式标记
 * 背景使用水墨意境图案
 * 支持按截止时间和奖金金额排序
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import CollectionSearchFilter, { SearchFilters } from './CollectionSearchFilter';
import { images } from '@/config/images';

// Mock数据已移除，使用真实API数据
const mockCollections_removed = [
  {
    id: 1,
    museum: { 'zh-CN': '故宫博物院', 'zh-TW': '故宮博物院', 'en': 'Palace Museum' },
    artifact: { 'zh-CN': '清代珐琅彩瓷瓶', 'zh-TW': '清代琺瑯彩瓷瓶', 'en': 'Qing Enamel Porcelain Vase' },
    description: {
      'zh-CN': '征集以珐琅彩瓷为灵感的现代文创产品设计',
      'zh-TW': '徵集以琺瑯彩瓷為靈感的現代文創產品設計',
      'en': 'Seeking modern creative product designs inspired by enamel porcelain',
    },
    prize: { 'zh-CN': '奖金 ¥50,000', 'zh-TW': '獎金 ¥50,000', 'en': 'Prize ¥50,000' },
    prizeAmount: 50000,
    deadline: { 'zh-CN': '截止 2026.03.31', 'zh-TW': '截止 2026.03.31', 'en': 'Deadline 2026.03.31' },
    deadlineDate: new Date('2026-03-31'),
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80',
    status: 'recruiting',
  },
  {
    id: 2,
    museum: { 'zh-CN': '国家博物馆', 'zh-TW': '國家博物館', 'en': 'National Museum' },
    artifact: { 'zh-CN': '商代青铜爵', 'zh-TW': '商代青銅爵', 'en': 'Shang Dynasty Bronze Jue' },
    description: {
      'zh-CN': '以青铜器纹样为元素的平面设计作品征集',
      'zh-TW': '以青銅器紋樣為元素的平面設計作品徵集',
      'en': 'Graphic design works featuring bronze vessel patterns',
    },
    prize: { 'zh-CN': '奖金 ¥30,000', 'zh-TW': '獎金 ¥30,000', 'en': 'Prize ¥30,000' },
    prizeAmount: 30000,
    deadline: { 'zh-CN': '截止 2026.04.15', 'zh-TW': '截止 2026.04.15', 'en': 'Deadline 2026.04.15' },
    deadlineDate: new Date('2026-04-15'),
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80',
    status: 'recruiting',
  },
  {
    id: 3,
    museum: { 'zh-CN': '上海博物馆', 'zh-TW': '上海博物館', 'en': 'Shanghai Museum' },
    artifact: { 'zh-CN': '明代青花瓷盘', 'zh-TW': '明代青花瓷盤', 'en': 'Ming Blue-and-White Porcelain Plate' },
    description: {
      'zh-CN': '青花瓷图案在现代家居用品中的创新应用',
      'zh-TW': '青花瓷圖案在現代家居用品中的創新應用',
      'en': 'Innovative application of blue-and-white patterns in modern home products',
    },
    prize: { 'zh-CN': '奖金 ¥40,000', 'zh-TW': '獎金 ¥40,000', 'en': 'Prize ¥40,000' },
    prizeAmount: 40000,
    deadline: { 'zh-CN': '截止 2026.05.01', 'zh-TW': '截止 2026.05.01', 'en': 'Deadline 2026.05.01' },
    deadlineDate: new Date('2026-05-01'),
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80',
    status: 'recruiting',
  },
  {
    id: 4,
    museum: { 'zh-CN': '陕西历史博物馆', 'zh-TW': '陝西歷史博物館', 'en': 'Shaanxi History Museum' },
    artifact: { 'zh-CN': '唐三彩骆驼', 'zh-TW': '唐三彩駱駝', 'en': 'Tang Sancai Camel' },
    description: {
      'zh-CN': '唐三彩元素在现代艺术品中的创新表达',
      'zh-TW': '唐三彩元素在現代藝術品中的創新表達',
      'en': 'Innovative expression of Tang Sancai elements in modern artworks',
    },
    prize: { 'zh-CN': '奖金 ¥60,000', 'zh-TW': '獎金 ¥60,000', 'en': 'Prize ¥60,000' },
    prizeAmount: 60000,
    deadline: { 'zh-CN': '截止 2026.02.28', 'zh-TW': '截止 2026.02.28', 'en': 'Deadline 2026.02.28' },
    deadlineDate: new Date('2026-02-28'),
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80',
    status: 'recruiting',
  },
  {
    id: 5,
    museum: { 'zh-CN': '湖南省博物馆', 'zh-TW': '湖南省博物館', 'en': 'Hunan Provincial Museum' },
    artifact: { 'zh-CN': '马王堆汉墓帛画', 'zh-TW': '馬王堆漢墓帛畫', 'en': 'Mawangdui Silk Painting' },
    description: {
      'zh-CN': '汉代帛画图案在现代服饰设计中的应用',
      'zh-TW': '漢代帛畫圖案在現代服飾設計中的應用',
      'en': 'Application of Han Dynasty silk painting patterns in modern fashion design',
    },
    prize: { 'zh-CN': '奖金 ¥35,000', 'zh-TW': '獎金 ¥35,000', 'en': 'Prize ¥35,000' },
    prizeAmount: 35000,
    deadline: { 'zh-CN': '截止 2026.03.15', 'zh-TW': '截止 2026.03.15', 'en': 'Deadline 2026.03.15' },
    deadlineDate: new Date('2026-03-15'),
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80',
    status: 'recruiting',
  },
  {
    id: 6,
    museum: { 'zh-CN': '四川博物院', 'zh-TW': '四川博物院', 'en': 'Sichuan Museum' },
    artifact: { 'zh-CN': '三星堆青铜面具', 'zh-TW': '三星堆青銅面具', 'en': 'Sanxingdui Bronze Mask' },
    description: {
      'zh-CN': '三星堆文化元素在现代文创产品中的创意设计',
      'zh-TW': '三星堆文化元素在現代文創產品中的創意設計',
      'en': 'Creative design of Sanxingdui cultural elements in modern cultural products',
    },
    prize: { 'zh-CN': '奖金 ¥80,000', 'zh-TW': '獎金 ¥80,000', 'en': 'Prize ¥80,000' },
    prizeAmount: 80000,
    deadline: { 'zh-CN': '截止 2026.06.30', 'zh-TW': '截止 2026.06.30', 'en': 'Deadline 2026.06.30' },
    deadlineDate: new Date('2026-06-30'),
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
    status: 'recruiting',
  },
];

type SortOption = 'default' | 'deadline-asc' | 'deadline-desc' | 'prize-asc' | 'prize-desc';

export default function CollectionsSection() {
  const { t, i18n } = useTranslation();
  const language = i18n.language as 'zh-CN' | 'zh-TW' | 'en';
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ status: 'active' });

  // 使用搜索API获取征集列表，首页只显示6个（2行）
  const { data: allCollections, isLoading } = trpc.collection.search.useQuery({
    ...searchFilters,
    page: 1,
    pageSize: 6,
  });
  const collections = allCollections?.items;

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
  };

  return (
    <section
      id="collections"
      className="relative py-32 overflow-hidden"
      style={{
        backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/b4IECgFUdVYY2b0QjOwudj/sandbox/n7AkC2MTk4OetiWx53IXGA-img-4_1770722965000_na1fn_Y3JlYXRpdmUtd29yay1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYjRJRUNnRlVkVllZMmIwUWpPd3Vkai9zYW5kYm94L243QWtDMk1UazRPZXRpV3g1M0lYR0EtaW1nLTRfMTc3MDcyMjk2NTAwMF9uYTFmbl9ZM0psWVhScGRtVXRkMjl5YXkxaVp3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=S9fi5SdFm8FB5z4EVp8XA3GDurJVnMFVeLqhdUdvpjkTyD6BL4m3M5YZee9QdQ-UZ251HkOdWKOr1IbIOCaCWD-bmStKVM~dQW74jNYlNkr5s4Puhf6QTA5UZYhUTGXFKEqkx2fZpbOKTk-DTc4MsCDGO2OXNZh--48oxCryry1w3UtCXbr73SHpIy0c00jZ32AwXq5g3IKRCJodUpenKwkjebzDGfSgOOOJJstHGKLVIFhs-QWmYp5uH7n-o13QDAlPLDm8XTtqfGxtwK9nXVLdJsXRmPh~c0-fLjKPsOkr9td9XY2hos0wrmkEr0I5BuvLu7LIgL6Y-IW9CkHgaA__')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-background/85" />

      <div className="container relative z-10">
        {/* 标题区域 */}
        <div className="text-center mb-12 reveal-animation">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('section.collections.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('section.collections.subtitle')}
          </p>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && (!collections || collections.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('section.collections.empty')}</p>
          </div>
        )}

        {/* 征集卡片网格 - 非对称布局 */}
        {!isLoading && collections && collections.length > 0 && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
            <div
              key={collection.id}
              className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500 reveal-animation"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 文物图片 */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={collection.images ? JSON.parse(collection.images)[0] : images.placeholder.artifact}
                  alt={collection.artifactName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* 印章式标记 */}
                <div className="absolute top-4 right-4">
                  <span className="seal-badge">{t('badge.recruiting')}</span>
                </div>
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-black/60 to-transparent" />
              </div>

              {/* 内容区域 */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {collection.artifactName}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {collection.description || collection.artifactDescription}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm font-medium text-bronze-green">
                    {t('section.collections.prize')} ¥{(collection.prizeAmount || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('section.collections.deadline')} {formatDate(collection.deadline)}
                  </span>
                </div>

                <Link href={`/collection/${collection.id}`}>
                  <button className="mt-4 w-full py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    {t('common.viewMore')}
                  </button>
                </Link>
              </div>
            </div>
            ))}
          </div>
          
          {/* 查看更多按钮 */}
          {allCollections && allCollections.total >= 6 && (
            <div className="flex justify-center mt-12">
              <Link href="/collections">
                <button className="px-8 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-300 font-medium">
                  {t('section.collections.viewAll')}
                </button>
              </Link>
            </div>
          )}
          </>
        )}
      </div>
    </section>
  );
}
