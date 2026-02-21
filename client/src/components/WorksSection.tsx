/**
 * 新中式数字主义设计系统 - 设计作品展示
 * 采用瀑布流布局，展示设计师和高校的二创作品
 * 使用印章纹理背景
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { images } from '@/config/images';

const mockWorks = [
  {
    id: 1,
    title: { 'zh-CN': '青花纹样手机壳设计', 'zh-TW': '青花紋樣手機殼設計', 'en': 'Blue-and-White Phone Case Design' },
    designer: { 'zh-CN': '中央美术学院设计团队', 'zh-TW': '中央美術學院設計團隊', 'en': 'CAFA Design Team' },
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&q=80',
    status: 'awarded',
    height: 'h-80',
  },
  {
    id: 2,
    title: { 'zh-CN': '青铜纹样帆布包', 'zh-TW': '青銅紋樣帆布包', 'en': 'Bronze Pattern Canvas Bag' },
    designer: { 'zh-CN': '清华大学美术学院', 'zh-TW': '清華大學美術學院', 'en': 'Tsinghua Academy of Arts & Design' },
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
    status: 'featured',
    height: 'h-96',
  },
  {
    id: 3,
    title: { 'zh-CN': '文物元素海报设计', 'zh-TW': '文物元素海報設計', 'en': 'Artifact Element Poster Design' },
    designer: { 'zh-CN': '独立设计师 张艺', 'zh-TW': '獨立設計師 張藝', 'en': 'Independent Designer Zhang Yi' },
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    status: 'featured',
    height: 'h-72',
  },
  {
    id: 4,
    title: { 'zh-CN': '瓷器图案丝巾设计', 'zh-TW': '瓷器圖案絲巾設計', 'en': 'Porcelain Pattern Silk Scarf Design' },
    designer: { 'zh-CN': '同济大学设计创意学院', 'zh-TW': '同濟大學設計創意學院', 'en': 'Tongji Design & Innovation' },
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&q=80',
    status: 'awarded',
    height: 'h-80',
  },
  {
    id: 5,
    title: { 'zh-CN': '古代书法文创笔记本', 'zh-TW': '古代書法文創筆記本', 'en': 'Ancient Calligraphy Notebook' },
    designer: { 'zh-CN': '独立设计师 李明', 'zh-TW': '獨立設計師 李明', 'en': 'Independent Designer Li Ming' },
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    status: 'featured',
    height: 'h-88',
  },
  {
    id: 6,
    title: { 'zh-CN': '玉器纹样珠宝设计', 'zh-TW': '玉器紋樣珠寶設計', 'en': 'Jade Pattern Jewelry Design' },
    designer: { 'zh-CN': '中国美术学院', 'zh-TW': '中國美術學院', 'en': 'China Academy of Art' },
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    status: 'awarded',
    height: 'h-96',
  },
];

export default function WorksSection() {
  const { t } = useTranslation();
  
  // 获取作品列表，首页只显示6个（2行）
  const { data: allWorks, isLoading } = trpc.work.getAll.useQuery();
  const works = allWorks?.slice(0, 6);

  return (
    <section
      id="works"
      className="relative py-32 overflow-hidden"
      style={{
        backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/b4IECgFUdVYY2b0QjOwudj/sandbox/n7AkC2MTk4OetiWx53IXGA-img-5_1770722959000_na1fn_ZGVzaWduZXItc2VjdGlvbi1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYjRJRUNnRlVkVllZMmIwUWpPd3Vkai9zYW5kYm94L243QWtDMk1UazRPZXRpV3g1M0lYR0EtaW1nLTVfMTc3MDcyMjk1OTAwMF9uYTFmbl9aR1Z6YVdkdVpYSXRjMlZqZEdsdmJpMWlady5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=eSrY22HVh3pXGP9TX5WqQ3c-3ALO2FulS4dI9baFs57eTUmj9ZCh31-B9DSWMwmEYkQslmVu1z5X752MKNIxsD5ZOABoGIdCtYRl8sDb~abRJO8YIYaw8rENmn8g6GAANKm4mG2A3nzY01-ZeouE3WdV9bZnlb1lWISg23YZuKDlwMPE9~~igG0WAu4C7UKXyHknnZTJe~DrZJKEvxiNFnPEv02NiMr5-DK7vpel0eBtr-6RcV0Y-DGf6XrkKUBnqva7-zGfMh186iMhSn3UInZCBOPb-GEsDhoU5COo9z6jmmit8Fhuf70oqLSp1qyDkTdVucgNK0AS9lENjdJzhA__')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-background/90" />

      <div className="container relative z-10">
        {/* 标题区域 */}
        <div className="text-center mb-16 reveal-animation">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('section.works.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('section.works.subtitle')}
          </p>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && (!works || works.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('section.works.empty')}</p>
          </div>
        )}

        {/* 瀑布流布局 */}
        {!isLoading && works && works.length > 0 && (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
          {works.map((work: any, index: number) => (
            <Link key={work.id} href={`/work/${work.id}`}>
            <div
              className="break-inside-avoid mb-6 reveal-animation cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                {/* 作品图片 */}
                <div className="relative overflow-hidden">
                  <img
                    src={work.images ? JSON.parse(work.images)[0] : images.placeholder.design}
                    alt={work.title}
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* 获奖标记 */}
                  {work.status === 'awarded' && (
                    <div className="absolute top-4 right-4">
                      <span className="seal-badge">{t('badge.awarded')}</span>
                    </div>
                  )}

                  {/* 悬停遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-ink-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                    <div className="p-6 w-full">
                      <h3 className="text-lg font-bold text-paper-white mb-2">
                        {work.title}
                      </h3>
                      <p className="text-sm text-paper-white/80">
                        {work.designer?.name || t('section.works.designer')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 底部信息栏 */}
                <div className="p-4 bg-card">
                  <h3 className="text-base font-bold text-foreground mb-1 line-clamp-1">
                    {work.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {work.designer?.name || '设计师'}
                  </p>
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
        )}

        {/* 查看更多按钮 */}
        {!isLoading && allWorks && allWorks.length >= 6 && (
        <div className="text-center mt-12">
          <Link href="/works">
          <button className="px-8 py-3 border-2 border-primary text-primary rounded-md font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            {t('section.works.viewAll')}
          </button>
          </Link>
        </div>
        )}
      </div>
    </section>
  );
}
