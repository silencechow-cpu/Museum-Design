import { useEffect, useRef, useCallback } from 'react';

/**
 * 无限滚动 Hook
 * 监听滚动事件，当用户滚动到底部时触发回调函数
 */

export interface UseInfiniteScrollOptions {
  /** 距离底部多少像素时触发加载（默认300px） */
  threshold?: number;
  /** 是否正在加载中 */
  loading?: boolean;
  /** 是否还有更多数据 */
  hasMore?: boolean;
  /** 触发加载的回调函数 */
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  threshold = 300,
  loading = false,
  hasMore = true,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      // 当哨兵元素进入视口且不在加载中且还有更多数据时，触发加载
      if (entry.isIntersecting && !loading && hasMore) {
        onLoadMore();
      }
    },
    [loading, hasMore, onLoadMore]
  );

  useEffect(() => {
    // 创建 Intersection Observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null, // 使用视口作为根元素
      rootMargin: `${threshold}px`, // 提前触发加载
      threshold: 0, // 只要有一点进入视口就触发
    });

    // 开始观察哨兵元素
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  return { sentinelRef };
}

/**
 * 使用滚动事件的无限滚动 Hook（备用方案）
 * 适用于不支持 Intersection Observer 的旧浏览器
 */
export function useInfiniteScrollFallback({
  threshold = 300,
  loading = false,
  hasMore = true,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const handleScroll = useCallback(() => {
    // 如果正在加载或没有更多数据，不触发
    if (loading || !hasMore) return;

    // 计算是否接近底部
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // 如果距离底部小于阈值，触发加载
    if (distanceFromBottom < threshold) {
      onLoadMore();
    }
  }, [loading, hasMore, threshold, onLoadMore]);

  useEffect(() => {
    // 节流处理，避免频繁触发
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 200);
    };

    window.addEventListener('scroll', throttledHandleScroll);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  return null;
}
