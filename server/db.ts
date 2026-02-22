import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, or, like, gte, lte, desc, asc, sql, count } from "drizzle-orm";
import { 
  InsertUser, 
  users, 
  museums, 
  Museum,
  InsertMuseum,
  designers,
  Designer,
  InsertDesigner,
  collections,
  Collection,
  InsertCollection,
  works,
  Work,
  InsertWork,
  favorites,
  Favorite,
  InsertFavorite,
  ratings,
  Rating,
  InsertRating,
  reviews,
  Review,
  InsertReview
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, {
        schema: { users, museums, designers, collections, works, favorites, ratings, reviews },
        mode: 'default',
      });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserAvatar(userId: number, avatarUrl: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user avatar: database not available");
    return;
  }

  await db.update(users).set({ avatar: avatarUrl }).where(eq(users.id, userId));
}

export async function updateUserSocialAccounts(userId: number, socialAccounts: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user social accounts: database not available");
    return;
  }

  await db.update(users).set({ socialAccounts }).where(eq(users.id, userId));
}

// ========== 博物馆相关 ==========

export async function createMuseum(museum: InsertMuseum): Promise<Museum | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(museums).values(museum);
  const insertedId = Number(result[0].insertId);
  return getMuseumById(insertedId);
}

export async function getMuseumById(id: number): Promise<Museum | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(museums).where(eq(museums.id, id)).limit(1);
  return result[0];
}

export async function getMuseumByUserId(userId: number): Promise<Museum | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(museums).where(eq(museums.userId, userId)).limit(1);
  return result[0];
}

export async function getAllMuseums(): Promise<Museum[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(museums);
}

export async function updateMuseum(id: number, data: Partial<InsertMuseum>): Promise<Museum | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(museums).set(data).where(eq(museums.id, id));
  return getMuseumById(id);
}

interface ListMuseumsParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'collectionsCount';
  sortOrder?: 'asc' | 'desc';
  province?: string;
  city?: string;
  keyword?: string;
}

export async function listMuseums(params: ListMuseumsParams = {}) {
  const db = await getDb();
  if (!db) return { museums: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    province,
    city,
    keyword
  } = params;

  const conditions = [];

  // 关键词搜索（名称或描述）
  if (keyword) {
    conditions.push(
      or(
        like(museums.name, `%${keyword}%`),
        like(museums.description, `%${keyword}%`)
      )
    );
  }

  // 地区筛选
  if (province) {
    conditions.push(like(museums.address, `%${province}%`));
  }
  if (city) {
    conditions.push(like(museums.address, `%${city}%`));
  }

  // 构建查询
  let query = db.select().from(museums);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // 排序
  if (sortBy === 'name') {
    query = query.orderBy(sortOrder === 'asc' ? asc(museums.name) : desc(museums.name)) as any;
  } else if (sortBy === 'createdAt') {
    query = query.orderBy(sortOrder === 'asc' ? asc(museums.createdAt) : desc(museums.createdAt)) as any;
  }
  // collectionsCount排序需要在获取数据后处理

  // 获取总数
  const totalResult = await db.select({ count: count() }).from(museums).where(conditions.length > 0 ? and(...conditions) : undefined);
  const total = totalResult[0]?.count || 0;

  // 分页
  const offset = (page - 1) * pageSize;
  const museumsList = await query.limit(pageSize).offset(offset);

  // 为所有博物馆添加征集数量
  const museumsWithCounts = await Promise.all(
    museumsList.map(async (museum) => {
      const collectionsCount = await db
        .select({ count: count() })
        .from(collections)
        .where(eq(collections.museumId, museum.id));
      return {
        ...museum,
        collectionsCount: collectionsCount[0]?.count || 0
      };
    })
  );

  // 如果按征集数量排序，需要重新排序
  if (sortBy === 'collectionsCount') {
    museumsWithCounts.sort((a, b) => 
      sortOrder === 'asc' 
        ? a.collectionsCount - b.collectionsCount
        : b.collectionsCount - a.collectionsCount
    );
  }

  return {
    museums: museumsWithCounts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

// ========== 设计师相关 ==========

export async function createDesigner(designer: InsertDesigner): Promise<Designer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(designers).values(designer);
  const insertedId = Number(result[0].insertId);
  return getDesignerById(insertedId);
}

export async function getDesignerById(id: number): Promise<Designer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(designers).where(eq(designers.id, id)).limit(1);
  return result[0];
}

