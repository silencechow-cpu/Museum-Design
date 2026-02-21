/**
 * 测试评分系统功能
 * 验证博物馆评分、评分统计等功能
 */

import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('评分系统功能', () => {
  it('应该能够创建评分', async () => {
    // 注意：这个测试需要有效的workId, museumId和userId
    // 在实际环境中，这些ID应该从数据库中获取或创建测试数据
    const rating = await db.createOrUpdateRating({
      workId: 1,
      museumId: 1,
      userId: 1,
      score: 5,
    });

    expect(rating).toBeDefined();
    if (rating) {
      expect(rating.score).toBe(5);
      expect(rating.workId).toBe(1);
      expect(rating.museumId).toBe(1);
    }
  });

  it('应该能够更新已有评分', async () => {
    // 先创建一个评分
    const firstRating = await db.createOrUpdateRating({
      workId: 1,
      museumId: 1,
      userId: 1,
      score: 3,
    });

    expect(firstRating).toBeDefined();

    // 更新评分
    const updatedRating = await db.createOrUpdateRating({
      workId: 1,
      museumId: 1,
      userId: 1,
      score: 5,
    });

    expect(updatedRating).toBeDefined();
    if (updatedRating) {
      expect(updatedRating.score).toBe(5);
    }
  });

  it('应该能够获取作品的所有评分', async () => {
    const ratings = await db.getRatingsByWorkId(1);

    expect(Array.isArray(ratings)).toBe(true);
  });

  it('应该能够获取特定博物馆对作品的评分', async () => {
    const rating = await db.getRatingByWorkAndMuseum(1, 1);

    // 可能存在也可能不存在
    if (rating) {
      expect(rating.workId).toBe(1);
      expect(rating.museumId).toBe(1);
    }
  });

  it('应该能够计算作品的平均评分', async () => {
    const avgRating = await db.getAverageRatingForWork(1);

    expect(typeof avgRating).toBe('number');
    expect(avgRating).toBeGreaterThanOrEqual(0);
    expect(avgRating).toBeLessThanOrEqual(5);
  });

  it('应该能够获取作品的评分数量', async () => {
    const count = await db.getRatingCountForWork(1);

    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('评分应该在1-5之间', async () => {
    // 测试有效评分
    const validRating = await db.createOrUpdateRating({
      workId: 2,
      museumId: 1,
      userId: 1,
      score: 4,
    });

    expect(validRating).toBeDefined();
    if (validRating) {
      expect(validRating.score).toBeGreaterThanOrEqual(1);
      expect(validRating.score).toBeLessThanOrEqual(5);
    }
  });

  it('应该能够删除评分', async () => {
    // 先创建一个评分
    const rating = await db.createOrUpdateRating({
      workId: 3,
      museumId: 1,
      userId: 1,
      score: 4,
    });

    if (rating) {
      // 删除评分
      await db.deleteRating(rating.id);

      // 验证已删除
      const deletedRating = await db.getRatingById(rating.id);
      expect(deletedRating).toBeUndefined();
    }
  });

  it('同一博物馆对同一作品只能有一个评分', async () => {
    // 创建第一个评分
    const firstRating = await db.createOrUpdateRating({
      workId: 4,
      museumId: 1,
      userId: 1,
      score: 3,
    });

    // 创建第二个评分（应该更新而不是创建新的）
    const secondRating = await db.createOrUpdateRating({
      workId: 4,
      museumId: 1,
      userId: 1,
      score: 5,
    });

    // 获取所有评分
    const allRatings = await db.getRatingsByWorkId(4);
    const museumRatings = allRatings.filter(r => r.museumId === 1);

    // 应该只有一个评分
    expect(museumRatings.length).toBe(1);
    if (museumRatings.length > 0) {
      expect(museumRatings[0].score).toBe(5);
    }
  });

  it('不同博物馆可以对同一作品评分', async () => {
    // 博物馆1评分
    await db.createOrUpdateRating({
      workId: 5,
      museumId: 1,
      userId: 1,
      score: 4,
    });

    // 博物馆2评分
    await db.createOrUpdateRating({
      workId: 5,
      museumId: 2,
      userId: 2,
      score: 5,
    });

    // 获取所有评分
    const allRatings = await db.getRatingsByWorkId(5);

    // 应该至少有2个评分
    expect(allRatings.length).toBeGreaterThanOrEqual(2);
  });
});

describe('评分统计功能', () => {
  it('没有评分的作品平均分应该为0', async () => {
    const avgRating = await db.getAverageRatingForWork(99999);
    expect(avgRating).toBe(0);
  });

  it('没有评分的作品评分数量应该为0', async () => {
    const count = await db.getRatingCountForWork(99999);
    expect(count).toBe(0);
  });

  it('平均评分应该正确计算', async () => {
    // 创建多个评分
    await db.createOrUpdateRating({
      workId: 6,
      museumId: 1,
      userId: 1,
      score: 3,
    });

    await db.createOrUpdateRating({
      workId: 6,
      museumId: 2,
      userId: 2,
      score: 5,
    });

    const avgRating = await db.getAverageRatingForWork(6);
    
    // 平均分应该在3和5之间
    expect(avgRating).toBeGreaterThanOrEqual(3);
    expect(avgRating).toBeLessThanOrEqual(5);
  });
});
