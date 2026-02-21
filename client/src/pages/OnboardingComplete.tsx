/**
 * 注册完成引导页面
 * 在用户完成注册后显示，鼓励完善资料或关注博物馆
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, User, Building2, Heart, ArrowRight, X } from 'lucide-react';

export default function OnboardingComplete() {
  const [, setLocation] = useLocation();
  const [showGuide, setShowGuide] = useState(true);

  // 获取推荐的博物馆（前3个活跃博物馆）
  const { data: museums } = trpc.museum.list.useQuery(undefined, {
    select: (data: any) => data.slice(0, 3),
  });

  // 获取推荐的征集项目（前3个活跃征集）
  const { data: collections } = trpc.collection.search.useQuery(
    {
      status: 'active',
      page: 1,
      pageSize: 3,
    },
    {
      select: (data) => data.items,
    }
  );

  const handleSkip = () => {
    setShowGuide(false);
    setLocation('/');
  };

  const handleGoToProfile = () => {
    setLocation('/profile');
  };

  const handleExplore = () => {
    setLocation('/');
  };

  if (!showGuide) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white py-12">
      <div className="container max-w-4xl">
        {/* 关闭按钮 */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 欢迎信息 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">注册成功！</h1>
          <p className="text-xl text-muted-foreground">
            欢迎加入古韵新创平台，开启您的文创之旅
          </p>
        </div>

        {/* 引导卡片 */}
        <div className="grid gap-6 mb-8">
          {/* 完善个人资料 */}
          <Card className="border-2 border-[#C8102E]/20 hover:border-[#C8102E] transition-colors cursor-pointer" onClick={handleGoToProfile}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#C8102E]/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-[#C8102E]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">完善个人资料</CardTitle>
                    <CardDescription>上传头像、绑定社交媒体，让您的形象更专业</CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                  上传头像
                </span>
                <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                  绑定社交媒体
                </span>
                <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                  完善简介
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 推荐博物馆 */}
          {museums && museums.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">推荐博物馆</CardTitle>
                    <CardDescription>关注您感兴趣的博物馆，了解最新征集动态</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {museums.map((museum: any) => (
                    <div
                      key={museum.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/museums/${museum.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        {museum.logo && (
                          <img
                            src={museum.logo}
                            alt={museum.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{museum.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {museum.description}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4 mr-1" />
                        关注
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 推荐征集项目 */}
          {collections && collections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">热门征集项目</CardTitle>
                <CardDescription>浏览最新的文创征集，展示您的创意才华</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/collections/${collection.id}`)}
                    >
                      <div>
                        <p className="font-medium">{collection.title}</p>
                        <p className="text-sm text-muted-foreground">
                          奖金：{collection.prizeAmount ? `${collection.prizeAmount}元` : '待定'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        查看详情
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" size="lg" onClick={handleSkip}>
            稍后再说
          </Button>
          <Button size="lg" onClick={handleExplore} className="bg-[#C8102E] hover:bg-[#A00D24]">
            开始探索
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
