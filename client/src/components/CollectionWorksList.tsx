/**
 * 征集作品列表组件
 * 展示某个征集下的所有提交作品，支持排序和筛选
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import WorkRatingDisplay from './WorkRatingDisplay';

interface CollectionWorksListProps {
  collectionId: number;
}

export default function CollectionWorksList({ collectionId }: CollectionWorksListProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'submitted' | 'approved' | 'rejected' | 'winner' | 'all'>('all');

  const { data, isLoading } = trpc.collection.getWorks.useQuery({
    collectionId,
    page,
    pageSize: 12,
    sortBy,
    sortOrder,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as ['createdAt' | 'rating', 'asc' | 'desc'];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as any);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
      </div>
    );
  }

  if (!data || data.works.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无提交作品</p>
      </div>
    );
  }

  const statusLabels = {
    all: '全部状态',
    submitted: '已提交',
    approved: '已通过',
    rejected: '未通过',
    winner: '获奖作品',
  };

  return (
    <div className="space-y-6">
      {/* 筛选和排序控件 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">共 {data.total} 件作品</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* 状态筛选 */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="筛选状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{statusLabels.all}</SelectItem>
              <SelectItem value="submitted">{statusLabels.submitted}</SelectItem>
              <SelectItem value="approved">{statusLabels.approved}</SelectItem>
              <SelectItem value="rejected">{statusLabels.rejected}</SelectItem>
              <SelectItem value="winner">{statusLabels.winner}</SelectItem>
            </SelectContent>
          </Select>

          {/* 排序选择 */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">最新提交</SelectItem>
              <SelectItem value="createdAt-asc">最早提交</SelectItem>
              <SelectItem value="rating-desc">评分最高</SelectItem>
              <SelectItem value="rating-asc">评分最低</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 作品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.works.map((work: any) => (
          <Link key={work.id} href={`/work/${work.id}`}>
            <div className="group cursor-pointer bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* 作品图片 */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                {work.images && JSON.parse(work.images)[0] ? (
                  <img
                    src={JSON.parse(work.images)[0]}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    暂无图片
                  </div>
                )}
                
                {/* 状态标签 */}
                <div className="absolute top-3 right-3">
                  {work.status === 'winner' && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      获奖
                    </span>
                  )}
                  {work.status === 'approved' && (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      已通过
                    </span>
                  )}
                  {work.status === 'rejected' && (
                    <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                      未通过
                    </span>
                  )}
                  {work.status === 'submitted' && (
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                      待审核
                    </span>
                  )}
                </div>
              </div>

              {/* 作品信息 */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-[#C8102E] transition-colors">
                  {work.title}
                </h3>
                
                {work.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {work.description}
                  </p>
                )}

                {/* 评分显示 */}
                <div className="flex items-center justify-between">
                  <WorkRatingDisplay workId={work.id} size="sm" showCount={true} />
                  
                  <span className="text-xs text-muted-foreground">
                    {new Date(work.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 分页控件 */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
              let pageNum;
              if (data.totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= data.totalPages - 2) {
                pageNum = data.totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
