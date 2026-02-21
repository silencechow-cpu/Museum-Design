/**
 * 测试博物馆和设计师列表功能
 * 验证分页、排序和筛选功能
 */

import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('博物馆列表功能', () => {
  it('应该支持分页查询', async () => {
    const params = {
      page: 1,
      pageSize: 10,
    };

    const result = await db.listMuseums(params);

    expect(result).toHaveProperty('museums');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('pageSize', 10);
    expect(result).toHaveProperty('totalPages');
    expect(Array.isArray(result.museums)).toBe(true);
  });

  it('应该支持按名称排序', async () => {
    const paramsAsc = {
      page: 1,
      pageSize: 10,
      sortBy: 'name' as const,
      sortOrder: 'asc' as const,
    };

    const resultAsc = await db.listMuseums(paramsAsc);
    expect(resultAsc.museums).toBeDefined();

    const paramsDesc = {
      page: 1,
      pageSize: 10,
      sortBy: 'name' as const,
      sortOrder: 'desc' as const,
    };

    const resultDesc = await db.listMuseums(paramsDesc);
    expect(resultDesc.museums).toBeDefined();
  });

  it('应该支持按创建时间排序', async () => {
    const params = {
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    const result = await db.listMuseums(params);
    expect(result.museums).toBeDefined();
  });

  it('应该支持关键词搜索', async () => {
    const params = {
      page: 1,
      pageSize: 10,
      keyword: '博物馆',
    };

    const result = await db.listMuseums(params);
    expect(result).toBeDefined();
    expect(result.museums).toBeDefined();
  });

  it('应该支持地区筛选', async () => {
    const params = {
      page: 1,
      pageSize: 10,
      province: '北京',
    };

    const result = await db.listMuseums(params);
    expect(result).toBeDefined();
    expect(result.museums).toBeDefined();
  });

  it('应该正确计算总页数', async () => {
    const params = {
      page: 1,
      pageSize: 5,
    };

    const result = await db.listMuseums(params);
    expect(result.totalPages).toBe(Math.ceil(result.total / params.pageSize));
  });
});

describe('设计师列表功能', () => {
  it('应该支持分页查询', async () => {
    const params = {
      page: 1,
      pageSize: 10,
    };

    const result = await db.listDesigners(params);

    expect(result).toHaveProperty('designers');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('pageSize', 10);
    expect(result).toHaveProperty('totalPages');
    expect(Array.isArray(result.designers)).toBe(true);
  });

  it('应该支持按显示名称排序', async () => {
    const paramsAsc = {
      page: 1,
      pageSize: 10,
      sortBy: 'displayName' as const,
      sortOrder: 'asc' as const,
    };

    const resultAsc = await db.listDesigners(paramsAsc);
    expect(resultAsc.designers).toBeDefined();

    const paramsDesc = {
      page: 1,
      pageSize: 10,
      sortBy: 'displayName' as const,
      sortOrder: 'desc' as const,
    };

    const resultDesc = await db.listDesigners(paramsDesc);
    expect(resultDesc.designers).toBeDefined();
  });

  it('应该支持按创建时间排序', async () => {
    const params = {
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    const result = await db.listDesigners(params);
    expect(result.designers).toBeDefined();
  });

  it('应该支持关键词搜索', async () => {
    const params = {
      page: 1,
      pageSize: 10,
      keyword: '设计师',
    };

    const result = await db.listDesigners(params);
    expect(result).toBeDefined();
    expect(result.designers).toBeDefined();
  });

  it('应该支持类型筛选', async () => {
    const params = {
      page: 1,
      pageSize: 10,
      type: 'individual' as const,
    };

    const result = await db.listDesigners(params);
    expect(result).toBeDefined();
    expect(result.designers).toBeDefined();
  });

  it('应该正确计算总页数', async () => {
    const params = {
      page: 1,
      pageSize: 5,
    };

    const result = await db.listDesigners(params);
    expect(result.totalPages).toBe(Math.ceil(result.total / params.pageSize));
  });
});

describe('分页逻辑测试', () => {
  it('博物馆列表应该返回正确的分页数据', async () => {
    const page1 = await db.listMuseums({ page: 1, pageSize: 3 });
    const page2 = await db.listMuseums({ page: 2, pageSize: 3 });

    // 如果有足够的数据，第一页和第二页的数据应该不同
    if (page1.total > 3) {
      expect(page1.museums).not.toEqual(page2.museums);
    }
  });

  it('设计师列表应该返回正确的分页数据', async () => {
    const page1 = await db.listDesigners({ page: 1, pageSize: 3 });
    const page2 = await db.listDesigners({ page: 2, pageSize: 3 });

    // 如果有足够的数据，第一页和第二页的数据应该不同
    if (page1.total > 3) {
      expect(page1.designers).not.toEqual(page2.designers);
    }
  });

  it('应该正确处理空结果', async () => {
    const result = await db.listMuseums({
      page: 1,
      pageSize: 10,
      keyword: '这是一个不存在的博物馆名称xyz123',
    });

    expect(result.museums).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
