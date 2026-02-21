/**
 * 图片预加载工具函数
 * 用于预加载首屏关键图片，提升用户体验
 */

/**
 * 预加载单张图片
 * @param src 图片URL
 * @returns Promise<void>
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * 批量预加载图片
 * @param srcs 图片URL数组
 * @returns Promise<void[]>
 */
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(src => preloadImage(src)));
}

/**
 * 预加载首屏关键图片
 * 包括Logo、横幅图片等
 */
export async function preloadCriticalImages(criticalImages: string[]): Promise<void> {
  try {
    await preloadImages(criticalImages);
    console.log('[Preload] Critical images loaded successfully');
  } catch (error) {
    console.warn('[Preload] Some critical images failed to load:', error);
  }
}
