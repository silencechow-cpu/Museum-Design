import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import type { InsertCollection, InsertWork, InsertMuseum, InsertDesigner, InsertUser } from '../drizzle/schema';

describe('征集管理和作品删除功能', () => {
  let testMuseumId: number;
  let testDesignerId: number;
  let testCollectionId: number;
  let testWorkId: number;

  beforeAll(async () => {
    // 创建测试博物馆
    const museumUser: InsertUser = {
      openId: `test-museum-${Date.now()}`,
      name: '测试博物馆用户',
      email: `museum-${Date.now()}@test.com`,
      role: 'museum',
    };
    await db.upsertUser(museumUser);
    const user = await db.getUserByOpenId(museumUser.openId!);
    
    const museum: InsertMuseum = {
      userId: user!.id,
      name: '测试博物馆',
      description: '测试描述',
      address: '测试地址',
    };
    const createdMuseum = await db.createMuseum(museum);
    testMuseumId = createdMuseum!.id;

    // 创建测试设计师
    const designerUser: InsertUser = {
      openId: `test-designer-${Date.now()}`,
      name: '测试设计师用户',
      email: `designer-${Date.now()}@test.com`,
      role: 'designer',
    };
    await db.upsertUser(designerUser);
    const designerUserData = await db.getUserByOpenId(designerUser.openId!);
    
    const designer: InsertDesigner = {
      userId: designerUserData!.id,
      name: '测试设计师',
      bio: '测试简介',
    };
    const createdDesigner = await db.createDesigner(designer);
    testDesignerId = createdDesigner!.id;

    // 创建测试征集
    const collection: InsertCollection = {
      museumId: testMuseumId,
      title: '测试征集项目',
      artifactName: '测试文物',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
    };
    const createdCollection = await db.createCollection(collection);
    testCollectionId = createdCollection!.id;

    // 创建测试作品
    const work: InsertWork = {
      designerId: testDesignerId,
      collectionId: testCollectionId,
      title: '测试作品',
      images: JSON.stringify(['image1.jpg']),
      status: 'submitted',
    };
    const createdWork = await db.createWork(work);
    testWorkId = createdWork!.id;
  });

  describe('征集项目编辑功能', () => {
    it('应该能够更新征集项目的标题', async () => {
      const updated = await db.updateCollection(testCollectionId, {
        title: '更新后的征集标题',
      });
      
      expect(updated).toBeDefined();
      expect(updated!.title).toBe('更新后的征集标题');
    });

    it('应该能够更新征集项目的描述', async () => {
      const updated = await db.updateCollection(testCollectionId, {
        description: '这是更新后的描述',
      });
      
      expect(updated).toBeDefined();
      expect(updated!.description).toBe('这是更新后的描述');
    });

    it('应该能够更新征集项目的奖金', async () => {
      const updated = await db.updateCollection(testCollectionId, {
        prizeAmount: 10000,
      });
      
      expect(updated).toBeDefined();
      expect(updated!.prizeAmount).toBe(10000);
    });

    it('应该能够更新征集项目的截止日期', async () => {
      const newDeadline = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      const updated = await db.updateCollection(testCollectionId, {
        deadline: newDeadline,
      });
      
      expect(updated).toBeDefined();
      expect(updated!.deadline.getTime()).toBe(newDeadline.getTime());
    });

    it('应该能够更新征集项目的状态', async () => {
      const updated = await db.updateCollection(testCollectionId, {
        status: 'active',
      });
      
      expect(updated).toBeDefined();
      expect(updated!.status).toBe('active');
    });
  });

  describe('作品删除功能', () => {
    it('应该能够删除作品', async () => {
      // 创建一个临时作品用于删除测试
      const tempWork: InsertWork = {
        designerId: testDesignerId,
        collectionId: testCollectionId,
        title: '临时作品',
        images: JSON.stringify(['temp.jpg']),
        status: 'submitted',
      };
      const createdTempWork = await db.createWork(tempWork);
      const tempWorkId = createdTempWork!.id;

      // 删除作品
      await db.deleteWork(tempWorkId);

      // 验证作品已被删除
      const deletedWork = await db.getWorkById(tempWorkId);
      expect(deletedWork).toBeUndefined();
    });

    it('删除作品后应该不影响其他作品', async () => {
      // 创建两个临时作品
      const work1: InsertWork = {
        designerId: testDesignerId,
        collectionId: testCollectionId,
        title: '临时作品1',
        images: JSON.stringify(['temp1.jpg']),
        status: 'submitted',
      };
      const work2: InsertWork = {
        designerId: testDesignerId,
        collectionId: testCollectionId,
        title: '临时作品2',
        images: JSON.stringify(['temp2.jpg']),
        status: 'submitted',
      };
      
      const createdWork1 = await db.createWork(work1);
      const createdWork2 = await db.createWork(work2);
      
      // 删除第一个作品
      await db.deleteWork(createdWork1!.id);

      // 验证第二个作品仍然存在
      const existingWork = await db.getWorkById(createdWork2!.id);
      expect(existingWork).toBeDefined();
      expect(existingWork!.title).toBe('临时作品2');

      // 清理第二个作品
      await db.deleteWork(createdWork2!.id);
    });
  });
});
