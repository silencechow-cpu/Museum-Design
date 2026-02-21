/**
 * 设计师列表页面
 * 支持分页、排序和筛选功能
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Palette, Users, GraduationCap, User, ChevronLeft, ChevronRight } from 'lucide-react';

const designerTypeIcons = {
  individual: User,
  team: Users,
  school: GraduationCap,
};

export default function DesignerList() {
  const { t } = useTranslation();
  
  const designerTypeLabels = {
    individual: t('designer.type.individual'),
    team: t('designer.type.team'),
    school: t('designer.type.school'),
  };
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [sortBy, setSortBy] = useState<'displayName' | 'createdAt' | 'worksCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [type, setType] = useState<'individual' | 'team' | 'school' | undefined>();

  const { data, isLoading } = trpc.designer.listPaginated.useQuery({
    page,
    pageSize,
    sortBy,
    sortOrder,
    keyword: keyword || undefined,
    type,
  });

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1); // 重置到第一页
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setType(value === 'all' ? undefined : value as typeof type);
    setPage(1);
  };

  const designers = data?.designers || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <SEOHead
        title={t('designer.list.title')}
        description={t('designer.list.subtitle')}
        keywords={t('designer.list.keywords')}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#8b4513] mb-4">{t('designer.list.title')}</h1>
          <p className="text-lg text-gray-600">{t('designer.list.subtitle')}</p>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜索框 */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder={t('designer.search.placeholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-[#c1272d] hover:bg-[#a01f24]">
                  {t('common.search')}
                </Button>
              </div>
            </div>

            {/* 类型筛选 */}
            <div>
              <Select value={type || 'all'} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('designer.filter.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="individual">{t('designer.type.individual')}</SelectItem>
                  <SelectItem value="team">{t('designer.type.team')}</SelectItem>
                  <SelectItem value="school">{t('designer.type.school')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 排序选择 */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('common.sortBy')}:</span>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">{t('designer.sort.newest')}</SelectItem>
                <SelectItem value="createdAt-asc">{t('designer.sort.oldest')}</SelectItem>
                <SelectItem value="displayName-asc">{t('designer.sort.nameAsc')}</SelectItem>
                <SelectItem value="displayName-desc">{t('designer.sort.nameDesc')}</SelectItem>
                <SelectItem value="worksCount-desc">{t('designer.sort.worksDesc')}</SelectItem>
                <SelectItem value="worksCount-asc">{t('designer.sort.worksAsc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 设计师列表 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c1272d]"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : designers.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600">{t('designer.empty')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {designers.map((designer) => {
                const TypeIcon = designerTypeIcons[designer.type];
                return (
                  <Link key={designer.id} href={`/designer/${designer.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-[#d4a574]">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          {designer.avatar ? (
                            <img
                              src={designer.avatar}
                              alt={designer.displayName}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c1272d] to-[#8b4513] flex items-center justify-center">
                              <Palette className="h-8 w-8 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <CardTitle className="text-lg text-[#8b4513] line-clamp-1">
                              {designer.displayName}
                            </CardTitle>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <TypeIcon className="h-4 w-4" />
                              <span>{designerTypeLabels[designer.type]}</span>
                            </div>
                            {designer.organization && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {designer.organization}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2 mb-3">
                          {designer.bio || t('common.noData')}
                        </CardDescription>
                        
                        {/* 统计信息 */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Palette className="h-4 w-4" />
                            <span>{designer.worksCount || 0} {t('designer.worksCount')}</span>
                          </div>
                          {designer.awardsCount > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-600">★</span>
                              <span>{designer.awardsCount} {t('designer.awardsCount')}</span>
                            </div>
                          )}
                        </div>

                        {designer.skills && (() => {
                          try {
                            const skillsArray = JSON.parse(designer.skills);
                            if (Array.isArray(skillsArray) && skillsArray.length > 0) {
                              return (
                                <div className="mt-3 flex flex-wrap gap-1">
                                  {skillsArray.slice(0, 3).map((skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#fef5e7] text-[#8b4513]"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {skillsArray.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{skillsArray.length - 3}
                                    </span>
                                  )}
                                </div>
                              );
                            }
                          } catch (e) {
                            // 忽略JSON解析错误
                          }
                          return null;
                        })()}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('common.prevPage')}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={page === pageNum ? 'bg-[#c1272d] hover:bg-[#a01f24]' : ''}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {t('common.nextPage')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
