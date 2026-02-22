/**
 * 新中式数字主义设计系统 - 导航栏
 * 采用留白设计，logo区域与导航项目非对称布局
 *
 * P0：退出登录改用 useAuth().logout() + setLocation 软跳转，避免整页刷新
 * P1-A：下拉菜单根据 user.role 展示角色专属快捷入口
 */

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import { Link, useLocation } from 'wouter';
import { images } from '@/config/images';
import {
  User, Menu, X, LogIn, LogOut, ChevronDown,
  Building2, Palette, PlusCircle, FileText, Layers, ShieldCheck
} from 'lucide-react';
import { getLoginUrl } from '@/const';
import { useState, useRef, useEffect } from 'react';

export default function Navigation() {
  const { t } = useTranslation();
  // P0：从 useAuth 获取 logout 方法，不再单独调用 trpc.auth.logout
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // P0：退出登录 —— 使用 useAuth().logout() 正确清理缓存，再软跳转首页
  const handleLogout = async () => {
    try {
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // P1-A：根据角色生成专属菜单项
  const getRoleMenuItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'museum':
        return [
          {
            icon: <PlusCircle className="w-4 h-4" />,
            label: '发布征集',
            href: '/profile',
          },
          {
            icon: <FileText className="w-4 h-4" />,
            label: '我的征集',
            href: '/profile',
          },
        ];
      case 'designer':
        return [
          {
            icon: <Layers className="w-4 h-4" />,
            label: '我的作品',
            href: '/profile',
          },
        ];
      case 'admin':
        return [
          {
            icon: <ShieldCheck className="w-4 h-4" />,
            label: '审核管理',
            href: '/admin/review-works',
          },
        ];
      default:
        // user 角色（未入驻）：引导完善资料
        return [
          {
            icon: user.role === 'user' ? <Palette className="w-4 h-4" /> : <Building2 className="w-4 h-4" />,
            label: '完善资料',
            href: '/onboarding',
          },
        ];
    }
  };

  // P1-A：角色标签（显示在用户名旁边）
  const getRoleBadge = () => {
    if (!user) return null;
    const badgeMap: Record<string, { label: string; icon: React.ReactNode }> = {
      museum: { label: '博物馆', icon: <Building2 className="w-3 h-3" /> },
      designer: { label: '设计师', icon: <Palette className="w-3 h-3" /> },
      admin: { label: '管理员', icon: <ShieldCheck className="w-3 h-3" /> },
    };
    const badge = badgeMap[user.role];
    if (!badge) return null;
    return (
      <span className="flex items-center gap-0.5 text-xs bg-[#C8102E]/20 text-[#C8102E] px-1.5 py-0.5 rounded-full font-medium">
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const roleMenuItems = getRoleMenuItems();

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
                {/* 用户名按钮 + 角色标签 */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#C8102E]/10 hover:bg-[#C8102E]/20 text-[#C8102E] transition-colors"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium max-w-[80px] truncate">{user.name}</span>
                  {getRoleBadge()}
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* P1-A：下拉菜单（含角色专属入口） */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                    {/* 角色专属快捷入口 */}
                    {roleMenuItems.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                          快捷操作
                        </div>
                        {roleMenuItems.map((item, idx) => (
                          <Link key={idx} href={item.href}>
                            <button
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                            >
                              {item.icon}
                              {item.label}
                            </button>
                          </Link>
                        ))}
                        <div className="border-t border-border my-1" />
                      </>
                    )}

                    {/* 个人中心（所有角色均有） */}
                    <Link href="/profile">
                      <button
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        {t('nav.profile')}
                      </button>
                    </Link>

                    {/* 退出登录 */}
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
            <div className="container py-4 space-y-1">
              <Link href="/">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-2 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-muted"
                >
                  {t('nav.home')}
                </span>
              </Link>
              <Link href="/museums">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-2 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-muted"
                >
                  {t('nav.museums')}
                </span>
              </Link>
              <Link href="/designers">
                <span
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-2 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-muted"
                >
                  {t('nav.designers')}
                </span>
              </Link>

              {isAuthenticated && user ? (
                <div className="space-y-1 pt-3 border-t border-border mt-2">
                  {/* 用户信息行 */}
                  <div className="flex items-center gap-2 px-2 py-2">
                    <User className="w-4 h-4 text-[#C8102E]" />
                    <span className="text-sm font-medium text-[#C8102E]">{user.name}</span>
                    {getRoleBadge()}
                  </div>

                  {/* P1-A：移动端角色专属快捷入口 */}
                  {roleMenuItems.map((item, idx) => (
                    <Link key={idx} href={item.href}>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground transition-colors text-sm"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    </Link>
                  ))}

                  {/* 个人中心 */}
                  <Link href="/profile">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground transition-colors text-sm"
                    >
                      <User className="w-4 h-4" />
                      {t('nav.profile')}
                    </button>
                  </Link>

                  {/* 退出登录 */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground transition-colors text-sm border-t border-border mt-1 pt-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-border mt-2">
                  <a href={getLoginUrl()}>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-[#C8102E]/10 text-[#C8102E] transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('common.login')}</span>
                    </button>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
