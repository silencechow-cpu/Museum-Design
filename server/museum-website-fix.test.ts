/**
 * 博物馆website字段验证bug修复测试
 */

import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';
import { users } from '../drizzle/schema';

describe('博物馆website字段验证修复', () => {
  it('应该允许创建博物馆时website字段为空字符串', async () => {
    const testUserId = 8888;
    const testOpenId = `test-website-fix-${Date.now()}`;

    // 创建测试用户
    const dbInstance = await db.getDb();
    if (dbInstance) {
      await dbInstance.insert(users).values({
        id: testUserId,
        openId: testOpenId,
        name: 'Test User',
        email: 'test@example.com',
      });
    }

    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: testOpenId, name: 'Test User', email: 'test@example.com', role: 'user' },
    } as any);

    // 测试创建博物馆，website为空字符串
    const museum = await caller.museum.create({
      name: '测试博物馆',
      description: '测试描述',
      address: '测试地址',
      contactEmail: 'museum@test.com',
      contactPhone: '1234567890',
      website: '', // 空字符串应该被接受
    });

    expect(museum).toBeDefined();
    expect(museum?.name).toBe('测试博物馆');
  });

  it('应该允许创建博物馆时不提供website字段', async () => {
    const testUserId = 8889;
    const testOpenId = `test-website-optional-${Date.now()}`;

    // 创建测试用户
    const dbInstance = await db.getDb();
    if (dbInstance) {
      await dbInstance.insert(users).values({
        id: testUserId,
        openId: testOpenId,
        name: 'Test User 2',
        email: 'test2@example.com',
      });
    }

    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: testOpenId, name: 'Test User 2', email: 'test2@example.com', role: 'user' },
    } as any);

    // 测试创建博物馆，不提供website字段
    const museum = await caller.museum.create({
      name: '测试博物馆2',
      description: '测试描述2',
      address: '测试地址2',
      contactEmail: 'museum2@test.com',
      contactPhone: '0987654321',
      // website字段不提供
    });

    expect(museum).toBeDefined();
    expect(museum?.name).toBe('测试博物馆2');
  });

  it('应该允许创建博物馆时website字段为有效URL', async () => {
    const testUserId = 8890;
    const testOpenId = `test-website-valid-${Date.now()}`;

    // 创建测试用户
    const dbInstance = await db.getDb();
    if (dbInstance) {
      await dbInstance.insert(users).values({
        id: testUserId,
        openId: testOpenId,
        name: 'Test User 3',
        email: 'test3@example.com',
      });
    }

    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: testOpenId, name: 'Test User 3', email: 'test3@example.com', role: 'user' },
    } as any);

    // 测试创建博物馆，website为有效URL
    const museum = await caller.museum.create({
      name: '测试博物馆3',
      description: '测试描述3',
      address: '测试地址3',
      contactEmail: 'museum3@test.com',
      contactPhone: '1122334455',
      website: 'https://example.com',
    });

    expect(museum).toBeDefined();
    expect(museum?.name).toBe('测试博物馆3');
    expect(museum?.website).toBe('https://example.com');
  });

  it('应该拒绝创建博物馆时website字段为无效URL', async () => {
    const testUserId = 8891;
    const testOpenId = `test-website-invalid-${Date.now()}`;

    // 创建测试用户
    const dbInstance = await db.getDb();
    if (dbInstance) {
      await dbInstance.insert(users).values({
        id: testUserId,
        openId: testOpenId,
        name: 'Test User 4',
        email: 'test4@example.com',
      });
    }

    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: testOpenId, name: 'Test User 4', email: 'test4@example.com', role: 'user' },
    } as any);

    // 测试创建博物馆，website为无效URL
    await expect(
      caller.museum.create({
        name: '测试博物馆4',
        description: '测试描述4',
        address: '测试地址4',
        contactEmail: 'museum4@test.com',
        contactPhone: '5566778899',
        website: 'not-a-valid-url',
      })
    ).rejects.toThrow();
  });
});
