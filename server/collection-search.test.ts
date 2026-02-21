import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { users, museums, collections } from '../drizzle/schema';

describe('征集项目搜索和筛选功能测试', () => {
  const testUserId = 99999;
  const testOpenId = `test-search-${Date.now()}`;
  let testMuseumId: number;
  let testCollectionId1: number;
  let testCollectionId2: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // 创建测试用户
    await db.insert(users).values({
      id: testUserId,
      openId: testOpenId,
      name: 'Test Museum User',
      email: 'museum@test.com',
      role: 'museum',
    });

    // 创建测试博物馆
    const museumResult = await db.insert(museums).values({
      userId: testUserId,
      name: '测试博物馆',
      description: '这是一个测试博物馆',
      address: '测试地址',
      contactEmail: 'test@museum.com',
    });
    testMuseumId = Number(museumResult[0].insertId);

    // 创建测试征集项目1
    const collection1Result = await db.insert(collections).values({
      museumId: testMuseumId,
      title: '青花瓷设计征集',
      description: '征集青花瓷相关的现代设计作品',
      artifactName: '明代青花瓷',
      artifactDescription: '珍贵的明代青花瓷器',
      prizeAmount: 50000,
      deadline: new Date('2026-06-30'),
      status: 'active',
    });
    testCollectionId1 = Number(collection1Result[0].insertId);

    // 创建测试征集项目2
    const collection2Result = await db.insert(collections).values({
      museumId: testMuseumId,
      title: '青铜器纹样设计',
      description: '征集青铜器纹样在现代产品中的应用',
      artifactName: '商代青铜爵',
      artifactDescription: '古老的青铜器',
      prizeAmount: 30000,
      deadline: new Date('2026-05-31'),
      status: 'active',
    });
    testCollectionId2 = Number(collection2Result[0].insertId);
  });

  it('应该能够根据关键词搜索征集项目', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collection.search({
      keyword: '青花瓷',
      status: 'active',
    });

    expect(result.length).toBeGreaterThan(0);
    const found = result.find(c => c.id === testCollectionId1);
    expect(found).toBeTruthy();
    expect(found?.title).toContain('青花瓷');
  });

  it('应该能够根据博物馆ID筛选征集项目', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collection.search({
      museumId: testMuseumId,
      status: 'active',
    });

    expect(result.length).toBeGreaterThanOrEqual(2);
    result.forEach(collection => {
      expect(collection.museumId).toBe(testMuseumId);
    });
  });

  it('应该能够根据奖金范围筛选征集项目', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collection.search({
      minPrize: 40000,
      maxPrize: 60000,
      status: 'active',
    });

    expect(result.length).toBeGreaterThan(0);
    result.forEach(collection => {
      expect(collection.prizeAmount).toBeGreaterThanOrEqual(40000);
      expect(collection.prizeAmount).toBeLessThanOrEqual(60000);
    });
  });

  it('应该能够根据截止日期筛选征集项目', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collection.search({
      deadlineStart: new Date('2026-05-01'),
      deadlineEnd: new Date('2026-06-01'),
      status: 'active',
    });

    expect(result.length).toBeGreaterThan(0);
    const found = result.find(c => c.id === testCollectionId2);
    expect(found).toBeTruthy();
  });

  it('应该能够组合多个筛选条件', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collection.search({
      keyword: '青',
      museumId: testMuseumId,
      minPrize: 25000,
      status: 'active',
    });

    expect(result.length).toBeGreaterThan(0);
    result.forEach(collection => {
      expect(collection.museumId).toBe(testMuseumId);
      expect(collection.prizeAmount).toBeGreaterThanOrEqual(25000);
    });
  });

  it('没有匹配条件时应该返回空数组', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.collection.search({
      keyword: '不存在的关键词xyz123',
      status: 'active',
    });

    expect(result).toEqual([]);
  });
});
