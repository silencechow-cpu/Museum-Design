/**
 * 统一登录引导页面
 * 移动端优先设计，提供清晰的登录引导和说明
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl, getRegisterUrl, getForgotPasswordUrl } from "@/const";
import { LogIn, Mail, Smartphone, Shield, Building2, Palette, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  // 直接读取浏览器 URL 参数，兼容 wouter 路由
  const role = new URLSearchParams(window.location.search).get('role'); // 'museum' | 'designer' | null

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-amber-50 p-4">
      {/* 左上角返回首页按钮 */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
        </Link>
      </div>

      {/* Logo和标题（可点击返回首页） */}
      <div className="text-center mb-8">
        <Link href="/">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-[#C8102E] transition-colors duration-200">
            {t('login.appName')}
          </h1>
        </Link>
        <p className="text-lg md:text-xl text-gray-600">
          {t('login.appSlogan')}
        </p>
      </div>

      {/* 角色欢迎提示（来自 JoinSection 跳转时显示） */}
      {role && (
        <div className="w-full max-w-md mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#C8102E]/10 border border-[#C8102E]/20">
          {role === 'museum' ? (
            <Building2 className="h-5 w-5 text-[#C8102E] flex-shrink-0" />
          ) : (
            <Palette className="h-5 w-5 text-[#C8102E] flex-shrink-0" />
          )}
          <p className="text-sm text-[#C8102E] font-medium">
            {role === 'museum'
              ? '欢迎博物馆入驻！登录后即可发布征集项目'
              : '欢迎设计师加入！登录后即可参与文创设计征集'}
          </p>
        </div>
      )}

      {/* 登录卡片 */}
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">{t('login.welcome')}</CardTitle>
          <CardDescription className="text-base md:text-lg mt-2">
            {t('login.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 主登录按钮 */}
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-[#C8102E] hover:bg-[#A00D24]"
          >
            <LogIn className="mr-2 h-6 w-6" />
            {t('login.loginButton')}
          </Button>

          {/* 注册 & 忘记密码 */}
          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => window.location.href = getForgotPasswordUrl()}
              className="text-gray-500 hover:text-[#C8102E] transition-colors duration-200"
            >
              忘记密码？
            </button>
            <button
              onClick={() => window.location.href = getRegisterUrl()}
              className="text-[#C8102E] font-medium hover:text-[#A00D24] transition-colors duration-200"
            >
              还没有账号？立即注册
            </button>
          </div>

          {/* 登录方式说明 */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 text-center mb-4">
              {t('login.methodsTitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <Mail className="h-8 w-8 text-[#C8102E] mb-2" />
                <span className="text-sm font-medium">{t('login.emailLogin')}</span>
                <span className="text-xs text-gray-500 mt-1">{t('login.quickRegister')}</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <Smartphone className="h-8 w-8 text-[#C8102E] mb-2" />
                <span className="text-sm font-medium">{t('login.thirdPartyLogin')}</span>
                <span className="text-xs text-gray-500 mt-1">{t('login.wechatQQ')}</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <Shield className="h-8 w-8 text-[#C8102E] mb-2" />
                <span className="text-sm font-medium">{t('login.secure')}</span>
                <span className="text-xs text-gray-500 mt-1">{t('login.encrypted')}</span>
              </div>
            </div>
          </div>

          {/* 用户协议 */}
          <p className="text-xs text-gray-500 text-center">
            {t('login.agreementPrefix')}
            <a href="/terms" className="text-[#C8102E] hover:underline mx-1">
              {t('login.termsOfService')}
            </a>
            {t('login.and')}
            <a href="/privacy" className="text-[#C8102E] hover:underline mx-1">
              {t('login.privacyPolicy')}
            </a>
          </p>
        </CardContent>
      </Card>

      {/* 底部说明 */}
      <div className="mt-8 text-center max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('login.whyChooseUs')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="font-medium text-gray-900 mb-1">{t('login.feature1Title')}</p>
            <p>{t('login.feature1Desc')}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="font-medium text-gray-900 mb-1">{t('login.feature2Title')}</p>
            <p>{t('login.feature2Desc')}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="font-medium text-gray-900 mb-1">{t('login.feature3Title')}</p>
            <p>{t('login.feature3Desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
