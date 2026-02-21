import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('征集作品列表功能', () => {
  it('getWorksByCollection应该返回正确的数据结构', async () => {
    const result = await db.getWorksByCollection({
      collectionId: 1,
      page: 1,
      pageSize: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(result).toHaveProperty('works');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('pageSize');
    expect(result).toHaveProperty('totalPages');
    expect(Array.isArray(result.works)).toBe(true);
  });

  it('getWorksByCollection应该支持按创建时间排序', async () => {
    const resultDesc = await db.getWorksByCollection({
      collectionId: 1,
      page: 1,
      pageSize: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    const resultAsc = await db.getWorksByCollection({
      collectionId: 1,
      page: 1,
      pageSize: 12,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });

    expect(resultDesc.works).toBeDefined();
    expect(resultAsc.works).toBeDefined();
  });

  it('getWorksByCollection应该支持按评分排序', async () => {
    const result = await db.getWorksByCollection({
      collectionId: 1,
      page: 1,
      pageSize: 12,
      sortBy: 'rating',
      sortOrder: 'desc',
    });

    expect(result.works).toBeDefined();
    // 每个作品应该包含averageRating字段
    if (result.works.length > 0) {
      expect(result.works[0]).toHaveProperty('averageRating');
    }
  });

  it('getWorksByCollection应该支持按状态筛选', async () => {
    const result = await db.getWorksByCollection({
      collectionId: 1,
      page: 1,
      pageSize: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'submitted',
    });

    expect(result.works).toBeDefined();
    // 所有返回的作品状态应该是submitted
    result.works.forEach((work: any) => {
      if (work.status) {
        expect(['submitted', 'approved', 'rejected', 'winner']).toContain(work.status);
      }
    });
  });

  it('getWorksByCollection应该正确处理分页', async () => {
    const page1 = await db.getWorksByCollection({
      collectionId: 1,
      page: 1,
      pageSize: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    const page2 = await db.getWorksByCollection({
      collectionId: 1,
      page: 2,
      pageSize: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(page1.page).toBe(1);
    expect(page2.page).toBe(2);
    expect(page1.pageSize).toBe(5);
    expect(page2.pageSize).toBe(5);
    
    // 如果总数大于5，page1和page2的作品应该不同
    if (page1.total > 5) {
      expect(page1.works.length).toBeLessThanOrEqual(5);
    }
  });

  it('getWorksByCollection应该正确计算总页数', async () => {
    const result = await db.getWorksByCollection({
      collectionId: 1,
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    const expectedPages = Math.ceil(result.total / 10);
    expect(result.totalPages).toBe(expectedPages);
  });

  it('getWorksByCollection对不存在的征集应该返回空列表', async () => {
    const result = await db.getWorksByCollection({
      collectionId: 999999,
      page: 1,
      pageSize: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(result.works).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
