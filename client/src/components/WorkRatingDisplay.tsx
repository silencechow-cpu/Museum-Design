/**
 * 作品评分显示组件
 * 仅显示评分统计，不包含交互功能
 */

import { trpc } from '@/lib/trpc';
import StarRating from './StarRating';

interface WorkRatingDisplayProps {
  workId: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export default function WorkRatingDisplay({ workId, size = 'sm', showCount = false }: WorkRatingDisplayProps) {
  const { data: stats } = trpc.rating.getWorkRatingStats.useQuery({ workId });

  if (!stats || stats.ratingCount === 0) {
    return null;
  }

  return (
    <StarRating
      rating={stats.averageRating}
      size={size}
      showCount={showCount}
      count={stats.ratingCount}
    />
  );
}
