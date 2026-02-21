import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { users, museums, designers, collections, works } from '../drizzle/schema';

describe('博物馆和设计师详情页面功能测试', () => {
  const testUserId1 = 77777;
  const testUserId2 = 77778;
  const testOpenId1 = `test-museum-detail-${Date.now()}`;
  const testOpenId2 = `test-designer-detail-${Date.now()}`;
  let testMuseumId: number;
  let testDesignerId: number;
  let testCollectionId: number;
  let testWorkId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // 创建测试博物馆用户
    await db.insert(users).values({
      id: testUserId1,
      openId: testOpenId1,
      name: 'Test Museum User',
      email: 'museum@test.com',
      role: 'museum',
    });

    // 创建测试设计师用户
    await db.insert(users).values({
      id: testUserId2,
      openId: testOpenId2,
      name: 'Test Designer User',
      email: 'designer@test.com',
      role: 'designer',
    });

    // 创建测试博物馆
    const museumResult = await db.insert(museums).values({
      userId: testUserId1,
      name: '测试博物馆',
      description: '这是一个测试博物馆的详细描述',
      address: '北京市朝阳区测试路123号',
      contactEmail: 'contact@testmuseum.com',
      contactPhone: '010-12345678',
      website: 'https://testmuseum.com',
    });
    testMuseumId = Number(museumResult[0].insertId);

    // 创建测试设计师
    const designerResult = await db.insert(designers).values({
      userId: testUserId2,
      displayName: '测试设计师',
      bio: '专注于文创产品设计的资深设计师',
      type: 'individual',
      organization: '某设计学院',
      portfolio: 'https://portfolio.example.com',
      skills: JSON.stringify(['平面设计', '产品设计', '3D建模']),
    });
    testDesignerId = Number(designerResult[0].insertId);

    // 创建测试征集项目
    const collectionResult = await db.insert(collections).values({
      museumId: testMuseumId,
      title: '青花瓷设计征集',
      description: '征集青花瓷相关的现代设计作品',
      artifactName: '明代青花瓷',
      artifactDescription: '珍贵的明代青花瓷器',
      prizeAmount: 50000,
      deadline: new Date('2026-06-30'),
      status: 'active',
    });
    testCollectionId = Number(collectionResult[0].insertId);

    // 创建测试作品
    const workResult = await db.insert(works).values({
      collectionId: testCollectionId,
      designerId: testDesignerId,
      title: '青花瓷茶具设计',
      description: '融合传统青花瓷元素的现代茶具设计',
      images: JSON.stringify(['https://example.com/work1.jpg']),
      tags: JSON.stringify(['茶具', '青花瓷', '现代设计']),
      status: 'approved',
    });
    testWorkId = Number(workResult[0].insertId);
  });

  it('应该能够获取博物馆详细信息', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const museum = await caller.museum.getById({ id: testMuseumId });

    expect(museum).toBeTruthy();
    expect(museum?.name).toBe('测试博物馆');
    expect(museum?.description).toBe('这是一个测试博物馆的详细描述');
    expect(museum?.address).toBe('北京市朝阳区测试路123号');
    expect(museum?.contactEmail).toBe('contact@testmuseum.com');
    expect(museum?.contactPhone).toBe('010-12345678');
    expect(museum?.website).toBe('https://testmuseum.com');
  });

  it('应该能够获取博物馆的历史征集项目', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const collections = await caller.collection.search({ museumId: testMuseumId });

    expect(collections.length).toBeGreaterThan(0);
    const found = collections.find(c => c.id === testCollectionId);
    expect(found).toBeTruthy();
    expect(found?.artifactName).toBe('明代青花瓷');
  });

  it('应该能够获取设计师详细信息', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const designer = await caller.designer.getById({ id: testDesignerId });

    expect(designer).toBeTruthy();
    expect(designer?.displayName).toBe('测试设计师');
    expect(designer?.bio).toBe('专注于文创产品设计的资深设计师');
    expect(designer?.organization).toBe('某设计学院');
    expect(designer?.portfolio).toBe('https://portfolio.example.com');
    expect(designer?.skills).toBeTruthy();
    if (designer?.skills) {
      const skills = JSON.parse(designer.skills);
      expect(skills).toContain('平面设计');
      expect(skills).toContain('产品设计');
    }
  });

  it('应该能够获取设计师的历史作品', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const works = await caller.work.getByDesignerId({ designerId: testDesignerId });

    expect(works.length).toBeGreaterThan(0);
    const found = works.find(w => w.id === testWorkId);
    expect(found).toBeTruthy();
    expect(found?.title).toBe('青花瓷茶具设计');
    expect(found?.status).toBe('approved');
  });

  it('不存在的博物馆应该返回null', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const museum = await caller.museum.getById({ id: 999999 });
    expect(museum).toBeFalsy();
  });

  it('不存在的设计师应该返回null', async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      req: {} as any,
      res: {} as any,
    });

    const designer = await caller.designer.getById({ id: 999999 });
    expect(designer).toBeFalsy();
  });
});
