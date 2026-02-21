import { useEffect, useRef } from 'react';

/**
 * 表单草稿自动保存 Hook
 * 
 * @param key - localStorage 存储键名
 * @param formData - 表单数据对象
 * @param interval - 自动保存间隔（毫秒），默认 30 秒
 * @returns 草稿操作方法
 */
export function useFormDraft<T extends Record<string, any>>(
  key: string,
  formData: T,
  interval: number = 30000
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 保存草稿到 localStorage
   */
  const saveDraft = () => {
    try {
      const draft = {
        data: formData,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(draft));
      console.log(`[Draft] Saved: ${key}`);
    } catch (error) {
      console.error('[Draft] Save failed:', error);
    }
  };

  /**
   * 从 localStorage 加载草稿
   */
  const loadDraft = (): T | null => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const draft = JSON.parse(stored);
      // 检查草稿是否过期（24小时）
      const isExpired = Date.now() - draft.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        clearDraft();
        return null;
      }

      console.log(`[Draft] Loaded: ${key}`);
      return draft.data;
    } catch (error) {
      console.error('[Draft] Load failed:', error);
      return null;
    }
  };

  /**
   * 清除草稿
   */
  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
      console.log(`[Draft] Cleared: ${key}`);
    } catch (error) {
      console.error('[Draft] Clear failed:', error);
    }
  };

  /**
   * 检查是否有草稿
   */
  const hasDraft = (): boolean => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return false;

      const draft = JSON.parse(stored);
      const isExpired = Date.now() - draft.timestamp > 24 * 60 * 60 * 1000;
      return !isExpired;
    } catch {
      return false;
    }
  };

  // 自动保存定时器
  useEffect(() => {
    // 清除旧定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 设置新定时器
    timerRef.current = setInterval(() => {
      saveDraft();
    }, interval);

    // 组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [formData, interval]);

  // 页面关闭前保存草稿
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  };
}
