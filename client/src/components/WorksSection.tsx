/**
 * 新中式数字主义设计系统 - 设计作品展示
 * 采用瀑布流布局（CSS columns 内联样式），首页展示固定 8 件作品
 * 使用印章纹理背景
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { images } from '@/config/images';
import { useLocation } from 'wouter';

export default function WorksSection() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // 首页只加载前 8 件作品，不做无限滚动
  const { data, isLoading } = trpc.work.search.useQuery(
    { page: 1, pageSize: 8 },
    { enabled: true }
  );

  const works = data?.items ?? [];

  // 高度数组（rem），产生瀑布流错落感
  const heights = ['14rem', '18rem', '16rem', '20rem', '15rem', '19rem', '17rem', '21rem'];

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

        {/* 首次加载状态 */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && works.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('section.works.empty')}</p>
          </div>
        )}

        {/* 瀑布流布局 - 使用内联 CSS 确保样式在生产环境生效 */}
        {works.length > 0 && (
          <>
          <style>{`
            .works-masonry { column-count: 2; column-gap: 1.5rem; }
            @media (min-width: 768px) { .works-masonry { column-count: 3; } }
            @media (min-width: 1280px) { .works-masonry { column-count: 4; } }
          `}</style>
          <div className="works-masonry">
            {works.map((work: any, index: number) => {
              const imgHeight = heights[index % heights.length];
              return (
                <Link key={work.id} href={`/work/${work.id}`}>
                  <div
                    className="reveal-animation cursor-pointer"
                    style={{ breakInside: 'avoid', marginBottom: '1.5rem', animationDelay: `${index * 0.08}s` }}
                  >
                    <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                      {/* 作品图片 - 不同高度产生瀑布流效果 */}
                      <div className="relative overflow-hidden" style={{ height: imgHeight }}>
                        <img
                          src={work.images ? JSON.parse(work.images)[0] : images.placeholder.design}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        {/* 获奖标记 */}
                        {work.status === 'winner' && (
                          <div className="absolute top-4 right-4">
                            <span className="seal-badge">{t('badge.winner')}</span>
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
                          {work.designer?.name || t('section.works.designer')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          </>
        )}

        {/* 查看更多作品按钮（有作品时始终显示） */}
        {works.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setLocation('/works')}
              className="group relative px-10 py-3 border-2 border-[#C8102E] text-[#C8102E] font-medium tracking-widest overflow-hidden transition-all duration-300 hover:text-white"
            >
              <span className="relative z-10">{t('section.works.viewAll')}</span>
              <div className="absolute inset-0 bg-[#C8102E] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
