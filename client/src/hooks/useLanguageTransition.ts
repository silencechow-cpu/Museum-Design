import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 语言切换动画Hook
 * 在语言切换时添加淡入淡出动画效果
 */
export function useLanguageTransition() {
  const { i18n } = useTranslation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng !== currentLanguage) {
        // 开始淡出动画
        setIsTransitioning(true);
        
        // 等待淡出动画完成后切换语言并淡入
        setTimeout(() => {
          setCurrentLanguage(lng);
          setIsTransitioning(false);
        }, 200); // 200ms淡出时间
      }
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, currentLanguage]);

  return { isTransitioning, currentLanguage };
}
