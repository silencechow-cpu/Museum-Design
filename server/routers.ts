import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { museumRouter } from "./routers/museum";
import { designerRouter } from "./routers/designer";
import { collectionRouter } from "./routers/collection";
import { workRouter } from "./routers/work";
import { favoriteRouter } from "./routers/favorite";
import { statsRouter } from "./routers/stats";
import { ratingRouter } from "./routers/rating";
import { uploadRouter } from "./routers/upload";
import { reviewRouter } from "./routers/review";
import { getMuseumByUserId, getDesignerByUserId, updateUserAvatar, updateUserSocialAccounts, getUserById, getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    checkOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const museum = await getMuseumByUserId(userId);
      const designer = await getDesignerByUserId(userId);
      
      return {
        needsOnboarding: !museum && !designer,
        userType: museum ? 'museum' as const : designer ? 'designer' as const : null,
      };
    }),
    uploadAvatar: protectedProcedure
      .input(z.object({
        imageData: z.string(), // base64 encoded image
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        
        // 将base64转换为Buffer
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // 生成唯一文件名
        const fileName = `avatars/${userId}-${Date.now()}.jpg`;
        
        // 上传到S3
        const { url } = await storagePut(fileName, buffer, 'image/jpeg');
        
        // 更新数据库中的头像URL
        await updateUserAvatar(userId, url);
        
        return { avatarUrl: url };
      }),
    bindSocialAccount: protectedProcedure
      .input(z.object({
        platform: z.enum(['wechat', 'weibo', 'qq']),
        accountId: z.string(),
        accountName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const user = await getUserById(userId);
        
        if (!user) {
          throw new Error('用户不存在');
        }
        
        // 解析现有的社交账号
        let socialAccounts: Array<{ platform: string; accountId: string; accountName: string }> = [];
        if (user.socialAccounts) {
          try {
            socialAccounts = JSON.parse(user.socialAccounts);
          } catch (e) {
            socialAccounts = [];
          }
        }
        
        // 检查是否已经绑定
        const existingIndex = socialAccounts.findIndex(acc => acc.platform === input.platform);
        if (existingIndex >= 0) {
          // 更新现有绑定
          socialAccounts[existingIndex] = {
            platform: input.platform,
            accountId: input.accountId,
            accountName: input.accountName,
          };
        } else {
          // 添加新绑定
          socialAccounts.push({
            platform: input.platform,
            accountId: input.accountId,
            accountName: input.accountName,
          });
        }
        
        // 保存到数据库
        await updateUserSocialAccounts(userId, JSON.stringify(socialAccounts));
        
        return { success: true };
      }),
    unbindSocialAccount: protectedProcedure
      .input(z.object({
        platform: z.enum(['wechat', 'weibo', 'qq']),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const user = await getUserById(userId);
        
        if (!user) {
          throw new Error('用户不存在');
        }
        
        // 解析现有的社交账号
        let socialAccounts: Array<{ platform: string; accountId: string; accountName: string }> = [];
        if (user.socialAccounts) {
          try {
            socialAccounts = JSON.parse(user.socialAccounts);
          } catch (e) {
            socialAccounts = [];
          }
        }
        
        // 移除指定平台的绑定
        socialAccounts = socialAccounts.filter(acc => acc.platform !== input.platform);
        
        // 保存到数据库
        await updateUserSocialAccounts(userId, JSON.stringify(socialAccounts));
        
        return { success: true };
      }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Invalid email format").optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const user = await getUserById(userId);
        
        if (!user) {
          throw new Error('用户不存在');
        }
        
        // 更新用户信息
        const db = await getDb();
        if (!db) {
          throw new Error('数据库不可用');
        }
        
        await db.update(users).set({
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
          updatedAt: new Date(),
        }).where(eq(users.id, userId));
        
        return { success: true };
      }),
  }),

  museum: museumRouter,
  designer: designerRouter,
  collection: collectionRouter,
  work: workRouter,
  favorite: favoriteRouter,
  stats: statsRouter,
  rating: ratingRouter,
  upload: uploadRouter,
  review: reviewRouter,
});

export type AppRouter = typeof appRouter;
