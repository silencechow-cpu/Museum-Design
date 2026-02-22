/**
 * 新中式数字主义设计系统 - 入驻板块
 * 博物馆和设计师入驻的双栏展示
 * 采用对称平衡设计
 */

import { useTranslation } from 'react-i18next';
import { Building2, Palette } from 'lucide-react';
import { useLocation } from 'wouter';

export default function JoinSection() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  return (
    <section id="join" className="relative py-32 bg-gradient-to-b from-background to-muted">
      <div className="container">
        {/* 标题区域 */}
        <div className="text-center mb-20 reveal-animation">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('section.join.title')}
          </h2>
        </div>

        {/* 双栏入驻卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* 博物馆入驻 */}
          <div className="group relative reveal-animation">
            <div className="relative h-full bg-card border-2 border-border rounded-2xl p-10 hover:border-primary transition-all duration-500 hover:shadow-2xl overflow-hidden">
              {/* 装饰性背景图案 */}
              <div className="absolute top-0 right-0 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Building2 className="w-full h-full text-primary" strokeWidth={0.5} />
              </div>

              <div className="relative z-10">
                {/* 图标 */}
                <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Building2 className="w-10 h-10 text-primary" />
                </div>

                {/* 标题 */}
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  {t('section.join.museum')}
                </h3>

                {/* 描述 */}
                <p className="text-lg text-muted-foreground mb-8">
                  {t('section.join.museum.desc')}
                </p>

                {/* 特点列表 */}
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">发布文物高清素材与详细说明</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">设定奖金与荣誉激励机制</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">获得优质文创设计方案</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">扩大博物馆文化影响力</span>
                  </li>
                </ul>

                {/* 按钮 */}
                <button
                  onClick={() => setLocation('/login?role=museum')}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {t('section.join.cta')}
                </button>
              </div>
            </div>
          </div>

          {/* 设计师入驻 */}
          <div className="group relative reveal-animation" style={{ animationDelay: '0.2s' }}>
            <div className="relative h-full bg-card border-2 border-border rounded-2xl p-10 hover:border-primary transition-all duration-500 hover:shadow-2xl overflow-hidden">
              {/* 装饰性背景图案 */}
              <div className="absolute top-0 right-0 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Palette className="w-full h-full text-primary" strokeWidth={0.5} />
              </div>

              <div className="relative z-10">
                {/* 图标 */}
                <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Palette className="w-10 h-10 text-primary" />
                </div>

                {/* 标题 */}
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  {t('section.join.designer')}
                </h3>

                {/* 描述 */}
                <p className="text-lg text-muted-foreground mb-8">
                  {t('section.join.designer.desc')}
                </p>

                {/* 特点列表 */}
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">获取珍贵文物高清素材资源</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">参与多样化文创设计项目</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">赢取丰厚奖金与荣誉证书</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-foreground">展示作品提升个人影响力</span>
                  </li>
                </ul>

                {/* 按钮 */}
                <button
                  onClick={() => setLocation('/login?role=designer')}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {t('section.join.cta')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部统计数据 */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center reveal-animation" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl font-bold text-primary mb-2">200+</div>
            <div className="text-sm text-muted-foreground">{t('section.join.stats.museums')}</div>
          </div>
          <div className="text-center reveal-animation" style={{ animationDelay: '0.4s' }}>
            <div className="text-4xl font-bold text-primary mb-2">5000+</div>
            <div className="text-sm text-muted-foreground">{t('section.join.stats.designers')}</div>
          </div>
          <div className="text-center reveal-animation" style={{ animationDelay: '0.5s' }}>
            <div className="text-4xl font-bold text-primary mb-2">800+</div>
            <div className="text-sm text-muted-foreground">{t('section.join.stats.collections')}</div>
          </div>
          <div className="text-center reveal-animation" style={{ animationDelay: '0.6s' }}>
            <div className="text-4xl font-bold text-primary mb-2">¥500万+</div>
            <div className="text-sm text-muted-foreground">{t('section.join.stats.prize')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
