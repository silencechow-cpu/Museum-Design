/**
 * 图片上传工具函数
 * 集成S3存储，支持批量上传、压缩和进度回调
 */

import { toast } from 'sonner';

// 图片压缩配置
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.85;

/**
 * 压缩图片
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 计算缩放比例
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建canvas上下文'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          file.type,
          QUALITY
        );
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 生成随机文件名后缀
 */
function generateRandomSuffix(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * 上传单张图片到S3
 */
export async function uploadSingleImage(
  file: File,
  options?: {
    compress?: boolean;
    onProgress?: (progress: number) => void;
  }
): Promise<string> {
  try {
    // 压缩图片
    let blob: Blob = file;
    if (options?.compress !== false && file.type.startsWith('image/')) {
      blob = await compressImage(file);
    }

    // 准备上传数据
    const formData = new FormData();
    const fileName = `${Date.now()}-${generateRandomSuffix()}.${file.name.split('.').pop()}`;
    formData.append('file', blob, fileName);

    // 上传到服务器（服务器会转存到S3）
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`上传失败: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.url) {
      throw new Error('服务器未返回图片URL');
    }

    return data.url;
  } catch (error) {
    console.error('图片上传失败:', error);
    throw error;
  }
}

/**
 * 批量上传图片
 */
export async function uploadMultipleImages(
  files: File[],
  options?: {
    compress?: boolean;
    onProgress?: (current: number, total: number) => void;
  }
): Promise<string[]> {
  const urls: string[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadSingleImage(files[i], {
        compress: options?.compress,
      });
      urls.push(url);
      
      if (options?.onProgress) {
        options.onProgress(i + 1, total);
      }
    } catch (error) {
      console.error(`第 ${i + 1} 张图片上传失败:`, error);
      throw new Error(`第 ${i + 1} 张图片上传失败`);
    }
  }

  return urls;
}

/**
 * 验证文件类型和大小
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: '仅支持 JPG、PNG、WEBP 格式的图片',
    };
  }

  // 验证文件大小（最大 10MB）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '图片大小不能超过 10MB',
    };
  }

  return { valid: true };
}

/**
 * 批量验证文件
 */
export function validateImageFiles(files: File[]): { valid: boolean; error?: string } {
  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}
