/**
import { useTranslation } from 'react-i18next';
 * 征集列表页面
 * 展示所有征集项目，支持搜索、筛选、排序和无限滚动
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { Loader2, ArrowLeft, Share2, Heart } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CollectionSearchFilter, { SearchFilters } from '@/components/CollectionSearchFilter';
import SEOHead from '@/components/SEOHead';
import LazyImage from '@/components/LazyImage';

export default function CollectionList() {
  const { language, t } = useLanguage();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ status: 'active' });
  const [page, setPage] = useState(1);
  const [allCollections, setAllCollections] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // 稳定的查询参数（避免无限循环）
  const queryParams = useMemo(() => ({
    ...searchFilters,
    page,
    pageSize: 20,
  }), [searchFilters, page]);

  // 获取征集列表（分页）
  const { data, isLoading, isFetching } = trpc.collection.search.useQuery(queryParams);

  // 当数据返回时更新列表
  useEffect(() => {
    if (data) {
      if (page === 1) {
        // 第一页：替换所有数据
        setAllCollections(data.items);
      } else {
        // 后续页：追加数据
        setAllCollections(prev => [...prev, ...data.items]);
      }
      setHasMore(data.hasMore);
      setTotal(data.total);
    }
  }, [data, page]);

  // 当筛选条件改变时，重置分页
  useEffect(() => {
    setPage(1);
    setAllCollections([]);
    setHasMore(true);
  }, [searchFilters]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, hasMore]);

  // 无限滚动
  const { sentinelRef } = useInfiniteScroll({
    loading: isFetching,
    hasMore,
    onLoadMore: handleLoadMore,
    threshold: 300,
  });

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title={t('collection.list.title')}
        description={t('collection.list.subtitle')}
        keywords={t('collection.list.keywords')}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navigation />
      
      <div className="pt-24 pb-16 bg-background">
        <div className="container">
          {/* 页面标题 */}
          <div className="mb-8">
            <Link href="/">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" />
                {t('common.backToHome')}
              </button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {t('collection.list.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('collection.list.subtitle')}
            </p>
          </div>

          {/* 搜索和筛选 */}
          <CollectionSearchFilter onSearch={handleSearch} />

          {/* 统计显示 */}
          {!isLoading && total > 0 && (
            <div className="mb-6 text-sm text-muted-foreground">
              {t('collection.stats.found')} <span className="font-semibold text-foreground">{total}</span> {t('collection.stats.items')}
            </div>
          )}

          {/* 初始加载状态 */}
          {isLoading && page === 1 && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
            </div>
          )}

          {/* 空状态 */}
          {!isLoading && allCollections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('collection.empty')}</p>
            </div>
          )}

          {/* 征集卡片网格 */}
          {allCollections.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500"
                  >
                    {/* 文物图片 */}
                    <div className="relative h-64 overflow-hidden">
                      <LazyImage
                        src={collection.images ? JSON.parse(collection.images)[0] : 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80'}
                        alt={collection.artifactName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* 印章式标记 */}
                      <div className="absolute top-4 right-4">
                        <span className="seal-badge">{t('badge.recruiting')}</span>
                      </div>
                      
                      {/* 快捷操作按钮 */}
                      <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // TODO: 实现分享功能
                            alert(t('toast.success'));
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                          title={t('common.share')}
                        >
                          <Share2 className="w-4 h-4 text-gray-700" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // TODO: 实现收藏功能
                            alert(t('toast.success'));
                          }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                          title={t('common.favorite')}
                        >
                          <Heart className="w-4 h-4 text-gray-700" />
                        </button>
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-bronze-green">
                            {t('collection.prize')} ￥{(collection.prizeAmount || 0).toLocaleString()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            collection.status === 'active' ? 'bg-green-100 text-green-700' :
                            collection.status === 'closed' ? 'bg-yellow-100 text-yellow-700' :
                            collection.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {collection.status === 'active' ? t('badge.recruiting') :
                             collection.status === 'closed' ? t('badge.closed') :
                             collection.status === 'completed' ? t('badge.closed') : t('badge.draft')}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {t('collection.deadline')} {formatDate(collection.deadline)}
                        </span>
                      </div>

                      <Link href={`/collection/${collection.id}`}>
                        <button className="mt-4 w-full py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                          {t('common.viewDetails')}
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* 无限滚动哨兵元素 */}
              <div ref={sentinelRef} className="py-8">
                {isFetching && (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#C8102E]" />
                  </div>
                )}
                {!isFetching && !hasMore && (
                  <div className="text-center text-sm text-muted-foreground">
                    {t('collection.stats.total')} {total} {t('collection.stats.items')}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
