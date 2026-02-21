/**
import { useTranslation } from 'react-i18next';
 * 作品列表页面
 * 展示所有作品，支持搜索、筛选、排序和无限滚动
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Search, Loader2, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/LazyImage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import WorkRatingDisplay from '@/components/WorkRatingDisplay';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function WorkList() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [allWorks, setAllWorks] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // 稳定的查询参数（避免无限循环）
  const queryParams = useMemo(() => ({
    keyword: searchTerm || undefined,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    page,
    pageSize: 20,
  }), [searchTerm, statusFilter, page]);

  // 获取作品列表（分页）
  const { data, isLoading, isFetching } = trpc.work.search.useQuery(queryParams);

  // 当数据返回时更新列表
  useEffect(() => {
    if (data) {
      if (page === 1) {
        // 第一页：替换所有数据
        setAllWorks(data.items);
      } else {
        // 后续页：追加数据
        setAllWorks(prev => [...prev, ...data.items]);
      }
      setHasMore(data.hasMore);
      setTotal(data.total);
    }
  }, [data, page]);

  // 当筛选条件改变时，重置分页
  useEffect(() => {
    setPage(1);
    setAllWorks([]);
    setHasMore(true);
  }, [searchTerm, statusFilter]);

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

  // 获取已选筛选条件
  const getActiveFilters = () => {
    const filters: Array<{ key: string; label: string }> = [];
    
    if (searchTerm.trim()) {
      filters.push({ key: 'search', label: `${t('work.filter.keyword')}: ${searchTerm}` });
    }
    
    if (statusFilter && statusFilter !== 'all') {
      const statusLabels: Record<string, string> = {
        'submitted': t('work.filter.status.submitted'),
        'approved': t('work.filter.status.approved'),
        'rejected': t('work.filter.status.rejected'),
        'winner': t('work.filter.status.awarded')
      };
      filters.push({ key: 'status', label: `${t('work.filter.status')}: ${statusLabels[statusFilter]}` });
    }
    
    return filters;
  };

  // 移除单个筛选条件
  const handleRemoveFilter = (key: string) => {
    if (key === 'search') {
      setSearchTerm('');
    } else if (key === 'status') {
      setStatusFilter('all');
    }
  };

  // 重置所有筛选
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6 -ml-2 hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.backToHome')}
        </Button>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('work.list.title')}</h1>
          <p className="text-muted-foreground">
            {t('work.list.subtitle')}
          </p>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('work.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 状态筛选 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('work.filter.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('work.filter.status.all')}</SelectItem>
                <SelectItem value="submitted">{t('work.filter.status.submitted')}</SelectItem>
                <SelectItem value="approved">{t('work.filter.status.approved')}</SelectItem>
                <SelectItem value="rejected">{t('work.filter.status.rejected')}</SelectItem>
                <SelectItem value="winner">{t('work.filter.status.awarded')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 已选筛选条件标签 */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('common.selectedFilters')}</span>
              {activeFilters.map(filter => (
                <Badge 
                  key={filter.key} 
                  variant="secondary" 
                  className="gap-1 px-3 py-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleRemoveFilter(filter.key)}
                >
                  {filter.label}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
              <Button onClick={handleResetFilters} variant="ghost" size="sm" className="h-7">
                {t('common.clearAll')}
              </Button>
            </div>
          )}
        </div>

        {/* 结果统计 */}
        {!isLoading && total > 0 && (
          <div className="mb-6 text-sm text-muted-foreground">
            {t('work.stats.found')} <span className="font-semibold text-foreground">{total}</span> {t('work.stats.items')}
          </div>
        )}

        {/* 初始加载状态 */}
        {isLoading && page === 1 && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && allWorks.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">{t('work.empty')}</p>
          </div>
        )}

        {/* 作品网格 */}
        {allWorks.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allWorks.map((work: any) => (
                <Link key={work.id} href={`/work/${work.id}`}>
                  <div className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                    {/* 作品图片 */}
                    <div className="relative h-64 overflow-hidden">
                      <LazyImage
                        src={
                          work.images
                            ? JSON.parse(work.images)[0]
                            : 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&q=80'
                        }
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* 获奖标记 */}
                      {work.status === 'winner' && (
                        <div className="absolute top-4 right-4">
                          <span className="seal-badge">{t('badge.awarded')}</span>
                        </div>
                      )}
                    </div>

                    {/* 作品信息 */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">
                        {work.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {work.description || t('common.noData')}
                      </p>

                      {/* 评分显示 */}
                      <WorkRatingDisplay workId={work.id} />

                      {/* 状态标签 */}
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            work.status === 'winner'
                              ? 'bg-yellow-100 text-yellow-800'
                              : work.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : work.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {work.status === 'winner'
                            ? t('badge.awarded')
                            : work.status === 'approved'
                            ? t('badge.approved')
                            : work.status === 'rejected'
                            ? t('badge.rejected')
                            : t('badge.submitted')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
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
                  {t('work.allLoaded')}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
