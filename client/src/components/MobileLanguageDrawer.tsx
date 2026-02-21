/**
 * 移动端语言选择抽屉组件
 * 底部弹出的抽屉样式，优化移动端操作体验
 */

import { useTranslation } from 'react-i18next';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { useState } from 'react';

export default function MobileLanguageDrawer() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages: { code: string; label: string; nativeLabel: string }[] = [
    { code: 'zh-CN', label: '简体中文', nativeLabel: '简体中文' },
    { code: 'zh-TW', label: '繁體中文', nativeLabel: '繁體中文' },
    { code: 'en', label: 'English', nativeLabel: 'English' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          aria-label="Change language"
        >
          <Globe className="w-5 h-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>选择语言 / Select Language</DrawerTitle>
          <DrawerDescription>
            切换界面显示语言
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-2">
          {languages.map((lang) => {
            const isActive = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full flex items-center justify-between p-4 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                  }
                `}
              >
                <span className="text-lg font-medium">{lang.nativeLabel}</span>
                {isActive && <Check className="w-5 h-5" />}
              </button>
            );
          })}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">取消 / Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
