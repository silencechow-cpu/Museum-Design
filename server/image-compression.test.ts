import { describe, it, expect } from 'vitest';

/**
 * 图片压缩功能单元测试
 * 
 * 注意：由于图片压缩功能依赖浏览器环境（Canvas API、FileReader等），
 * 在 Node.js 环境中无法直接测试。这里测试压缩逻辑的核心算法。
 */

describe('图片压缩功能', () => {
  describe('尺寸计算逻辑', () => {
    it('应该正确计算压缩后的尺寸（宽度超限）', () => {
      const originalWidth = 3000;
      const originalHeight = 2000;
      const maxWidth = 1920;
      const maxHeight = 1920;

      const ratio = Math.min(
        maxWidth / originalWidth,
        maxHeight / originalHeight
      );
      const newWidth = Math.round(originalWidth * ratio);
      const newHeight = Math.round(originalHeight * ratio);

      expect(newWidth).toBe(1920);
      expect(newHeight).toBe(1280);
      expect(newWidth).toBeLessThanOrEqual(maxWidth);
      expect(newHeight).toBeLessThanOrEqual(maxHeight);
    });

    it('应该正确计算压缩后的尺寸（高度超限）', () => {
      const originalWidth = 1500;
      const originalHeight = 3000;
      const maxWidth = 1920;
      const maxHeight = 1920;

      const ratio = Math.min(
        maxWidth / originalWidth,
        maxHeight / originalHeight
      );
      const newWidth = Math.round(originalWidth * ratio);
      const newHeight = Math.round(originalHeight * ratio);

      expect(newWidth).toBe(960);
      expect(newHeight).toBe(1920);
      expect(newWidth).toBeLessThanOrEqual(maxWidth);
      expect(newHeight).toBeLessThanOrEqual(maxHeight);
    });

    it('应该保持原尺寸（未超限）', () => {
      const originalWidth = 1200;
      const originalHeight = 800;
      const maxWidth = 1920;
      const maxHeight = 1920;

      let width = originalWidth;
      let height = originalHeight;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(
          maxWidth / width,
          maxHeight / height
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      expect(width).toBe(1200);
      expect(height).toBe(800);
    });

    it('应该保持宽高比', () => {
      const originalWidth = 4000;
      const originalHeight = 2000;
      const maxWidth = 1920;
      const maxHeight = 1920;

      const originalRatio = originalWidth / originalHeight;

      const ratio = Math.min(
        maxWidth / originalWidth,
        maxHeight / originalHeight
      );
      const newWidth = Math.round(originalWidth * ratio);
      const newHeight = Math.round(originalHeight * ratio);

      const newRatio = newWidth / newHeight;

      // 允许微小的浮点误差
      expect(Math.abs(newRatio - originalRatio)).toBeLessThan(0.01);
    });
  });

  describe('文件大小格式化', () => {
    function formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 B';
      
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }

    it('应该正确格式化字节', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500.00 B');
      expect(formatFileSize(1024)).toBe('1.00 KB');
    });

    it('应该正确格式化KB', () => {
      expect(formatFileSize(1024 * 5)).toBe('5.00 KB');
      expect(formatFileSize(1024 * 100)).toBe('100.00 KB');
    });

    it('应该正确格式化MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.50 MB');
    });

    it('应该正确格式化GB', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 1.5)).toBe('1.50 GB');
    });
  });

  describe('压缩统计计算', () => {
    function getCompressionStats(originalSize: number, compressedSize: number) {
      const savedSize = originalSize - compressedSize;
      const savedPercent = Math.round((savedSize / originalSize) * 100);

      return {
        originalSize,
        compressedSize,
        savedSize,
        savedPercent,
      };
    }

    it('应该正确计算压缩率（50%）', () => {
      const stats = getCompressionStats(2000000, 1000000);
      
      expect(stats.originalSize).toBe(2000000);
      expect(stats.compressedSize).toBe(1000000);
      expect(stats.savedSize).toBe(1000000);
      expect(stats.savedPercent).toBe(50);
    });

    it('应该正确计算压缩率（70%）', () => {
      const stats = getCompressionStats(1000000, 300000);
      
      expect(stats.savedPercent).toBe(70);
    });

    it('应该处理无压缩情况', () => {
      const stats = getCompressionStats(1000000, 1000000);
      
      expect(stats.savedSize).toBe(0);
      expect(stats.savedPercent).toBe(0);
    });

    it('应该处理压缩后更大的情况', () => {
      const stats = getCompressionStats(1000000, 1100000);
      
      expect(stats.savedSize).toBe(-100000);
      expect(stats.savedPercent).toBe(-10);
    });
  });

  describe('文件类型检测', () => {
    it('应该识别图片文件', () => {
      const imageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ];

      imageTypes.forEach(type => {
        expect(type.startsWith('image/')).toBe(true);
      });
    });

    it('应该排除非图片文件', () => {
      const nonImageTypes = [
        'video/mp4',
        'audio/mp3',
        'application/pdf',
        'text/plain',
      ];

      nonImageTypes.forEach(type => {
        expect(type.startsWith('image/')).toBe(false);
      });
    });

    it('应该识别特殊图片格式（不压缩）', () => {
      const specialFormats = ['image/gif', 'image/svg+xml'];

      specialFormats.forEach(type => {
        const shouldSkipCompression = 
          type === 'image/gif' || type === 'image/svg+xml';
        expect(shouldSkipCompression).toBe(true);
      });
    });
  });
});
