import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const statsRouter = router({
  // 获取当前用户的统计数据
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const userRole = ctx.user.role;

    // 基础统计数据
    const stats = {
      role: userRole,
      collectionsCount: 0,
      worksCount: 0,
      favoritesCount: 0,
      viewsCount: 0,
    };

    // 获取收藏数
    const favorites = await db.getFavoritesByUserId(userId);
    stats.favoritesCount = favorites.length;

    if (userRole === "museum") {
      // 博物馆用户统计
      const museum = await db.getMuseumByUserId(userId);
      if (museum) {
        const collections = await db.getCollectionsByMuseumId(museum.id);
        stats.collectionsCount = collections.length;

        // 统计收到的作品数
        let totalWorks = 0;
        for (const collection of collections) {
          const works = await db.getWorksByCollectionId(collection.id);
          totalWorks += works.length;
        }
        stats.worksCount = totalWorks;
      }
    } else if (userRole === "designer") {
      // 设计师用户统计
      const designer = await db.getDesignerByUserId(userId);
      if (designer) {
        const works = await db.getWorksByDesignerId(designer.id);
        stats.worksCount = works.length;

        // 统计参与的征集数（去重）
        const collectionIds = new Set(works.map(w => w.collectionId));
        stats.collectionsCount = collectionIds.size;
      }
    }

    return stats;
  }),
});