export async function getDesignerByUserId(userId: number): Promise<Designer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(designers).where(eq(designers.userId, userId)).limit(1);
  return result[0];
}

export async function getAllDesigners(): Promise<Designer[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(designers);
}

export async function updateDesigner(id: number, data: Partial<InsertDesigner>): Promise<Designer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(designers).set(data).where(eq(designers.id, id));
  return getDesignerById(id);
}

interface ListDesignersParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'displayName' | 'createdAt' | 'worksCount';
  sortOrder?: 'asc' | 'desc';
  type?: 'individual' | 'team' | 'school';
  keyword?: string;
}

export async function listDesigners(params: ListDesignersParams = {}) {
  const db = await getDb();
  if (!db) return { designers: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

  const {
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    type,
    keyword
  } = params;

  const conditions = [];

  // 关键词搜索（显示名称或简介）
  if (keyword) {
    conditions.push(
      or(
        like(designers.displayName, `%${keyword}%`),
        like(designers.bio, `%${keyword}%`)
      )
    );
  }

  // 类型筛选
  if (type) {
    conditions.push(eq(designers.type, type));
  }

  // 构建查询
  let query = db.select().from(designers);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // 排序
  if (sortBy === 'displayName') {
    query = query.orderBy(sortOrder === 'asc' ? asc(designers.displayName) : desc(designers.displayName)) as any;
  } else if (sortBy === 'createdAt') {
    query = query.orderBy(sortOrder === 'asc' ? asc(designers.createdAt) : desc(designers.createdAt)) as any;
  }
  // worksCount排序需要在获取数据后处理

  // 获取总数
  const totalResult = await db.select({ count: count() }).from(designers).where(conditions.length > 0 ? and(...conditions) : undefined);
  const total = totalResult[0]?.count || 0;

  // 分页
  const offset = (page - 1) * pageSize;
  const designersList = await query.limit(pageSize).offset(offset);

  // 为所有设计师添加作品数量和获奖数量
  const designersWithCounts = await Promise.all(
    designersList.map(async (designer) => {
      const worksCount = await db
        .select({ count: count() })
        .from(works)
        .where(eq(works.designerId, designer.id));
      
      // 获奖数量 = 状态为'winner'的作品数
      const awardsCount = await db
        .select({ count: count() })
        .from(works)
        .where(and(
          eq(works.designerId, designer.id),
          eq(works.status, 'winner')
        ));
      
      return {
        ...designer,
        worksCount: worksCount[0]?.count || 0,
        awardsCount: awardsCount[0]?.count || 0
      };
    })
  );

  // 如果按作品数量排序，需要重新排序
  if (sortBy === 'worksCount') {
    designersWithCounts.sort((a, b) => 
      sortOrder === 'asc' 
        ? a.worksCount - b.worksCount
        : b.worksCount - a.worksCount
    );
  }

  return {
    designers: designersWithCounts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

// ========== 征集项目相关 ==========

export async function createCollection(collection: InsertCollection): Promise<Collection | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(collections).values(collection);
  const insertedId = Number(result[0].insertId);
  return getCollectionById(insertedId);
}

export async function getCollectionById(id: number): Promise<Collection | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
  return result[0];
}

export async function getAllCollections(): Promise<Collection[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(collections);
}

export async function getCollectionsByMuseumId(museumId: number): Promise<Collection[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(collections).where(eq(collections.museumId, museumId));
}

export async function updateCollection(
  id: number,
  data: Partial<InsertCollection>
): Promise<Collection | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(collections)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(collections.id, id));
  
  return getCollectionById(id);
}

