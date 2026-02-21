/**
 * 新中式数字主义设计系统 - 英雄横幅
 * 5个广告位轮播展示博物馆镇馆之宝
 * 采用卷轴式叙事，文物图片配合渐变蒙版
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { images } from '@/config/images';

// 使用配置文件中的横幅图片数据
const bannerSlides = images.heroBanners.map((banner, index) => ({
  id: index + 1,
  image: banner.url,
  title: { 'zh-CN': banner.title, 'zh-TW': banner.title, 'en': banner.title },
  subtitle: { 'zh-CN': banner.description, 'zh-TW': banner.description, 'en': banner.description },
}));

export default function HeroBanner() {
  const { t, i18n } = useTranslation();
  const language = i18n.language as 'zh-CN' | 'zh-TW' | 'en';
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* 轮播图片 */}
      {bannerSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title[language]}
            className="w-full h-full object-cover"
          />
          {/* 渐变蒙版 - 从底部到顶部 */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-ink-black/40 to-transparent" />
        </div>
      ))}

      {/* 内容层 */}
      <div className="absolute inset-0 flex items-end">
        <div className="container pb-24">
          <div className="max-w-3xl reveal-animation">
            <h2 className="text-5xl md:text-7xl font-bold text-paper-white mb-4">
              {bannerSlides[currentSlide].title[language]}
            </h2>
            <p className="text-xl md:text-2xl text-paper-white/90 mb-8 font-serif">
              {bannerSlides[currentSlide].subtitle[language]}
            </p>
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              {t('hero.cta')}
            </button>
          </div>
        </div>
      </div>

      {/* 导航控制 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <button
          onClick={goToPrevious}
          className="w-10 h-10 rounded-full bg-paper-white/20 backdrop-blur-sm flex items-center justify-center text-paper-white hover:bg-paper-white/30 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-4 bg-paper-white/40 hover:bg-paper-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="w-10 h-10 rounded-full bg-paper-white/20 backdrop-blur-sm flex items-center justify-center text-paper-white hover:bg-paper-white/30 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
