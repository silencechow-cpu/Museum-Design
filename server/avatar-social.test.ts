import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Avatar and Social Account Features', () => {
  const testUserId = 88888;
  const testOpenId = `test-avatar-social-${Date.now()}`;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // 创建测试用户
    await db.insert(users).values({
      id: testUserId,
      openId: testOpenId,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });
  });

  it('should upload avatar successfully', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: testOpenId, name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    // 创建一个简单的base64图片数据
    const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

    const result = await caller.auth.uploadAvatar({ imageData: base64Image });

    expect(result).toHaveProperty('avatarUrl');
    expect(result.avatarUrl).toContain('avatars/');
  });

  it('should bind social account successfully', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: testOpenId, name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.auth.bindSocialAccount({
      platform: 'wechat',
      accountId: 'wechat123',
      accountName: '测试微信',
    });

    expect(result.success).toBe(true);

    // 验证数据库中的数据
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(user[0].socialAccounts).toBeTruthy();
    
    const socialAccounts = JSON.parse(user[0].socialAccounts!);
    expect(socialAccounts).toHaveLength(1);
    expect(socialAccounts[0].platform).toBe('wechat');
    expect(socialAccounts[0].accountId).toBe('wechat123');
  });

  it('should unbind social account successfully', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: testOpenId, name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.auth.unbindSocialAccount({
      platform: 'wechat',
    });

    expect(result.success).toBe(true);

    // 验证数据库中的数据
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    const socialAccounts = user[0].socialAccounts ? JSON.parse(user[0].socialAccounts) : [];
    expect(socialAccounts).toHaveLength(0);
  });

  it('should update existing social account binding', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: testOpenId, name: 'Test User', email: 'test@example.com', role: 'user' },
      req: {} as any,
      res: {} as any,
    });

    // 首次绑定
    await caller.auth.bindSocialAccount({
      platform: 'weibo',
      accountId: 'weibo123',
      accountName: '测试微博',
    });

    // 更新绑定
    await caller.auth.bindSocialAccount({
      platform: 'weibo',
      accountId: 'weibo456',
      accountName: '新测试微博',
    });

    // 验证数据库中的数据
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    const socialAccounts = JSON.parse(user[0].socialAccounts!);
    
    expect(socialAccounts).toHaveLength(1);
    expect(socialAccounts[0].accountId).toBe('weibo456');
    expect(socialAccounts[0].accountName).toBe('新测试微博');
  });
});
