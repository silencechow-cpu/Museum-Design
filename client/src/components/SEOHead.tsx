/**
 * SEO元标签组件
 * 支持Open Graph和Twitter Card，优化搜索引擎和社交媒体分享效果
 */

import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  keywords?: string;
}

export default function SEOHead({
  title,
  description,
  image = 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=90',
  url,
  type = 'website',
  keywords,
}: SEOHeadProps) {
  useEffect(() => {
    // 设置页面标题
    document.title = `${title} - 古韵新创`;

    // 获取或创建meta标签的辅助函数
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // 基础SEO标签
    setMetaTag('description', description);
    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // Open Graph标签
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', '古韵新创 - 博物馆文创对接平台', true);
    if (url) {
      setMetaTag('og:url', url, true);
    }

    // Twitter Card标签
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);

    // 额外的SEO标签
    setMetaTag('author', '古韵新创');
    setMetaTag('robots', 'index, follow');
  }, [title, description, image, url, type, keywords]);

  return null;
}
