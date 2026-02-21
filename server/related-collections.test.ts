/**
 * 相关征集推荐功能测试
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('相关征集推荐功能', () => {
  let testMuseumId1: number;
  let testMuseumId2: number;
  let testCollectionId1: number;
  let testCollectionId2: number;
  let testCollectionId3: number;

  beforeAll(async () => {
    // 创建测试博物馆1
    const museum1 = await db.createMuseum({
      userId: 9001,
      name: '测试博物馆A',
      description: '用于测试推荐功能的博物馆A',
      address: '测试地址A',
      contactEmail: 'testA@museum.com',
      contactPhone: '1234567890',
    });
    testMuseumId1 = museum1!.id;

    // 创建测试博物馆2
    const museum2 = await db.createMuseum({
      userId: 9002,
      name: '测试博物馆B',
      description: '用于测试推荐功能的博物馆B',
      address: '测试地址B',
      contactEmail: 'testB@museum.com',
      contactPhone: '0987654321',
    });
    testMuseumId2 = museum2!.id;

    // 创建测试征集1（博物馆A，活跃状态）
    const collection1 = await db.createCollection({
      museumId: testMuseumId1,
      title: '测试征集项目1',
      artifactName: '测试文物1',
      description: '测试描述1',
      prizeAmount: 10000,
      deadline: new Date('2026-12-31'),
      status: 'active',
    });
    testCollectionId1 = collection1!.id;

    // 创建测试征集2（博物馆A，活跃状态）
    const collection2 = await db.createCollection({
      museumId: testMuseumId1,
      title: '测试征集项目2',
      artifactName: '测试文物2',
      description: '测试描述2',
      prizeAmount: 20000,
      deadline: new Date('2027-01-31'),
      status: 'active',
    });
    testCollectionId2 = collection2!.id;

    // 创建测试征集3（博物馆B，活跃状态）
    const collection3 = await db.createCollection({
      museumId: testMuseumId2,
      title: '测试征集项目3',
      artifactName: '测试文物3',
      description: '测试描述3',
      prizeAmount: 15000,
      deadline: new Date('2026-11-30'),
      status: 'active',
    });
    testCollectionId3 = collection3!.id;
  });

  it('应该返回相关征集推荐', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    
    const related = await caller.collection.getRelated({
      collectionId: testCollectionId1,
      limit: 6,
    });

    expect(related).toBeDefined();
    expect(Array.isArray(related)).toBe(true);
  });

  it('推荐结果不应包含当前征集', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    
    const related = await caller.collection.getRelated({
      collectionId: testCollectionId1,
      limit: 6,
    });

    const containsCurrent = related.some(c => c.id === testCollectionId1);
    expect(containsCurrent).toBe(false);
  });

  it('应该优先推荐同一博物馆的征集', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    
    const related = await caller.collection.getRelated({
      collectionId: testCollectionId1,
      limit: 6,
    });

    if (related.length > 0) {
      // 第一个推荐应该是同一博物馆的征集（如果存在）
      const firstRelated = related[0];
      const currentCollection = await db.getCollectionById(testCollectionId1);
      
      // 如果有同一博物馆的其他征集，第一个推荐应该来自同一博物馆
      const sameMuseumCollections = related.filter(c => c.museumId === currentCollection?.museumId);
      if (sameMuseumCollections.length > 0) {
        expect(firstRelated.museumId).toBe(currentCollection?.museumId);
      }
    }
  });

  it('应该只返回活跃状态的征集', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    
    const related = await caller.collection.getRelated({
      collectionId: testCollectionId1,
      limit: 6,
    });

    const allActive = related.every(c => c.status === 'active');
    expect(allActive).toBe(true);
  });

  it('应该尊重limit参数', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    
    const related = await caller.collection.getRelated({
      collectionId: testCollectionId1,
      limit: 2,
    });

    expect(related.length).toBeLessThanOrEqual(2);
  });

  it('不存在的征集ID应该返回空数组', async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    
    const related = await caller.collection.getRelated({
      collectionId: 999999,
      limit: 6,
    });

    expect(related).toEqual([]);
  });
});
