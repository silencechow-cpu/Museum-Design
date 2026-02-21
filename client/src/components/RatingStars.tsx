import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  /**
   * 当前评分值（1-5）
   */
  value: number;
  /**
   * 是否可交互（可点击评分）
   */
  interactive?: boolean;
  /**
   * 评分变化回调
   */
  onChange?: (rating: number) => void;
  /**
   * 星星大小
   */
  size?: "sm" | "md" | "lg";
  /**
   * 是否显示评分数字
   */
  showValue?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 星级评分组件
 * 支持只读显示和交互式评分两种模式
 */
export default function RatingStars({
  value,
  interactive = false,
  onChange,
  size = "md",
  showValue = false,
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const displayRating = hoverRating ?? value;

  const handleClick = (rating: number) => {
    if (interactive && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (interactive) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = rating <= displayRating;
        const isHalfFilled = rating - 0.5 <= displayRating && displayRating < rating;

        return (
          <button
            key={rating}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "relative transition-all",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
            aria-label={`${rating} 星`}
          >
            {/* 背景星星（空心） */}
            <Star
              className={cn(
                sizeClasses[size],
                "text-gray-300 dark:text-gray-600"
              )}
            />

            {/* 填充星星（实心） */}
            {(isFilled || isHalfFilled) && (
              <Star
                className={cn(
                  sizeClasses[size],
                  "absolute top-0 left-0 text-yellow-400 fill-yellow-400 transition-all",
                  isHalfFilled && "clip-half"
                )}
                style={
                  isHalfFilled
                    ? { clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }
                    : undefined
                }
              />
            )}
          </button>
        );
      })}

      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/**
 * 只读评分显示组件（带评分数量）
 */
interface RatingDisplayProps {
  averageRating: number;
  ratingCount: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingDisplay({
  averageRating,
  ratingCount,
  size = "md",
  className,
}: RatingDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RatingStars value={averageRating} size={size} showValue />
      <span className="text-sm text-muted-foreground">
        ({ratingCount})
      </span>
    </div>
  );
}

/**
 * 交互式评分组件（带提示文本）
 */
interface InteractiveRatingProps {
  value: number;
  onChange: (rating: number) => void;
  label?: string;
  helperText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InteractiveRating({
  value,
  onChange,
  label,
  helperText,
  size = "md",
  className,
}: InteractiveRatingProps) {
  const ratingLabels = ["很差", "较差", "一般", "不错", "很好"];

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <div className="flex items-center gap-3">
        <RatingStars
          value={value}
          interactive
          onChange={onChange}
          size={size}
        />
        {value > 0 && (
          <span className="text-sm text-muted-foreground">
            {ratingLabels[value - 1]}
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
