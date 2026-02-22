/**
 * 博物馆列表页面
 * 支持无限滚动、排序和筛选功能
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, Building2, X, Loader2 } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function MuseumList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'collectionsCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [province, setProvince] = useState<string | undefined>();
  const [allMuseums, setAllMuseums] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // 稳定的查询参数（避免无限循环）
  const queryParams = useMemo(() => ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    keyword: keyword || undefined,
    province,
  }), [page, pageSize, sortBy, sortOrder, keyword, province]);

  const { data, isLoading, isFetching } = trpc.museum.listPaginated.useQuery(queryParams);

  // 当数据返回时更新列表
  useEffect(() => {
    if (data) {
      if (page === 1) {
        // 第一页：替换所有数据
        setAllMuseums(data.museums);
      } else {
        // 后续页：追加数据
        setAllMuseums(prev => [...prev, ...data.museums]);
      }
      setHasMore(page < data.totalPages);
      setTotal(data.total);
    }
  }, [data, page]);

  // 当筛选条件改变时，重置分页
  useEffect(() => {
    setPage(1);
    setAllMuseums([]);
    setHasMore(true);
  }, [keyword, province, sortBy, sortOrder]);

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

  const handleSearch = () => {
    setKeyword(searchInput);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleProvinceChange = (value: string) => {
    setProvince(value === 'all' ? undefined : value);
  };

  // 获取已选筛选条件
  const getActiveFilters = () => {
    const filters: Array<{ key: string; label: string }> = [];
    
    if (keyword.trim()) {
      filters.push({ key: 'keyword', label: `${t('common.keyword')}: ${keyword}` });
    }
    
    if (province) {
      filters.push({ key: 'province', label: `${t('museum.province')}: ${province}` });
    }
    
    return filters;
  };

  // 移除单个筛选条件
  const handleRemoveFilter = (key: string) => {
    if (key === 'keyword') {
      setKeyword('');
      setSearchInput('');
    } else if (key === 'province') {
      setProvince(undefined);
    }
  };

  // 重置所有筛选
  const handleResetFilters = () => {
    setKeyword('');
    setSearchInput('');
    setProvince(undefined);
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <SEOHead
        title={t('museum.list.title')}
        description={t('museum.list.subtitle')}
        keywords={t('museum.list.keywords')}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#8b4513] mb-4">{t('museum.list.title')}</h1>
          <p className="text-lg text-gray-600">{t('museum.list.subtitle')}</p>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder={t('museum.search.placeholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-[#C8102E] hover:bg-[#A00D24]">
                  {t('common.search')}
                </Button>
              </div>
            </div>

            {/* 地区筛选 */}
            <div className="w-full md:w-[200px]">
              <Select value={province || 'all'} onValueChange={handleProvinceChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('museum.filter.province')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="北京">北京</SelectItem>
                  <SelectItem value="上海">上海</SelectItem>
                  <SelectItem value="江苏">江苏</SelectItem>
                  <SelectItem value="浙江">浙江</SelectItem>
                  <SelectItem value="陕西">陕西</SelectItem>
                  <SelectItem value="河南">河南</SelectItem>
                  <SelectItem value="湖北">湖北</SelectItem>
                  <SelectItem value="四川">四川</SelectItem>
                  <SelectItem value="广东">广东</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 排序选择 */}
            <div className="w-full md:w-[200px]">
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">{t('museum.sort.newest')}</SelectItem>
                  <SelectItem value="createdAt-asc">{t('museum.sort.oldest')}</SelectItem>
                  <SelectItem value="name-asc">{t('museum.sort.nameAsc')}</SelectItem>
                  <SelectItem value="name-desc">{t('museum.sort.nameDesc')}</SelectItem>
                  <SelectItem value="collectionsCount-desc">{t('museum.sort.collectionsDesc')}</SelectItem>
                  <SelectItem value="collectionsCount-asc">{t('museum.sort.collectionsAsc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 已选筛选条件标签 */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('common.selectedFilters')}:</span>
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

        {/* 统计显示 */}
        {!isLoading && total > 0 && (
          <div className="mb-6 text-sm text-gray-600">
            {t('museum.stats.found')} <span className="font-semibold text-[#8b4513]">{total}</span> {t('museum.stats.items')}
          </div>
        )}

        {/* 初始加载状态 */}
        {isLoading && page === 1 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : allMuseums.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600">{t('museum.empty')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {allMuseums.map((museum) => (
                <Link key={museum.id} href={`/museum/${museum.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-[#d4a574]">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        {museum.logo ? (
                          <img
                            src={museum.logo}
                            alt={museum.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#C8102E] to-[#8b4513] flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg text-[#8b4513] line-clamp-1">
                            {museum.name}
                          </CardTitle>
                          {museum.address && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin className="h-4 w-4" />
                              <span className="line-clamp-1">{museum.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2 mb-3">
                        {museum.description || t('common.noData')}
                      </CardDescription>
                      
                      {/* 统计信息 */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{museum.collectionsCount || 0} {t('museum.collectionsCount')}</span>
                        </div>
                      </div>

                      {/* 认证标识 */}
                      {museum.verified === 1 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t('museum.verified')}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                <div className="text-center text-sm text-gray-600">
                  {t('museum.stats.total')} {total} {t('museum.stats.items')}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
