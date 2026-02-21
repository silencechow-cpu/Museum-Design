/**
 * 新中式数字主义设计系统 - 页脚
 * 简洁的页脚设计，包含版权信息
 */

import { useTranslation } from 'react-i18next';
import { images } from '@/config/images';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-ink-black text-paper-white py-12 border-t border-paper-white/10">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo区域 */}
          <div className="flex items-center gap-3">
            <img 
              src={images.logo.main} 
              alt="古韵新创" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <h3 className="text-base font-bold">{t('site.title')}</h3>
              <p className="text-xs text-paper-white/60">{t('site.tagline')}</p>
            </div>
          </div>

          {/* 版权信息 */}
          <div className="text-sm text-paper-white/60 text-center md:text-right">
            {t('footer.copyright')}
          </div>
        </div>

        {/* 装饰性分隔线 */}
        <div className="mt-8 pt-8 border-t border-paper-white/10 text-center">
          <p className="text-xs text-paper-white/40">
            让千年文物在创意中焕发新生 · Bringing Ancient Artifacts to New Life Through Creativity
          </p>
        </div>
      </div>
    </footer>
  );
}
