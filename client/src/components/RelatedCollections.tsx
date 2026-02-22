/**
 * 相关征集推荐组件
 * 在征集详情页底部展示相关的其他征集项目
 */

import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Loader2 } from 'lucide-react';

interface RelatedCollectionsProps {
  collectionId: number;
  limit?: number;
}

export default function RelatedCollections({ collectionId, limit = 6 }: RelatedCollectionsProps) {
  const { data: relatedCollections, isLoading } = trpc.collection.getRelated.useQuery({
    collectionId,
    limit,
  });

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '.');
  };

  // 格式化奖金
  const formatPrize = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万元`;
    }
    return `${amount}元`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
      </div>
    );
  }

  if (!relatedCollections || relatedCollections.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#F5F1E8]">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">相关征集推荐</h2>
          <p className="text-muted-foreground">发现更多精彩的文创征集项目</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedCollections.map((collection) => (
            <Link key={collection.id} href={`/collection/${collection.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-[#C8102E] transition-colors">
                    {collection.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {collection.description || collection.artifactName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {/* 奖金 */}
                    {collection.prizeAmount && collection.prizeAmount > 0 && (
                      <div className="flex items-center gap-2 text-[#C8102E]">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">
                          奖金：{formatPrize(collection.prizeAmount || 0)}
                        </span>
                      </div>
                    )}

                    {/* 截止日期 */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>截止：{formatDate(collection.deadline)}</span>
                    </div>

                    {/* 状态标签 */}
                    <div className="pt-2">
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        进行中
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
