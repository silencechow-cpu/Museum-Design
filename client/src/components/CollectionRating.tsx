/**
 * 征集评分组件
 * 显示征集评分统计，所有登录用户都可以进行评分
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import StarRating from './StarRating';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface CollectionRatingProps {
  collectionId: number;
}

export default function CollectionRating({ collectionId }: CollectionRatingProps) {
  const { user, isAuthenticated } = useAuth();
  const [myRating, setMyRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);

  // 查询征集评分统计
  const { data: stats, refetch: refetchStats } = trpc.rating.getStats.useQuery({
    targetType: 'collection',
    targetId: collectionId,
  });

  // 查询当前用户的评分
  const { data: myRatingData, refetch: refetchMyRating } = trpc.rating.getMyRating.useQuery(
    { targetType: 'collection', targetId: collectionId },
    { enabled: isAuthenticated }
  );

  // 创建或更新评分
  const createOrUpdateRating = trpc.rating.createOrUpdate.useMutation({
    onSuccess: () => {
      toast.success('评分成功');
      refetchStats();
      refetchMyRating();
    },
    onError: (error) => {
      toast.error(error.message || '评分失败');
    },
  });

  useEffect(() => {
    if (myRatingData) {
      setMyRating(myRatingData.score);
      setTempRating(myRatingData.score);
    }
  }, [myRatingData]);

  const handleRatingChange = (rating: number) => {
    setTempRating(rating);
  };

  const handleSubmitRating = () => {
    if (tempRating === 0) {
      toast.error('请选择评分');
      return;
    }

    createOrUpdateRating.mutate({
      targetType: 'collection',
      targetId: collectionId,
      score: tempRating,
    });
  };

  return (
    <div className="space-y-4">
      {/* 评分统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">征集评分</CardTitle>
          <CardDescription>用户对此征集的评价</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8b4513]">
                {stats?.averageRating.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-gray-500">平均分</div>
            </div>
            <div className="flex-1">
              <StarRating rating={stats?.averageRating || 0} size="lg" />
              <div className="text-sm text-gray-500 mt-1">
                {stats?.ratingCount || 0} 个评分
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户评分区域 */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">我的评分</CardTitle>
            <CardDescription>
              {myRating > 0 ? '您已对此征集评分，可以修改评分' : '为此征集打分'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <StarRating
                  rating={tempRating}
                  size="lg"
                  interactive
                  onChange={handleRatingChange}
                />
                {tempRating > 0 && (
                  <span className="text-lg font-medium text-[#8b4513]">
                    {tempRating} 星
                  </span>
                )}
              </div>
              <Button
                onClick={handleSubmitRating}
                disabled={tempRating === 0 || createOrUpdateRating.isPending}
                className="bg-[#C8102E] hover:bg-[#A00D24]"
              >
                {createOrUpdateRating.isPending
                  ? '提交中...'
                  : myRating > 0
                  ? '更新评分'
                  : '提交评分'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
