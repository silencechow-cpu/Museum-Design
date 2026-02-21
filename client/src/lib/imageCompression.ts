/**
 * 图片压缩工具函数
 * 在客户端自动压缩上传图片，减少文件大小和加载时间
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  mimeType: 'image/jpeg',
};

/**
 * 压缩单个图片文件
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的 File 对象
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 如果不是图片文件，直接返回
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // 如果是 GIF 或 SVG，不压缩（保留动画和矢量特性）
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // 计算压缩后的尺寸
          let { width, height } = img;
          
          if (width > opts.maxWidth || height > opts.maxHeight) {
            const ratio = Math.min(
              opts.maxWidth / width,
              opts.maxHeight / height
            );
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // 创建 canvas 进行压缩
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height);

          // 转换为 Blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // 如果压缩后文件更大，使用原文件
              if (blob.size >= file.size) {
                resolve(file);
                return;
              }

              // 创建新的 File 对象
              const compressedFile = new File([blob], file.name, {
                type: opts.mimeType,
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            opts.mimeType,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 批量压缩多个图片文件
 * @param files 原始图片文件数组
 * @param options 压缩选项
 * @returns 压缩后的 File 对象数组
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * 获取图片压缩统计信息
 * @param originalFile 原始文件
 * @param compressedFile 压缩后文件
 * @returns 压缩统计信息
 */
export function getCompressionStats(originalFile: File, compressedFile: File) {
  const originalSize = originalFile.size;
  const compressedSize = compressedFile.size;
  const savedSize = originalSize - compressedSize;
  const savedPercent = Math.round((savedSize / originalSize) * 100);

  return {
    originalSize,
    compressedSize,
    savedSize,
    savedPercent,
    originalSizeFormatted: formatFileSize(originalSize),
    compressedSizeFormatted: formatFileSize(compressedSize),
    savedSizeFormatted: formatFileSize(savedSize),
  };
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
