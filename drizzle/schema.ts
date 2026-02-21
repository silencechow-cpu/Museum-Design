import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Password hash for email/password authentication (bcrypt) */
  passwordHash: varchar("passwordHash", { length: 255 }),
  /** Authentication provider: manus, email, wechat, qq */
  authProvider: mysqlEnum("authProvider", ["manus", "email", "wechat", "qq"]).default("manus").notNull(),
  /** Email verification status */
  emailVerified: int("emailVerified").default(0).notNull(), // 0=未验证, 1=已验证
  avatar: text("avatar"), // 用户头像 URL
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "museum", "designer"]).default("user").notNull(),
  socialAccounts: text("socialAccounts"), // JSON字符串，存储社交媒体账号绑定信息
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 博物馆信息表
export const museums = mysqlTable("museums", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 关联到users表
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  logo: text("logo"),
  coverImage: text("coverImage"),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  website: text("website"),
  verified: int("verified").default(0).notNull(), // 0=未认证, 1=已认证
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Museum = typeof museums.$inferSelect;
export type InsertMuseum = typeof museums.$inferInsert;

// 设计师信息表
export const designers = mysqlTable("designers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 关联到users表
  displayName: text("displayName").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  type: mysqlEnum("type", ["individual", "team", "school"]).default("individual").notNull(),
  organization: text("organization"), // 所属高校或机构
  portfolio: text("portfolio"), // 作品集链接
  skills: text("skills"), // 技能标签，以JSON存储
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Designer = typeof designers.$inferSelect;
export type InsertDesigner = typeof designers.$inferInsert;

// 征集项目表
export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  museumId: int("museumId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  artifactName: text("artifactName").notNull(), // 文物名称
  artifactDescription: text("artifactDescription"), // 文物说明
  images: text("images"), // 图片URL列表，以JSON存储
  requirements: text("requirements"), // 征集要求
  prize: text("prize"), // 奖金信息
  prizeAmount: int("prizeAmount").default(0), // 奖金金额（用于排序）
  deadline: timestamp("deadline").notNull(), // 截止日期
  status: mysqlEnum("status", ["draft", "active", "closed", "completed"]).default("draft").notNull(),
  downloadUrl: text("downloadUrl"), // 资料下载链接
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

// 为征集表添加平均评分字段（通过计算得出，不存储在数据库）
export type CollectionWithRating = Collection & {
  averageRating?: number;
  ratingCount?: number;
};

// 作品表
export const works = mysqlTable("works", {
  id: int("id").autoincrement().primaryKey(),
  collectionId: int("collectionId").notNull(),
  designerId: int("designerId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  images: text("images"), // 图片URL列表，以JSON存储
  tags: text("tags"), // 标签，以JSON存储
  status: mysqlEnum("status", ["submitted", "approved", "rejected", "winner"]).default("submitted").notNull(),
  viewCount: int("viewCount").default(0),
  likeCount: int("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Work = typeof works.$inferSelect;
export type InsertWork = typeof works.$inferInsert;

// 为作品表添加平均评分字段（通过计算得出，不存储在数据库）
export type WorkWithRating = Work & {
  averageRating?: number;
  ratingCount?: number;
};

// 收藏表
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetType: mysqlEnum("targetType", ["collection", "work"]).notNull(),
  targetId: int("targetId").notNull(), // 关联到collections或works
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

// 评分表（用户对作品或征集的评分）
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 评分的用户ID
  targetType: mysqlEnum("targetType", ["work", "collection"]).notNull(), // 评分目标类型
  targetId: int("targetId").notNull(), // 关联到works或collections表
  score: int("score").notNull(), // 评分（1-5星）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

// 审核记录表（管理员对作品的审核评论）
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  workId: int("workId").notNull(), // 关联到works表
  reviewerId: int("reviewerId").notNull(), // 审核人用户ID（必须是admin或museum）
  action: mysqlEnum("action", ["approve", "reject", "comment"]).notNull(), // 审核操作
  comment: text("comment"), // 审核评论
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;