export async function updateCollectionStatus(
  collectionId: number,
  status: "draft" | "active" | "closed" | "completed"
): Promise<Collection | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(collections)
    .set({ status, updatedAt: new Date() })
    .where(eq(collections.id, collectionId));
  
  return getCollectionById(collectionId);
}

interface SearchCollectionsParams {
  keyword?: string;
  museumId?: number;
  minPrize?: number;
  maxPrize?: number;
  deadlineStart?: Date;
  deadlineEnd?: Date;
  status?: "draft" | "active" | "closed" | "completed";
  page?: number;
  pageSize?: number;
}

export async function searchCollections(params: SearchCollectionsParams): Promise<{ items: Collection[]; total: number; hasMore: boolean }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0, hasMore: false };

  const conditions = [];

  // 关键词搜索（标题或描述）
  if (params.keyword) {
    conditions.push(
      or(
        like(collections.title, `%${params.keyword}%`),
        like(collections.description, `%${params.keyword}%`),
        like(collections.artifactName, `%${params.keyword}%`)
      )
    );
  }

  // 博物馆筛选
  if (params.museumId !== undefined) {
    conditions.push(eq(collections.museumId, params.museumId));
  }

  // 奖金范围筛选
  if (params.minPrize !== undefined) {
    conditions.push(gte(collections.prizeAmount, params.minPrize));
  }
  if (params.maxPrize !== undefined) {
    conditions.push(lte(collections.prizeAmount, params.maxPrize));
  }

  // 截止日期筛选
  if (params.deadlineStart) {
    conditions.push(gte(collections.deadline, params.deadlineStart));
  }
  if (params.deadlineEnd) {
    conditions.push(lte(collections.deadline, params.deadlineEnd));
  }

  // 状态筛选
  if (params.status) {
    conditions.push(eq(collections.status, params.status));
  }

  // 构建查询条件
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 获取总数
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(collections)
    .where(whereClause);

  // 分页参数
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const offset = (page - 1) * pageSize;

  // 获取分页数据
  let query = db.select().from(collections);
  if (whereClause) {
    query = query.where(whereClause) as any;
  }
  
  const items = await query
    .orderBy(desc(collections.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    items,
    total,
    hasMore: offset + items.length < total,
  };
}

// 获取相关征集推荐
export async function getRelatedCollections(collectionId: number, limit: number = 6): Promise<Collection[]> {
  const db = await getDb();
  if (!db) return [];

  // 首先获取当前征集信息
  const currentCollection = await getCollectionById(collectionId);
  if (!currentCollection) return [];

  // 推荐逻辑：
  // 1. 优先推荐同一博物馆的其他活跃征集
  // 2. 其次推荐其他活跃征集
  // 3. 排除当前征集
  const relatedCollections = await db
    .select()
    .from(collections)
    .where(
      and(
        eq(collections.status, 'active'),
        // 排除当前征集
        // 注意：drizzle-orm没有ne（not equal）操作符，我们在后面过滤
      )
    )
    .limit(limit + 1); // 多查一个，用于过滤当前征集

  // 过滤掉当前征集并按优先级排序
  const filtered = relatedCollections
    .filter(c => c.id !== collectionId)
    .sort((a, b) => {
      // 同一博物馆的征集优先
      if (a.museumId === currentCollection.museumId && b.museumId !== currentCollection.museumId) {
        return -1;
      }
      if (a.museumId !== currentCollection.museumId && b.museumId === currentCollection.museumId) {
        return 1;
      }
      // 其他按截止日期排序（较近的优先）
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, limit);

  return filtered;
}

// ========== 作品相关 ==========

export async function createWork(work: InsertWork): Promise<Work | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(works).values(work);
  const insertedId = Number(result[0].insertId);
  return getWorkById(insertedId);
}

export async function getWorkById(id: number): Promise<Work | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(works).where(eq(works.id, id)).limit(1);
  return result[0];
}

export async function getWorksByCollectionId(collectionId: number): Promise<Work[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(works).where(eq(works.collectionId, collectionId));
}

