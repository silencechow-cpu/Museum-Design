/**
 * 星级评分组件
 * 支持显示和交互两种模式
 */

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number; // 当前评分（0-5）
  maxRating?: number; // 最大评分，默认5
  size?: 'sm' | 'md' | 'lg'; // 星星大小
  interactive?: boolean; // 是否可交互
  onChange?: (rating: number) => void; // 评分改变回调
  showCount?: boolean; // 是否显示评分数量
  count?: number; // 评分数量
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showCount = false,
  count = 0,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartiallyFilled = starValue > displayRating && starValue - 1 < displayRating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              {isPartiallyFilled ? (
                // 半星显示
                <div className="relative">
                  <Star className={`${sizeMap[size]} text-gray-300`} />
                  <div
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ width: `${(displayRating % 1) * 100}%` }}
                  >
                    <Star className={`${sizeMap[size]} text-[#FFD700] fill-[#FFD700]`} />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${sizeMap[size]} ${
                    isFilled
                      ? 'text-[#FFD700] fill-[#FFD700]'
                      : 'text-gray-300'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
      {showCount && count > 0 && (
        <span className="text-sm text-gray-600">({count})</span>
      )}
      {!showCount && rating > 0 && (
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
