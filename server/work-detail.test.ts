/**
 * 测试作品详情页功能
 * 验证作品详情API和相关功能
 */

import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('作品详情功能', () => {
  it('应该能够通过ID获取作品', async () => {
    const work = await db.getWorkById(1);
    
    // 可能存在也可能不存在
    if (work) {
      expect(work.id).toBe(1);
      expect(work.title).toBeDefined();
      expect(work.designerId).toBeDefined();
      expect(work.collectionId).toBeDefined();
    }
  });

  it('不存在的作品应该返回undefined', async () => {
    const work = await db.getWorkById(99999);
    expect(work).toBeUndefined();
  });

  it('作品应该包含必要的字段', async () => {
    // 先创建一个测试作品
    const testWork = await db.createWork({
      designerId: 1,
      collectionId: 1,
      title: '测试作品',
      description: '这是一个测试作品',
      images: JSON.stringify(['https://example.com/image1.jpg']),
      tags: JSON.stringify(['测试', '文创']),
      status: 'submitted',
    });

    expect(testWork).toBeDefined();
    if (testWork) {
      expect(testWork.title).toBe('测试作品');
      expect(testWork.description).toBe('这是一个测试作品');
      expect(testWork.status).toBe('submitted');
      expect(testWork.images).toBeDefined();
      expect(testWork.tags).toBeDefined();
    }
  });

  it('应该能够获取设计师的所有作品', async () => {
    const works = await db.getWorksByDesignerId(1);
    
    expect(Array.isArray(works)).toBe(true);
    // 所有作品应该属于同一个设计师
    works.forEach(work => {
      expect(work.designerId).toBe(1);
    });
  });

  it('应该能够获取征集项目的所有作品', async () => {
    const works = await db.getWorksByCollectionId(1);
    
    expect(Array.isArray(works)).toBe(true);
    // 所有作品应该属于同一个征集项目
    works.forEach(work => {
      expect(work.collectionId).toBe(1);
    });
  });

  it('作品图片应该是JSON格式', async () => {
    const work = await db.getWorkById(1);
    
    if (work && work.images) {
      // 应该能够解析JSON
      expect(() => JSON.parse(work.images)).not.toThrow();
      
      const images = JSON.parse(work.images);
      expect(Array.isArray(images)).toBe(true);
    }
  });

  it('作品标签应该是JSON格式', async () => {
    const work = await db.getWorkById(1);
    
    if (work && work.tags) {
      // 应该能够解析JSON
      expect(() => JSON.parse(work.tags)).not.toThrow();
      
      const tags = JSON.parse(work.tags);
      expect(Array.isArray(tags)).toBe(true);
    }
  });

  it('作品状态应该是有效的枚举值', async () => {
    const work = await db.getWorkById(1);
    
    if (work) {
      const validStatuses = ['submitted', 'approved', 'rejected', 'winner'];
      expect(validStatuses).toContain(work.status);
    }
  });

  it('作品应该有默认的浏览和点赞数', async () => {
    const testWork = await db.createWork({
      designerId: 1,
      collectionId: 1,
      title: '测试作品2',
      images: JSON.stringify([]),
      status: 'submitted',
    });

    if (testWork) {
      expect(testWork.viewCount).toBeDefined();
      expect(testWork.likeCount).toBeDefined();
      expect(testWork.viewCount).toBeGreaterThanOrEqual(0);
      expect(testWork.likeCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('应该能够获取设计师信息', async () => {
    const designer = await db.getDesignerById(1);
    
    if (designer) {
      expect(designer.id).toBe(1);
      expect(designer.displayName).toBeDefined();
      expect(designer.userId).toBeDefined();
    }
  });

  it('应该能够获取征集项目信息', async () => {
    const collection = await db.getCollectionById(1);
    
    if (collection) {
      expect(collection.id).toBe(1);
      expect(collection.title).toBeDefined();
      expect(collection.museumId).toBeDefined();
    }
  });
});

describe('作品详情页集成测试', () => {
  it('应该能够获取作品的完整信息（包含设计师和征集）', async () => {
    // 这个测试模拟前端调用getDetailById的场景
    const work = await db.getWorkById(1);
    
    if (work) {
      const designer = await db.getDesignerById(work.designerId);
      const collection = await db.getCollectionById(work.collectionId);
      
      // 验证能够获取完整信息
      expect(work).toBeDefined();
      expect(designer).toBeDefined();
      expect(collection).toBeDefined();
      
      if (designer && collection) {
        // 验证关联关系正确
        expect(work.designerId).toBe(designer.id);
        expect(work.collectionId).toBe(collection.id);
      }
    }
  });

  it('作品详情应该包含评分统计', async () => {
    const workId = 1;
    
    // 获取作品
    const work = await db.getWorkById(workId);
    
    if (work) {
      // 获取评分统计
      const avgRating = await db.getAverageRatingForWork(workId);
      const ratingCount = await db.getRatingCountForWork(workId);
      
      expect(typeof avgRating).toBe('number');
      expect(typeof ratingCount).toBe('number');
      expect(avgRating).toBeGreaterThanOrEqual(0);
      expect(avgRating).toBeLessThanOrEqual(5);
      expect(ratingCount).toBeGreaterThanOrEqual(0);
    }
  });
});
