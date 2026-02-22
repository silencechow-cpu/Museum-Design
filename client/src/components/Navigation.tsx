/**
 * 新中式数字主义设计系统 - 导航栏
 * 采用留白设计，logo区域与导航项目非对称布局
 */

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import { Link } from 'wouter';
import { images } from '@/config/images';
import { User, Menu, X, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export default function Navigation() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const logoutMutation = trpc.auth.logout.useMutation();

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // 退出登录
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = '/';
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo区域 */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img 
                src={images.logo.main} 
                alt="古韵新创" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {t('site.title')}
                </h1>
                <p className="text-xs text-muted-foreground">{t('site.tagline')}</p>
              </div>
            </div>
          </Link>

          {/* 导航项目 - 右侧 */}
          <div className="flex items-center gap-4">
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/">
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                  {t('nav.home')}
                </span>
              </Link>
              <Link href="/museums">
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                  {t('nav.museums')}
                </span>
              </Link>
              <Link href="/designers">
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                  {t('nav.designers')}
                </span>
              </Link>
            </div>
            
            {/* 登录/用户菜单 */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C8102E]/10 hover:bg-[#C8102E]/20 text-[#C8102E] transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* 下拉菜单 */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                    <Link href="/profile">
                      <button 
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        {t('nav.profile')}
                      </button>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2 border-t border-border mt-1 pt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C8102E]/10 hover:bg-[#C8102E]/20 text-[#C8102E] transition-colors">
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('common.login')}</span>
                </button>
              </a>
            )}
            
            <LanguageSwitcher />
            
            {/* 移动端汉堡菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="菜单"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="container py-4 space-y-4">
              <Link href="/">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {t('nav.home')}
                </span>
              </Link>
              <Link href="/museums">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {t('nav.museums')}
                </span>
              </Link>
              <Link href="/designers">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {t('nav.designers')}
                </span>
              </Link>
              
              {isAuthenticated && user ? (
                <div className="space-y-2 pt-2 border-t border-border">
                  <Link href="/profile">
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-[#C8102E]/10 text-[#C8102E] transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{user.name}</span>
                    </button>
                  </Link>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-muted text-foreground transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">退出登录</span>
                  </button>
                </div>
              ) : (
                <a href={getLoginUrl()}>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-[#C8102E]/10 text-[#C8102E] transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('common.login')}</span>
                  </button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
