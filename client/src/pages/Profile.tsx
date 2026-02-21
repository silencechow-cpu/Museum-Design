import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Palette, Edit, Heart, Briefcase, Trophy, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import UserStatsCards from "@/components/UserStatsCards";
import CollectionManagementCard from "@/components/CollectionManagementCard";

export default function Profile() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // 检查用户注册状态
  const { data: onboardingStatus } = trpc.auth.checkOnboardingStatus.useQuery(
    undefined,
    {
      enabled: !!user,
      retry: false,
    }
  );

  // 获取博物馆资料
  const { data: museumProfile, isLoading: museumLoading } = trpc.museum.getMyProfile.useQuery(
    undefined,
    {
      enabled: !!user && onboardingStatus?.userType === 'museum',
    }
  );

  // 获取设计师资料
  const { data: designerProfile, isLoading: designerLoading } = trpc.designer.getMyProfile.useQuery(
    undefined,
    {
      enabled: !!user && onboardingStatus?.userType === 'designer',
    }
  );

  // 获取我的征集（博物馆）
  const { data: myCollections, isLoading: collectionsLoading } = trpc.collection.getMyCollections.useQuery(
    undefined,
    {
      enabled: !!user && onboardingStatus?.userType === 'museum',
    }
  );

  // 获取我的作品（设计师）
  const { data: myWorks, isLoading: worksLoading } = trpc.work.getMyWorks.useQuery(
    undefined,
    {
      enabled: !!user && onboardingStatus?.userType === 'designer',
    }
  );

  // 获取我的收藏
  const { data: myFavorites, isLoading: favoritesLoading } = trpc.favorite.getMyFavorites.useQuery();

  // 博物馆编辑表单
  const [museumForm, setMuseumForm] = useState({
    name: "",
    description: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
  });

  // 设计师编辑表单
  const [designerForm, setDesignerForm] = useState({
    displayName: "",
    bio: "",
    type: "individual" as "individual" | "team" | "school",
    organization: "",
    portfolio: "",
  });

  // 初始化表单数据
  useEffect(() => {
    if (museumProfile) {
      setMuseumForm({
        name: museumProfile.name || "",
        description: museumProfile.description || "",
        address: museumProfile.address || "",
        contactEmail: museumProfile.contactEmail || "",
        contactPhone: museumProfile.contactPhone || "",
        website: museumProfile.website || "",
      });
    }
  }, [museumProfile]);

  useEffect(() => {
    if (designerProfile) {
      setDesignerForm({
        displayName: designerProfile.displayName || "",
        bio: designerProfile.bio || "",
        type: designerProfile.type || "individual",
        organization: designerProfile.organization || "",
        portfolio: designerProfile.portfolio || "",
      });
    }
  }, [designerProfile]);

  const utils = trpc.useUtils();

  const updateMuseumMutation = trpc.museum.update.useMutation({
    onSuccess: () => {
      toast.success(t('profile.updateSuccess'));
      setEditDialogOpen(false);
      utils.museum.getMyProfile.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || t('profile.updateError'));
    },
  });

  const updateDesignerMutation = trpc.designer.update.useMutation({
    onSuccess: () => {
      toast.success(t('profile.updateSuccess'));
      setEditDialogOpen(false);
      utils.designer.getMyProfile.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || t('profile.updateError'));
    },
  });

  const handleMuseumUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMuseumMutation.mutate(museumForm);
  };

  const handleDesignerUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateDesignerMutation.mutate(designerForm);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (onboardingStatus?.needsOnboarding) {
    setLocation("/onboarding");
    return null;
  }

  const isMuseum = onboardingStatus?.userType === 'museum';
  const isDesigner = onboardingStatus?.userType === 'designer';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-white">
      <Navigation />
      
      <div className="container max-w-6xl mx-auto pt-24 pb-12 px-4">
        {/* 数据统计卡片 */}
        <div className="mb-8">
          <UserStatsCards />
        </div>

        {/* 用户信息卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#C8102E]/10 flex items-center justify-center">
                  {isMuseum ? (
                    <Building2 className="w-8 h-8 text-[#C8102E]" />
                  ) : (
                    <Palette className="w-8 h-8 text-[#C8102E]" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {isMuseum ? museumProfile?.name : designerProfile?.displayName}
                  </CardTitle>
                  <CardDescription>
                    {user.email} · {isMuseum ? t('profile.museum') : t('profile.designer')}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setLocation("/edit-profile")}
                >
                  <Edit className="w-4 h-4" />
                  {t('profile.editProfile')}
                </Button>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Edit className="w-4 h-4" />
                      {t('profile.editRoleProfile', { role: isMuseum ? t('profile.museum') : t('profile.designer') })}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('profile.editRoleProfile', { role: isMuseum ? t('profile.museum') : t('profile.designer') })}</DialogTitle>
                    <DialogDescription>
                      {t('profile.updateInfo')}
                    </DialogDescription>
                  </DialogHeader>

                  {isMuseum && (
                    <form onSubmit={handleMuseumUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">{t('profile.museumName')} *</Label>
                        <Input
                          id="edit-name"
                          value={museumForm.name}
                          onChange={(e) => setMuseumForm({ ...museumForm, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-description">{t('profile.description')}</Label>
                        <Textarea
                          id="edit-description"
                          value={museumForm.description}
                          onChange={(e) => setMuseumForm({ ...museumForm, description: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-address">{t('profile.address')}</Label>
                        <Input
                          id="edit-address"
                          value={museumForm.address}
                          onChange={(e) => setMuseumForm({ ...museumForm, address: e.target.value })}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">{t('profile.contactEmail')}</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={museumForm.contactEmail}
                            onChange={(e) => setMuseumForm({ ...museumForm, contactEmail: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">{t('profile.contactPhone')}</Label>
                          <Input
                            id="edit-phone"
                            value={museumForm.contactPhone}
                            onChange={(e) => setMuseumForm({ ...museumForm, contactPhone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-website">{t('profile.website')}</Label>
                        <Input
                          id="edit-website"
                          type="url"
                          value={museumForm.website}
                          onChange={(e) => setMuseumForm({ ...museumForm, website: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditDialogOpen(false)}
                          className="flex-1"
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]"
                          disabled={updateMuseumMutation.isPending}
                        >
                          {updateMuseumMutation.isPending ? t('common.saving') : t('common.save')}
                        </Button>
                      </div>
                    </form>
                  )}

                  {isDesigner && (
                    <form onSubmit={handleDesignerUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-displayName">{t('profile.displayName')} *</Label>
                        <Input
                          id="edit-displayName"
                          value={designerForm.displayName}
                          onChange={(e) => setDesignerForm({ ...designerForm, displayName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-type">{t('profile.type')}</Label>
                        <Select
                          value={designerForm.type}
                          onValueChange={(value: "individual" | "team" | "school") =>
                            setDesignerForm({ ...designerForm, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">{t('profile.typeIndividual')}</SelectItem>
                            <SelectItem value="team">{t('profile.typeTeam')}</SelectItem>
                            <SelectItem value="school">{t('profile.typeSchool')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-bio">{t('profile.bio')}</Label>
                        <Textarea
                          id="edit-bio"
                          value={designerForm.bio}
                          onChange={(e) => setDesignerForm({ ...designerForm, bio: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-organization">{t('profile.organization')}</Label>
                        <Input
                          id="edit-organization"
                          value={designerForm.organization}
                          onChange={(e) => setDesignerForm({ ...designerForm, organization: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-portfolio">{t('profile.portfolio')}</Label>
                        <Input
                          id="edit-portfolio"
                          type="url"
                          value={designerForm.portfolio}
                          onChange={(e) => setDesignerForm({ ...designerForm, portfolio: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditDialogOpen(false)}
                          className="flex-1"
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-[#C8102E] hover:bg-[#A00D24]"
                          disabled={updateDesignerMutation.isPending}
                        >
                          {updateDesignerMutation.isPending ? t('common.saving') : t('common.save')}
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isMuseum && museumProfile && (
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {museumProfile.description && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">{t('profile.description')}:</span>
                    <p className="mt-1">{museumProfile.description}</p>
                  </div>
                )}
                {museumProfile.address && (
                  <div>
                    <span className="text-muted-foreground">{t('profile.address')}:</span>
                    <p className="mt-1">{museumProfile.address}</p>
                  </div>
                )}
                {museumProfile.contactEmail && (
                  <div>
                    <span className="text-muted-foreground">{t('profile.email')}:</span>
                    <p className="mt-1">{museumProfile.contactEmail}</p>
                  </div>
                )}
                {museumProfile.contactPhone && (
                  <div>
                    <span className="text-muted-foreground">{t('profile.phone')}:</span>
                    <p className="mt-1">{museumProfile.contactPhone}</p>
                  </div>
                )}
                {museumProfile.website && (
                  <div>
                    <span className="text-muted-foreground">{t('profile.website')}:</span>
                    <p className="mt-1">
                      <a href={museumProfile.website} target="_blank" rel="noopener noreferrer" className="text-[#C8102E] hover:underline">
                        {museumProfile.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}

            {isDesigner && designerProfile && (
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {designerProfile.bio && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">{t('profile.description')}:</span>
                    <p className="mt-1">{designerProfile.bio}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">{t('profile.type')}:</span>
                  <p className="mt-1">
                    {designerProfile.type === 'individual' ? t('profile.typeIndividual') : 
                     designerProfile.type === 'team' ? t('profile.typeTeam') : t('profile.typeSchool')}
                  </p>
                </div>
                {designerProfile.organization && (
                  <div>
                    <span className="text-muted-foreground">{t('profile.organization')}:</span>
                    <p className="mt-1">{designerProfile.organization}</p>
                  </div>
                )}
                {designerProfile.portfolio && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">{t('profile.portfolio')}:</span>
                    <p className="mt-1">
                      <a href={designerProfile.portfolio} target="_blank" rel="noopener noreferrer" className="text-[#C8102E] hover:underline">
                        {designerProfile.portfolio}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 标签页内容 */}
        <Tabs defaultValue={isMuseum ? "collections" : "works"} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            {isMuseum && (
              <TabsTrigger value="collections" className="gap-2">
                <Briefcase className="w-4 h-4" />
                {t('profile.myCollections')}
              </TabsTrigger>
            )}
            {isDesigner && (
              <TabsTrigger value="works" className="gap-2">
                <Trophy className="w-4 h-4" />
                {t('profile.myWorks')}
              </TabsTrigger>
            )}
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              {t('profile.myFavorites')}
            </TabsTrigger>
          </TabsList>

          {/* 我的征集（博物馆） */}
          {isMuseum && (
            <TabsContent value="collections">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.myCollections')}</CardTitle>
                  <CardDescription>{t('profile.collectionsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {collectionsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
                    </div>
                  ) : myCollections && myCollections.length > 0 ? (
                    <div className="space-y-4">
                      {myCollections.map((collection) => (
                        <CollectionManagementCard
                          key={collection.id}
                          collection={collection}
                          onStatusChange={() => {
                            // 刷新征集列表
                            trpc.useUtils().collection.getMyCollections.invalidate();
                          }}
                          onNavigate={() => setLocation(`/collection/${collection.id}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('profile.noCollections')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* 我的作品（设计师） */}
          {isDesigner && (
            <TabsContent value="works">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.myWorks')}</CardTitle>
                  <CardDescription>{t('profile.worksDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {worksLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
                    </div>
                  ) : myWorks && myWorks.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myWorks.map((work) => (
                        <div
                          key={work.id}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {work.images && work.images.length > 0 && (
                            <img
                              src={work.images[0]}
                              alt={work.title}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold mb-2">{work.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {work.description}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              work.status === 'approved' ? 'bg-green-100 text-green-700' :
                              work.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {work.status === 'approved' ? t('profile.statusApproved') :
                               work.status === 'rejected' ? t('profile.statusRejected') : t('profile.statusPending')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('profile.noWorks')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* 我的收藏 */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.myFavorites')}</CardTitle>
                <CardDescription>{t('profile.favoritesDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C8102E]" />
                  </div>
                ) : myFavorites && myFavorites.length > 0 ? (
                  <div className="space-y-4">
                    {myFavorites.map((favorite) => (
                      <div
                        key={favorite.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-muted-foreground">
                              {favorite.targetType === 'collection' ? t('profile.collectionItem') : t('profile.workItem')}
                            </span>
                            <p className="text-sm mt-1">
                              {t('profile.favoritedAt', { date: new Date(favorite.createdAt).toLocaleDateString() })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('profile.noFavorites')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
