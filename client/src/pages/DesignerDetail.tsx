/**
 * 设计师详情页面
 * 展示设计师的完整信息和历史作品
 */

import { useParams, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Award, Loader2, ExternalLink } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ImageLightbox from '@/components/ImageLightbox';
import SEOHead from '@/components/SEOHead';
import WorkRatingDisplay from '@/components/WorkRatingDisplay';

export default function DesignerDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const designerId = parseInt(params.id || '0');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // 获取设计师信息
  const { data: designer, isLoading: designerLoading } = trpc.designer.getById.useQuery({ id: designerId });

  // 获取设计师的作品
  const { data: works, isLoading: worksLoading } = trpc.work.getByDesignerId.useQuery({ designerId });

  if (designerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
        <Navigation />
        <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('designer.notFound')}</h1>
          <Link href="/">
            <Button className="bg-[#C8102E] hover:bg-[#A00D24]">{t('common.backToHome')}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
      <SEOHead
        title={designer.displayName}
        description={designer.bio || `${designer.displayName}的个人主页和作品集`}
        type="profile"
        keywords={`${designer.displayName},设计师,文创设计,${designer.skills || ''}`}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navigation />

      <div className="container max-w-6xl mx-auto py-12 px-4">
        {/* 设计师基本信息 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-[#C8102E]/10 flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12 text-[#C8102E]" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{designer.displayName}</CardTitle>
                <CardDescription className="text-base">
                  {designer.bio || t('designer.noBio')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {designer.skills && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t('designer.skills')}</div>
                    <div className="mt-1">
                      {JSON.parse(designer.skills).map((skill: string, index: number) => (
                        <span key={index} className="inline-block mr-2 mb-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {designer.organization && (
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t('designer.institution')}</div>
                    <div className="mt-1">{designer.organization}</div>
                  </div>
                </div>
              )}

              {designer.portfolio && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <ExternalLink className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t('designer.portfolio')}</div>
                    <div className="mt-1">
                      <a
                        href={designer.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C8102E] hover:underline"
                      >
                        {designer.portfolio}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 历史作品 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('designer.works')}</CardTitle>
            <CardDescription>{t('designer.worksDescription')}</CardDescription>
          </CardHeader>

          <CardContent>
            {worksLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
              </div>
            ) : works && works.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {works.map((work: any) => (
                  <Link key={work.id} href={`/work/${work.id}`}>
                    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      {/* 作品图片 */}
                      {work.images && JSON.parse(work.images).length > 0 ? (
                      <div 
                        className="aspect-square overflow-hidden bg-gray-100 cursor-pointer group relative"
                        onClick={() => {
                          const images = JSON.parse(work.images);
                          setLightboxImages(images);
                          setLightboxIndex(0);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={JSON.parse(work.images)[0]}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 px-3 py-1 rounded-full text-xs font-medium">
                            {t('common.viewImage')}
                          </div>
                        </div>
                      </div>
                      ) : (
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <Briefcase className="w-12 h-12 text-gray-400" />
                        </div>
                      )}

                      {/* 作品信息 */}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-1">{work.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {work.description}
                        </p>

                        {work.tags && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {JSON.parse(work.tags).slice(0, 3).map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              work.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : work.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {work.status === 'approved'
                              ? t('work.statusApproved')
                              : work.status === 'rejected'
                              ? t('work.statusRejected')
                              : t('work.statusPending')}
                          </span>
                          <WorkRatingDisplay workId={work.id} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('designer.noWorks')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
      
      {/* 图片灯箱 */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}
