import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useInfiniteScroll } from './useInfiniteScroll';

describe('useInfiniteScroll', () => {
  let mockIntersectionObserver: any;
  let observeCallback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    // Mock IntersectionObserver
    mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      observeCallback = callback;
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    });

    global.IntersectionObserver = mockIntersectionObserver as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    observeCallback = null;
  });

  it('应该返回sentinelRef', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      })
    );

    expect(result.current.sentinelRef).toBeDefined();
    expect(result.current.sentinelRef.current).toBeNull();
  });

  it('应该创建IntersectionObserver', () => {
    const onLoadMore = vi.fn();
    renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      })
    );

    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('当元素进入视口且不在加载中且还有更多数据时应该触发onLoadMore', async () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      })
    );

    // 模拟元素进入视口
    if (observeCallback) {
      const mockEntry = {
        isIntersecting: true,
        target: result.current.sentinelRef.current,
      } as IntersectionObserverEntry;

      observeCallback([mockEntry], {} as IntersectionObserver);
    }

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it('当正在加载时不应该触发onLoadMore', async () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: true, // 正在加载
        hasMore: true,
        onLoadMore,
      })
    );

    // 模拟元素进入视口
    if (observeCallback) {
      const mockEntry = {
        isIntersecting: true,
        target: result.current.sentinelRef.current,
      } as IntersectionObserverEntry;

      observeCallback([mockEntry], {} as IntersectionObserver);
    }

    await waitFor(() => {
      expect(onLoadMore).not.toHaveBeenCalled();
    });
  });

  it('当没有更多数据时不应该触发onLoadMore', async () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: false, // 没有更多数据
        onLoadMore,
      })
    );

    // 模拟元素进入视口
    if (observeCallback) {
      const mockEntry = {
        isIntersecting: true,
        target: result.current.sentinelRef.current,
      } as IntersectionObserverEntry;

      observeCallback([mockEntry], {} as IntersectionObserver);
    }

    await waitFor(() => {
      expect(onLoadMore).not.toHaveBeenCalled();
    });
  });

  it('当元素不在视口时不应该触发onLoadMore', async () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      })
    );

    // 模拟元素不在视口
    if (observeCallback) {
      const mockEntry = {
        isIntersecting: false, // 不在视口
        target: result.current.sentinelRef.current,
      } as IntersectionObserverEntry;

      observeCallback([mockEntry], {} as IntersectionObserver);
    }

    await waitFor(() => {
      expect(onLoadMore).not.toHaveBeenCalled();
    });
  });

  it('应该使用自定义threshold', () => {
    const onLoadMore = vi.fn();
    renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
        threshold: 500,
      })
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '500px',
      })
    );
  });

  it('应该在组件卸载时断开observer', () => {
    const onLoadMore = vi.fn();
    const { unmount } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      })
    );

    const observerInstance = mockIntersectionObserver.mock.results[0].value;
    unmount();

    expect(observerInstance.disconnect).toHaveBeenCalled();
  });
});
