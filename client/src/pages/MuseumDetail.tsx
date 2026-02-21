/**
 * 博物馆详情页面
 * 展示博物馆的完整信息和历史征集项目
 */

import { useParams, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Mail, Phone, Globe, Calendar, DollarSign, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

export default function MuseumDetail() {
  const { t } = useTranslation();
  const params = useParams();
  const museumId = parseInt(params.id || '0');

  // 获取博物馆信息
  const { data: museum, isLoading: museumLoading } = trpc.museum.getById.useQuery({ id: museumId });

  // 获取博物馆的征集项目
  const { data: collections, isLoading: collectionsLoading } = trpc.collection.search.useQuery({
    museumId,
  });

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
  };

  if (museumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
      </div>
    );
  }

  if (!museum) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
        <Navigation />
        <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('museum.details')} {t('common.noData')}</h1>
          <Link href="/">
            <Button className="bg-[#C8102E] hover:bg-[#A00D24]">{t('workDetail.backToHome')}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
      <SEOHead
        title={museum.name}
        description={museum.description || `${museum.name}的详细信息和历史征集项目`}
        type="profile"
        keywords={`${museum.name},博物馆,文创征集,${museum.address || ''}`}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      <Navigation />

      <div className="container max-w-6xl mx-auto py-12 px-4">
        {/* 博物馆基本信息 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-lg bg-[#C8102E]/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-12 h-12 text-[#C8102E]" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{museum.name}</CardTitle>
                <CardDescription className="text-base">
                  {museum.description || t('common.noData')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {museum.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t('museum.address')}</div>
                    <div className="mt-1">{museum.address}</div>
                  </div>
                </div>
              )}

              {museum.contactEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t('profile.museum.contactEmail')}</div>
                    <div className="mt-1">{museum.contactEmail}</div>
                  </div>
                </div>
              )}

              {museum.contactPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t('profile.museum.contactPhone')}</div>
                    <div className="mt-1">{museum.contactPhone}</div>
                  </div>
                </div>
              )}

              {museum.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{t('museum.website')}</div>
                    <div className="mt-1">
                      <a
                        href={museum.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C8102E] hover:underline"
                      >
                        {museum.website}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 历史征集项目 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('museum.collections')}</CardTitle>
            <CardDescription>{t('museum.activeCollections')}</CardDescription>
          </CardHeader>

          <CardContent>
            {collectionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
              </div>
            ) : collections && collections.items && collections.items.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {collections.items.map((collection: any) => (
                  <div
                    key={collection.id}
                    className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold flex-1">
                        {collection.artifactName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          collection.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : collection.status === 'closed'
                            ? 'bg-gray-100 text-gray-700'
                            : collection.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {collection.status === 'active'
                          ? t('collection.statusActive')
                          : collection.status === 'closed'
                          ? t('collection.statusClosed')
                          : collection.status === 'completed'
                          ? t('collection.statusClosed')
                          : t('collection.statusPaused')}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {collection.description || collection.artifactDescription}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center gap-1 text-[#C8102E]">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">
                          ¥{(collection.prizeAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(collection.deadline)}</span>
                      </div>
                    </div>

                    <Link href={`/collection/${collection.id}`}>
                      <Button
                        variant="outline"
                        className="w-full border-[#C8102E] text-[#C8102E] hover:bg-[#C8102E] hover:text-white"
                      >
                        {t('collection.details')}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('collection.noWorks')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
