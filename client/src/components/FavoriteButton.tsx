import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface FavoriteButtonProps {
  targetType: "collection" | "work";
  targetId: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export default function FavoriteButton({
  targetType,
  targetId,
  variant = "outline",
  size = "default",
  showText = true,
  className = "",
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);

  // 查询收藏状态
  const { data: favoriteStatus, refetch } = trpc.favorite.check.useQuery(
    { targetType, targetId },
    { enabled: isAuthenticated }
  );

  // 添加收藏
  const addMutation = trpc.favorite.add.useMutation();

  // 删除收藏
  const removeMutation = trpc.favorite.removeByTarget.useMutation();

  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorited(favoriteStatus.isFavorited);
    }
  }, [favoriteStatus]);

  const handleToggleFavorite = async () => {
    // 未登录跳转到登录页
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    try {
      if (isFavorited) {
        // 取消收藏
        await removeMutation.mutateAsync({ targetType, targetId });
        setIsFavorited(false);
        toast.success("已取消收藏");
      } else {
        // 添加收藏
        await addMutation.mutateAsync({ targetType, targetId });
        setIsFavorited(true);
        toast.success("收藏成功");
      }
      // 刷新收藏状态
      refetch();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  const isLoading = addMutation.isPending || removeMutation.isPending;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`gap-2 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart
          className={`w-4 h-4 transition-colors ${
            isFavorited ? "fill-red-500 text-red-500" : ""
          }`}
        />
      )}
      {showText && (
        <span>{isFavorited ? "已收藏" : "收藏"}</span>
      )}
    </Button>
  );
}