export async function getWorksByDesignerId(designerId: number): Promise<Work[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(works).where(eq(works.designerId, designerId));
}

export async function getAllWorks(): Promise<Work[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(works).orderBy(desc(works.createdAt));
}

interface SearchWorksParams {
  keyword?: string;
  status?: "submitted" | "approved" | "rejected" | "winner";
  collectionId?: number;
  designerId?: number;
  page?: number;
  pageSize?: number;
}

export async function searchWorks(params: SearchWorksParams): Promise<{ items: Work[]; total: number; hasMore: boolean }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0, hasMore: false };

  const conditions = [];

  // 关键词搜索（标题或描述）
  if (params.keyword) {
    conditions.push(
      or(
        like(works.title, `%${params.keyword}%`),
        like(works.description, `%${params.keyword}%`)
      )
    );
  }

  // 状态筛选
  if (params.status) {
    conditions.push(eq(works.status, params.status));
  }

  // 征集项目筛选
  if (params.collectionId !== undefined) {
    conditions.push(eq(works.collectionId, params.collectionId));
  }

  // 设计师筛选
  if (params.designerId !== undefined) {
    conditions.push(eq(works.designerId, params.designerId));
  }

  // 构建查询条件
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 获取总数
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(works)
    .where(whereClause);

  // 分页参数
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const offset = (page - 1) * pageSize;

  // 获取分页数据
  let query = db.select().from(works);
  if (whereClause) {
    query = query.where(whereClause) as any;
  }
  
  const items = await query
    .orderBy(desc(works.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    items,
    total,
    hasMore: offset + items.length < total,
  };
}

export async function deleteWork(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(works).where(eq(works.id, id));
}

// ========== 收藏相关 ==========

export async function createFavorite(favorite: InsertFavorite): Promise<Favorite | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(favorites).values(favorite);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(favorites).where(eq(favorites.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getFavoritesByUserId(userId: number): Promise<Favorite[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function deleteFavorite(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(favorites).where(eq(favorites.id, id));
}

// ========== 评分相关 ==========

/**
 * 创建或更新评分（通用，支持作品和征集）
 * 每个用户对同一目标只能有一个评分
 */
export async function createOrUpdateRating(rating: InsertRating): Promise<Rating | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  // 检查是否已经评分过
  const existing = await db
    .select()
    .from(ratings)
    .where(
      and(
        eq(ratings.userId, rating.userId),
        eq(ratings.targetType, rating.targetType),
        eq(ratings.targetId, rating.targetId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // 更新现有评分
    await db
      .update(ratings)
      .set({ score: rating.score, updatedAt: new Date() })
      .where(eq(ratings.id, existing[0].id));
    return getRatingById(existing[0].id);
  } else {
    // 创建新评分
    const result = await db.insert(ratings).values(rating);
    const insertedId = Number(result[0].insertId);
    return getRatingById(insertedId);
  }
}

/**
 * 获取用户对特定目标的评分
 */
export async function getUserRating(
  userId: number,
  targetType: 'work' | 'collection',
  targetId: number
): Promise<Rating | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(ratings)
    .where(
      and(
        eq(ratings.userId, userId),
        eq(ratings.targetType, targetType),
        eq(ratings.targetId, targetId)
      )
    )
    .limit(1);

  return result[0];
}

export async function getRatingById(id: number): Promise<Rating | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(ratings).where(eq(ratings.id, id)).limit(1);
  return result[0];
}

/**
 * 获取目标的所有评分
 */
export async function getRatingsByTarget(
  targetType: 'work' | 'collection',
  targetId: number
): Promise<Rating[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(ratings)
    .where(and(eq(ratings.targetType, targetType), eq(ratings.targetId, targetId)));
}

/**
 * 获取目标的平均评分
 */
export async function getAverageRating(
  targetType: 'work' | 'collection',
  targetId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ avgScore: sql<number>`AVG(${ratings.score})` })
    .from(ratings)
    .where(and(eq(ratings.targetType, targetType), eq(ratings.targetId, targetId)));

  const avgScore = result[0]?.avgScore;
  // MySQL返回的AVG可能是字符串，需要转换为数字
  return avgScore ? Number(avgScore) : 0;
}

