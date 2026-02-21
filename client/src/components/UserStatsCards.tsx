import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Building2, FileText, Heart, TrendingUp } from "lucide-react";

export default function UserStatsCards() {
  const { data: stats, isLoading } = trpc.stats.getMyStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">加载中...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const isMuseum = stats.role === "museum";
  const isDesigner = stats.role === "designer";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 征集/作品数 */}
      <Card className="hover:shadow-lg transition-shadow border-[#C8102E]/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {isMuseum ? "发布征集" : isDesigner ? "提交作品" : "内容数"}
          </CardTitle>
          <Building2 className="h-4 w-4 text-[#C8102E]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#2C1810]">
            {isMuseum ? stats.collectionsCount : stats.worksCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isMuseum ? "个征集项目" : isDesigner ? "件作品" : ""}
          </p>
        </CardContent>
      </Card>

      {/* 作品/参与数 */}
      <Card className="hover:shadow-lg transition-shadow border-[#C8102E]/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {isMuseum ? "收到作品" : isDesigner ? "参与征集" : "互动数"}
          </CardTitle>
          <FileText className="h-4 w-4 text-[#C8102E]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#2C1810]">
            {isMuseum ? stats.worksCount : stats.collectionsCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isMuseum ? "件作品" : isDesigner ? "个征集" : ""}
          </p>
        </CardContent>
      </Card>

      {/* 收藏数 */}
      <Card className="hover:shadow-lg transition-shadow border-[#C8102E]/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            我的收藏
          </CardTitle>
          <Heart className="h-4 w-4 text-[#C8102E]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#2C1810]">
            {stats.favoritesCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            个收藏项
          </p>
        </CardContent>
      </Card>

      {/* 活跃度 */}
      <Card className="hover:shadow-lg transition-shadow border-[#C8102E]/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            活跃度
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-[#C8102E]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#2C1810]">
            {Math.round(
              ((stats.collectionsCount + stats.worksCount + stats.favoritesCount) / 3) * 10
            ) / 10}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            综合评分
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
