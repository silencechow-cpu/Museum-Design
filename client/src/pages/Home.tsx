/**
 * 新中式数字主义设计系统 - 首页
 * 采用卷轴式叙事布局，整合所有版块
 */

import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroBanner from '@/components/HeroBanner';
import CollectionsSection from '@/components/CollectionsSection';
import WorksSection from '@/components/WorksSection';
import JoinSection from '@/components/JoinSection';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { WelcomeDialog } from '@/components/WelcomeDialog';

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // 检查用户是否需要完成注册引导（仅对已登录用户）
  const { data: onboardingStatus } = trpc.auth.checkOnboardingStatus.useQuery(
    undefined,
    {
      enabled: isAuthenticated && !!user,
      retry: false,
    }
  );

  // 如果用户已登录但未完成注册，跳转到引导页
  // 未登录用户和普通浏览者可以正常访问首页
  useEffect(() => {
    if (isAuthenticated && user && onboardingStatus?.needsOnboarding) {
      setLocation('/onboarding');
    }
  }, [isAuthenticated, user, onboardingStatus, setLocation]);

  return (
    <div className="min-h-screen">
      {/* 欢迎对话框（仅已登录用户） */}
      {isAuthenticated && user && (
        <WelcomeDialog userName={user.name || ''} userRole={user.role} />
      )}
      <SEOHead
        title="首页"
        description="古韵新创是专业的博物馆文创对接平台，连接文化遗产与创意设计。博物馆发布文创征集，设计师提交作品，共同传承中华文化。"
        keywords="博物馆,文创,设计,征集,文化遗产,创意设计,中国文化"
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navigation />
      <HeroBanner />
      <CollectionsSection />
      <WorksSection />
      <JoinSection />
      <Footer />
    </div>
  );
}