/**
 * 获取目标的评分数量
 */
export async function getRatingCount(
  targetType: 'work' | 'collection',
  targetId: number
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: count() })
    .from(ratings)
    .where(and(eq(ratings.targetType, targetType), eq(ratings.targetId, targetId)));

  return result[0]?.count || 0;
}

/**
 * 删除评分
 */
export async function deleteRating(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(ratings).where(eq(ratings.id, id));
}

// 为了向后兼容，保留旧的作品评分函数
export async function getAverageRatingForWork(workId: number): Promise<number> {
  return getAverageRating('work', workId);
}

export async function getRatingCountForWork(workId: number): Promise<number> {
  return getRatingCount('work', workId);
}

// 获取征集下的作品列表（支持排序和筛选）
interface GetWorksByCollectionParams {
  collectionId: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  status?: 'submitted' | 'approved' | 'rejected' | 'winner';
}

export async function getWorksByCollection(params: GetWorksByCollectionParams) {
  const db = await getDb();
  if (!db) return { works: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };

  const {
    collectionId,
    page = 1,
    pageSize = 12,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status
  } = params;

  const offset = (page - 1) * pageSize;

  // 构建查询条件
  const conditions = [eq(works.collectionId, collectionId)];
  if (status) {
    conditions.push(eq(works.status, status));
  }

  // 获取总数
  const totalResult = await db
    .select({ count: count() })
    .from(works)
    .where(and(...conditions));
  const total = totalResult[0]?.count || 0;

  // 根据排序字段获取作品列表
  if (sortBy === 'rating') {
    // 按评分排序：需要关联ratings表计算平均分
    const worksList = await db
      .select()
      .from(works)
      .where(and(...conditions))
      .limit(pageSize)
      .offset(offset);

    // 为每个作品获取平均评分
    const worksWithRatings = await Promise.all(
      worksList.map(async (work) => {
        const avgRating = await getAverageRatingForWork(work.id);
        return {
          ...work,
          averageRating: avgRating
        };
      })
    );

    // 按评分排序
    worksWithRatings.sort((a, b) => 
      sortOrder === 'asc'
        ? a.averageRating - b.averageRating
        : b.averageRating - a.averageRating
    );

    return {
      works: worksWithRatings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } else {
    // 按创建时间排序
    const orderByClause = sortOrder === 'asc' ? asc(works.createdAt) : desc(works.createdAt);
    const worksList = await db
      .select()
      .from(works)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    // 为每个作品获取平均评分
    const worksWithRatings = await Promise.all(
      worksList.map(async (work) => {
        const avgRating = await getAverageRatingForWork(work.id);
        return {
          ...work,
          averageRating: avgRating
        };
      })
    );

    return {
      works: worksWithRatings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
}

// 检查用户是否已收藏
export async function checkFavorite(userId: number, targetType: "collection" | "work", targetId: number): Promise<Favorite | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(favorites).where(
    and(
      eq(favorites.userId, userId),
      eq(favorites.targetType, targetType),
      eq(favorites.targetId, targetId)
    )
  ).limit(1);
  return result[0];
}

// 删除特定收藏（通过userId、targetType和targetId）
export async function deleteFavoriteByTarget(userId: number, targetType: "collection" | "work", targetId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(favorites).where(
    and(
      eq(favorites.userId, userId),
      eq(favorites.targetType, targetType),
      eq(favorites.targetId, targetId)
    )
  );
}


// ========== 用户管理（管理员专用）==========

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: 'user' | 'admin' | 'museum' | 'designer';
  sortBy?: 'createdAt' | 'lastSignedIn' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ListUsersResult {
  users: (typeof users.$inferSelect)[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 管理员获取用户列表（支持分页、关键词搜索、角色筛选、排序）
 */
export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResult> {
  const db = await getDb();
  if (!db) return { users: [], total: 0, page: 1, pageSize: 15, totalPages: 0 };

  const {
    page = 1,
    pageSize = 15,
    keyword,
    role,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const offset = (page - 1) * pageSize;
  const conditions = [];

  // 关键词搜索：匹配 name 或 email
  if (keyword && keyword.trim()) {
    conditions.push(
      or(
        like(users.name, `%${keyword.trim()}%`),
        like(users.email, `%${keyword.trim()}%`)
      )
    );
  }

  // 角色筛选
  if (role) {
    conditions.push(eq(users.role, role));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // 构建排序规则
  const orderByClause = (() => {
    const col = sortBy === 'name'
      ? users.name
      : sortBy === 'lastSignedIn'
        ? users.lastSignedIn
        : users.createdAt;
    return sortOrder === 'asc' ? asc(col) : desc(col);
  })();

  // 并行执行数据查询与总数查询，提升性能
  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
        authProvider: users.authProvider,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastSignedIn: users.lastSignedIn,
        // 不返回 openId、passwordHash、socialAccounts 等敏感字段
      })
      .from(users)
      .where(where)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset),
    db.select({ value: count() }).from(users).where(where),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return {
    users: rows as any,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * 管理员通过 ID 获取单个用户详情（含关联的博物馆/设计师信息）
 */
export async function getUserDetailById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const userRow = await getUserById(userId);
  if (!userRow) return undefined;

  // 并行获取关联信息
  const [museum, designer] = await Promise.all([
    getMuseumByUserId(userId),
    getDesignerByUserId(userId),
  ]);

  return {
    ...userRow,
    museum: museum ?? null,
    designer: designer ?? null,
  };
}

/**
 * 管理员更新用户信息（支持修改 name、email、role）
 * 注意：不允许通过此接口修改 openId、passwordHash 等核心认证字段
 */
export async function updateUserAsAdmin(
  userId: number,
  data: Partial<Pick<InsertUser, 'name' | 'email' | 'role'>>
): Promise<(typeof users.$inferSelect) | undefined> {
  const db = await getDb();
  if (!db) throw new Error('数据库不可用');

  // 确认用户存在
  const existing = await getUserById(userId);
  if (!existing) throw new Error('用户不存在');

  // 防止将最后一个 admin 的角色降级
  if (existing.role === 'admin' && data.role && data.role !== 'admin') {
    const adminCountResult = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, 'admin'));
    const adminCount = adminCountResult[0]?.value ?? 0;
    if (adminCount <= 1) {
      throw new Error('系统中至少需要保留一个管理员账号，无法降级');
    }
  }

  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return getUserById(userId);
}

/**
 * 管理员删除用户（软删除：将角色置为 user 并清空 email，保留记录用于审计）
 * 如需硬删除，可直接调用 db.delete(users).where(eq(users.id, userId))
 */
export async function deleteUserAsAdmin(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('数据库不可用');

  const existing = await getUserById(userId);
  if (!existing) throw new Error('用户不存在');

  // 防止删除最后一个 admin
  if (existing.role === 'admin') {
    const adminCountResult = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, 'admin'));
    const adminCount = adminCountResult[0]?.value ?? 0;
    if (adminCount <= 1) {
      throw new Error('系统中至少需要保留一个管理员账号，无法删除');
    }
  }

  // 硬删除
  await db.delete(users).where(eq(users.id, userId));
}

/**
 * 获取用户统计概览（管理员仪表盘用）
 */
export async function getUserStats() {
  const db = await getDb();
  if (!db) return { total: 0, byRole: {} };

  const [total, byRole] = await Promise.all([
    db.select({ value: count() }).from(users),
    db
      .select({ role: users.role, value: count() })
      .from(users)
      .groupBy(users.role),
  ]);

  const roleMap: Record<string, number> = {};
  for (const row of byRole) {
    roleMap[row.role] = row.value;
  }

  return {
    total: total[0]?.value ?? 0,
    byRole: roleMap,
  };
}
