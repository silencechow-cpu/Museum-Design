/**
 * 新中式数字主义设计系统 - 加载动画
 * 带有logo和进度条的优雅加载效果
 */

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 模拟加载进度
    const duration = 2000; // 2秒加载时间
    const steps = 60; // 60帧
    const increment = 100 / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(currentStep * increment, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(timer);
        // 延迟一点再开始退出动画
        setTimeout(() => {
          setIsExiting(true);
          // 退出动画完成后通知父组件
          setTimeout(() => {
            onLoadingComplete();
          }, 600);
        }, 300);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-paper-white transition-opacity duration-600 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Logo动画 */}
        <div className="relative">
          {/* 外圈旋转装饰 */}
          <div className="absolute inset-0 -m-8">
            <svg className="w-40 h-40 animate-spin-slow" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="4 4"
                className="text-bronze-green/30"
              />
            </svg>
          </div>

          {/* Logo图片 */}
          <div className="relative breathe-animation">
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663342994367/kVDEImOsPMPHLGkv.png" 
              alt="古韵新创" 
              className="w-24 h-24 object-contain drop-shadow-2xl"
            />
          </div>

          {/* 内圈脉冲效果 */}
          <div className="absolute inset-0 -m-3">
            <div className="w-30 h-30 rounded-sm border-2 border-primary/20 animate-ping-slow" />
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center reveal-animation">
          <h2 className="text-2xl font-bold text-foreground mb-2">古韵新创</h2>
          <p className="text-sm text-muted-foreground">连接文化遗产与创意设计</p>
        </div>

        {/* 进度条 */}
        <div className="w-64">
          <div className="relative h-1 bg-muted rounded-full overflow-hidden">
            {/* 背景装饰纹理 */}
            <div className="absolute inset-0 opacity-30">
              <div className="h-full bg-gradient-to-r from-transparent via-bronze-green/20 to-transparent animate-shimmer" />
            </div>
            
            {/* 进度条主体 */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cinnabar-red via-amber-gold to-bronze-green rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* 进度条光晕 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* 进度百分比 */}
          <div className="mt-3 text-center">
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* 装饰性文字 */}
        <div className="text-xs text-muted-foreground/60 tracking-wider">
          LOADING · 载入中 · 加載中
        </div>
      </div>
    </div>
  );
}
