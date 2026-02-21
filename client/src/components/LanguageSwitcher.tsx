/**
 * 语言切换组件
 * 支持简体中文、繁体中文和英文三种语言
 * 桌面端显示下拉菜单，移动端显示底部抽屉
 */

import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import MobileLanguageDrawer from './MobileLanguageDrawer';
import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 检测是否为移动端设备（屏幕宽度小于768px）
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初始检测
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const languages: { code: string; label: string }[] = [
    { code: 'zh-CN', label: '简' },
    { code: 'zh-TW', label: '繁' },
    { code: 'en', label: 'EN' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  // 移动端显示抽屉
  if (isMobile) {
    return <MobileLanguageDrawer />;
  }

  // 桌面端显示下拉菜单
  return (
    <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
      <SelectTrigger className="w-[100px] bg-card border-border">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <SelectValue>
          {currentLanguage?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
