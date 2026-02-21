/**
 * Seed 路由 - 受密钥保护的数据填充端点
 * 仅在 SEED_SECRET 环境变量匹配时执行
 */
import { Router } from "express";
import mysql from "mysql2/promise";

export function registerSeedRoute(app: Router) {
  app.post("/api/seed", async (req, res) => {
    const secret = req.headers["x-seed-secret"] || req.query.secret;
    const expectedSecret = process.env.SEED_SECRET || "museum-seed-2024";

    if (secret !== expectedSecret) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      return res.status(500).json({ error: "DATABASE_URL not set" });
    }

    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(msg);
      logs.push(msg);
    };

    let connection: mysql.Connection | null = null;
    try {
      const url = new URL(DATABASE_URL);
      connection = await mysql.createConnection({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
      });

      log("🌱 开始填充 Demo 数据...");

      // ============ 1. 创建博物馆用户账号 ============
      log("📦 创建博物馆用户...");
      const museumUsers = [
        { openId: "demo_museum_001", name: "故宫博物院", role: "museum" },
        { openId: "demo_museum_002", name: "中国国家博物馆", role: "museum" },
        { openId: "demo_museum_003", name: "上海博物馆", role: "museum" },
        { openId: "demo_museum_004", name: "苏州博物馆", role: "museum" },
        { openId: "demo_museum_005", name: "陕西历史博物馆", role: "museum" },
      ];
      const museumUserIds: number[] = [];
      for (const u of museumUsers) {
        const [existing] = (await connection.execute(
          "SELECT id FROM users WHERE openId = ?",
          [u.openId]
        )) as any;
        if (existing.length > 0) {
          museumUserIds.push(existing[0].id);
          log(`  ✓ 用户已存在: ${u.name} (id=${existing[0].id})`);
        } else {
          const [result] = (await connection.execute(
            "INSERT INTO users (openId, name, role) VALUES (?, ?, ?)",
            [u.openId, u.name, u.role]
          )) as any;
          museumUserIds.push(result.insertId);
          log(`  ✓ 创建用户: ${u.name} (id=${result.insertId})`);
        }
      }

      // ============ 2. 创建博物馆资料 ============
      log("🏛️  创建博物馆资料...");
      const museums = [
        {
          userId: museumUserIds[0],
          name: "故宫博物院",
          description:
            "故宫博物院建立于1925年10月10日，位于北京故宫紫禁城内，是中国最大的古代文化艺术博物馆，其文物收藏主要来源于清代宫廷旧藏。",
          address: "北京市东城区景山前街4号",
          logo: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=200&h=200&fit=crop",
          coverImage:
            "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=400&fit=crop",
          contactEmail: "info@dpm.org.cn",
          website: "https://www.dpm.org.cn",
          verified: 1,
        },
        {
          userId: museumUserIds[1],
          name: "中国国家博物馆",
          description:
            "中国国家博物馆位于北京天安门广场东侧，是以历史与艺术为主，系统展示中华民族悠久历史和灿烂文化的综合性博物馆。",
          address: "北京市东城区东长安街16号",
          logo: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=200&h=200&fit=crop",
          coverImage:
            "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=400&fit=crop",
          contactEmail: "info@chnmuseum.cn",
          website: "https://www.chnmuseum.cn",
          verified: 1,
        },
        {
          userId: museumUserIds[2],
          name: "上海博物馆",
          description:
            "上海博物馆是一座大型中国古代艺术博物馆，馆藏文物近百万件，其中珍贵文物12万余件，素有'文物精品与文化财富宝库'之誉。",
          address: "上海市黄浦区人民大道201号",
          logo: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=200&h=200&fit=crop",
          coverImage:
            "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=400&fit=crop",
          contactEmail: "info@shanghaimuseum.net",
          website: "https://www.shanghaimuseum.net",
          verified: 1,
        },
        {
          userId: museumUserIds[3],
          name: "苏州博物馆",
          description:
            "苏州博物馆由贝聿铭设计，是一座集现代化馆舍建筑、古建筑与创新山水园林三位一体的综合性博物馆，馆藏文物4万余件。",
          address: "江苏省苏州市姑苏区东北街204号",
          logo: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=200&h=200&fit=crop",
          coverImage:
            "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=400&fit=crop",
          contactEmail: "info@szmuseum.com",
          website: "https://www.szmuseum.com",
          verified: 1,
        },
        {
          userId: museumUserIds[4],
          name: "陕西历史博物馆",
          description:
            "陕西历史博物馆是中国第一座大型现代化国家级博物馆，被誉为'华夏宝库'，馆藏文物171万余件，上起远古人类初始阶段，下至1840年前。",
          address: "陕西省西安市雁塔区小寨东路91号",
          logo: "https://images.unsplash.com/photo-1564399580075-5dfe19c205f1?w=200&h=200&fit=crop",
          coverImage:
            "https://images.unsplash.com/photo-1564399580075-5dfe19c205f1?w=800&h=400&fit=crop",
          contactEmail: "info@sxhm.com",
          website: "https://www.sxhm.com",
          verified: 1,
        },
      ];
      const museumIds: number[] = [];
      for (const m of museums) {
        const [existing] = (await connection.execute(
          "SELECT id FROM museums WHERE userId = ?",
          [m.userId]
        )) as any;
        if (existing.length > 0) {
          museumIds.push(existing[0].id);
          log(`  ✓ 博物馆已存在: ${m.name} (id=${existing[0].id})`);
        } else {
          const [result] = (await connection.execute(
            "INSERT INTO museums (userId, name, description, address, logo, coverImage, contactEmail, website, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              m.userId,
              m.name,
              m.description,
              m.address,
              m.logo,
              m.coverImage,
              m.contactEmail,
              m.website,
              m.verified,
            ]
          )) as any;
          museumIds.push(result.insertId);
          log(`  ✓ 创建博物馆: ${m.name} (id=${result.insertId})`);
        }
      }

      // ============ 3. 创建征集项目 ============
      log("📋 创建征集项目...");
      const now = new Date();
      const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      const collections = [
        {
          museumId: museumIds[0],
          title: "故宫·龙纹文创设计征集",
          description:
            "以故宫馆藏龙纹瓷器为灵感，征集融合传统龙纹元素的现代文创产品设计方案。包括但不限于：生活用品、文具、服饰配件、数字艺术等品类。",
          coverImage:
            "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=400&fit=crop",
          tags: JSON.stringify(["龙纹", "瓷器", "故宫", "传统纹样"]),
          requirements:
            "1. 作品需体现故宫龙纹的文化内涵；2. 设计需具备商业可行性；3. 提交效果图及设计说明",
          budget: "一等奖：50000元，二等奖：20000元，三等奖：10000元",
          deadline: futureDate,
          status: "active",
          maxWorks: 100,
        },
        {
          museumId: museumIds[1],
          title: "国博·清明上河图文创开发",
          description:
            "围绕《清明上河图》这一传世名作，征集创意文创产品设计。希望设计师从画作中提取元素，转化为现代生活用品，让历史名画走入千家万户。",
          coverImage:
            "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=400&fit=crop",
          tags: JSON.stringify(["清明上河图", "宋代", "市井文化", "文创"]),
          requirements:
            "1. 设计元素需来源于画作；2. 产品需具备实用性；3. 提交完整的产品设计方案",
          budget: "优秀奖：30000元，入围奖：5000元",
          deadline: futureDate,
          status: "active",
          maxWorks: 80,
        },
        {
          museumId: museumIds[1],
          title: "后母戊鼎·青铜文化创意设计",
          description:
            "以国宝后母戊鼎为核心，征集体现商代青铜文化的现代创意设计。欢迎各类设计形式，包括产品设计、平面设计、数字艺术等。",
          coverImage:
            "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=400&fit=crop",
          tags: JSON.stringify(["青铜器", "商代", "后母戊鼎", "国宝"]),
          requirements:
            "1. 设计需体现青铜文化精髓；2. 创意独特，具有市场潜力；3. 提供详细的设计说明",
          budget: "金奖：80000元，银奖：40000元，铜奖：20000元",
          deadline: futureDate,
          status: "active",
          maxWorks: 120,
        },
        {
          museumId: museumIds[3],
          title: "苏博·良渚玉文化创意征集",
          description:
            "以苏州博物馆馆藏良渚文化玉器为灵感，征集融合玉文化元素的现代设计作品。良渚玉器代表了中华文明的曙光，期待设计师赋予其新的生命。",
          coverImage:
            "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=400&fit=crop",
          tags: JSON.stringify(["良渚文化", "玉器", "苏州", "东方美学"]),
          requirements:
            "1. 设计需体现玉文化的精神内涵；2. 结合现代审美；3. 提交设计稿及创意说明",
          budget: "特等奖：60000元，优秀奖：20000元",
          deadline: futureDate,
          status: "active",
          maxWorks: 60,
        },
        {
          museumId: museumIds[3],
          title: "苏州园林·四季美学文创设计",
          description:
            "以苏州古典园林的四季景致为主题，征集体现江南园林美学的文创产品设计。春花秋月、夏荷冬雪，每一季都有独特的美丽等待设计师去发现。",
          coverImage:
            "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=400&fit=crop",
          tags: JSON.stringify(["苏州园林", "四季", "江南美学", "生活美学"]),
          requirements:
            "1. 设计需体现园林四季特色；2. 产品具备实用价值；3. 提交完整设计方案",
          budget: "一等奖：40000元，二等奖：15000元，三等奖：8000元",
          deadline: futureDate,
          status: "active",
          maxWorks: 90,
        },
        {
          museumId: museumIds[4],
          title: "陕历博·唐三彩文创设计大赛",
          description:
            "以陕西历史博物馆馆藏唐三彩为主题，征集体现盛唐文化的创意设计。唐三彩色彩斑斓、造型生动，是盛唐文化自信的最好体现。",
          coverImage:
            "https://images.unsplash.com/photo-1564399580075-5dfe19c205f1?w=800&h=400&fit=crop",
          tags: JSON.stringify(["唐三彩", "盛唐", "丝绸之路", "陕西"]),
          requirements:
            "1. 设计需体现唐三彩的艺术特色；2. 融合现代设计语言；3. 提交效果图及说明书",
          budget: "大奖：100000元，金奖：50000元，银奖：20000元",
          deadline: futureDate,
          status: "active",
          maxWorks: 150,
        },
      ];
      const collectionIds: number[] = [];
      for (const c of collections) {
        const [existing] = (await connection.execute(
          "SELECT id FROM collections WHERE title = ? AND museumId = ?",
          [c.title, c.museumId]
        )) as any;
        if (existing.length > 0) {
          collectionIds.push(existing[0].id);
          log(`  ✓ 征集项目已存在: ${c.title} (id=${existing[0].id})`);
        } else {
          const [result] = (await connection.execute(
            "INSERT INTO collections (museumId, title, description, coverImage, tags, requirements, budget, deadline, status, maxWorks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              c.museumId,
              c.title,
              c.description,
              c.coverImage,
              c.tags,
              c.requirements,
              c.budget,
              c.deadline,
              c.status,
              c.maxWorks,
            ]
          )) as any;
          collectionIds.push(result.insertId);
          log(`  ✓ 创建征集项目: ${c.title} (id=${result.insertId})`);
        }
      }

      // ============ 4. 创建设计师用户账号 ============
      log("🎨 创建设计师用户...");
      const designerUsers = [
        { openId: "demo_designer_001", name: "林晓雨", role: "designer" },
        { openId: "demo_designer_002", name: "陈墨白", role: "designer" },
        { openId: "demo_designer_003", name: "王思远", role: "designer" },
        { openId: "demo_designer_004", name: "张云舒", role: "designer" },
        { openId: "demo_designer_005", name: "李明轩", role: "designer" },
      ];
      const designerUserIds: number[] = [];
      for (const u of designerUsers) {
        const [existing] = (await connection.execute(
          "SELECT id FROM users WHERE openId = ?",
          [u.openId]
        )) as any;
        if (existing.length > 0) {
          designerUserIds.push(existing[0].id);
          log(`  ✓ 用户已存在: ${u.name} (id=${existing[0].id})`);
        } else {
          const [result] = (await connection.execute(
            "INSERT INTO users (openId, name, role) VALUES (?, ?, ?)",
            [u.openId, u.name, u.role]
          )) as any;
          designerUserIds.push(result.insertId);
          log(`  ✓ 创建用户: ${u.name} (id=${result.insertId})`);
        }
      }

      // ============ 5. 创建设计师资料 ============
      log("👤 创建设计师资料...");
      const designers = [
        {
          userId: designerUserIds[0],
          name: "林晓雨",
          bio: "毕业于中央美术学院工业设计系，专注于传统文化与现代设计的融合创作，曾获多项国内外设计大奖。",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
          specialties: JSON.stringify(["产品设计", "文创设计", "品牌设计"]),
          portfolio: "https://portfolio.example.com/linxiaoyu",
          location: "北京",
          experience: 8,
        },
        {
          userId: designerUserIds[1],
          name: "陈墨白",
          bio: "独立插画师与平面设计师，擅长将中国传统绘画技法与现代数字艺术相结合，作品多次入选国际设计展览。",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
          specialties: JSON.stringify(["插画设计", "平面设计", "数字艺术"]),
          portfolio: "https://portfolio.example.com/chenmobai",
          location: "上海",
          experience: 6,
        },
        {
          userId: designerUserIds[2],
          name: "王思远",
          bio: "工业设计师，专注于文博文创产品开发，曾与故宫、国博等多家知名博物馆合作，设计产品累计销售超百万件。",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
          specialties: JSON.stringify(["工业设计", "文创产品", "包装设计"]),
          portfolio: "https://portfolio.example.com/wangsiyuan",
          location: "广州",
          experience: 10,
        },
        {
          userId: designerUserIds[3],
          name: "张云舒",
          bio: "珠宝与配饰设计师，将东方美学融入现代首饰设计，作品在多个国际珠宝展览中获得认可。",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
          specialties: JSON.stringify(["珠宝设计", "配饰设计", "东方美学"]),
          portfolio: "https://portfolio.example.com/zhangyunshu",
          location: "苏州",
          experience: 7,
        },
        {
          userId: designerUserIds[4],
          name: "李明轩",
          bio: "生活美学设计师，专注于香氛、茶道、文房等生活美学产品设计，致力于将传统生活方式带入现代家居。",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
          specialties: JSON.stringify(["生活美学", "香氛设计", "茶道文化"]),
          portfolio: "https://portfolio.example.com/limingxuan",
          location: "杭州",
          experience: 5,
        },
      ];
      const designerIds: number[] = [];
      for (const d of designers) {
        const [existing] = (await connection.execute(
          "SELECT id FROM designers WHERE userId = ?",
          [d.userId]
        )) as any;
        if (existing.length > 0) {
          designerIds.push(existing[0].id);
          log(`  ✓ 设计师已存在: ${d.name} (id=${existing[0].id})`);
        } else {
          const [result] = (await connection.execute(
            "INSERT INTO designers (userId, name, bio, avatar, specialties, portfolio, location, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
              d.userId,
              d.name,
              d.bio,
              d.avatar,
              d.specialties,
              d.portfolio,
              d.location,
              d.experience,
            ]
          )) as any;
          designerIds.push(result.insertId);
          log(`  ✓ 创建设计师: ${d.name} (id=${result.insertId})`);
        }
      }

      // ============ 6. 创建作品 ============
      log("🖼️  创建作品...");
      const worksData = [
        {
          collectionId: collectionIds[0],
          designerId: designerIds[0],
          title: "龙腾盛世·茶具套装",
          description:
            "以故宫馆藏清代龙纹瓷器为灵感，设计一套融合传统龙纹元素的现代茶具。采用景德镇白瓷为基底，以青花工艺绘制简化龙纹，既保留传统韵味，又符合现代审美。套装包含茶壶、茶杯（6只）、茶盘，适合家用及商务礼品。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["龙纹", "茶具", "青花瓷", "传统纹样"]),
          status: "approved",
          viewCount: 2847,
          likeCount: 423,
        },
        {
          collectionId: collectionIds[1],
          designerId: designerIds[1],
          title: "汴京烟火·城市明信片",
          description:
            "从《清明上河图》中截取12个最具代表性的市井场景，以现代插画手法重新演绎，制作成系列明信片和海报。每张作品都附有原画位置标注和历史故事，让观者在欣赏中了解北宋城市生活。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["清明上河图", "明信片", "插画", "宋代文化"]),
          status: "approved",
          viewCount: 1923,
          likeCount: 287,
        },
        {
          collectionId: collectionIds[2],
          designerId: designerIds[2],
          title: "国之重器·文房四宝套装",
          description:
            "以后母戊鼎的造型为灵感，设计一套融合商代青铜艺术的现代文房套装。笔筒取鼎足之稳，砚台借鼎腹之深，镇纸仿鼎耳之形，整套产品既有文化内涵，又具备实用功能。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["文房四宝", "青铜器", "书房文化", "礼品套装"]),
          status: "approved",
          viewCount: 1456,
          likeCount: 198,
        },
        {
          collectionId: collectionIds[3],
          designerId: designerIds[3],
          title: "玉见·现代首饰系列",
          description:
            "以良渚玉琮的方圆相融造型为灵感，结合现代首饰设计语言，创作一系列轻奢首饰。项链、耳环、手链三件套，以925银为基材，局部镶嵌天然玉石，传递'君子如玉'的东方气质。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["玉文化", "首饰设计", "轻奢", "东方美学"]),
          status: "winner",
          viewCount: 3241,
          likeCount: 567,
        },
        {
          collectionId: collectionIds[4],
          designerId: designerIds[4],
          title: "园林·四时系列香薰",
          description:
            "以苏州园林'春夏秋冬'四季景致为主题，设计四款香薰产品。包装以园林窗格为造型，内含与四季对应的植物香型，让用户在家中感受苏州园林的诗意生活。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["苏州园林", "香薰", "生活美学", "四季主题"]),
          status: "approved",
          viewCount: 1789,
          likeCount: 312,
        },
        {
          collectionId: collectionIds[5],
          designerId: designerIds[0],
          title: "盛唐·丝路风情手账套装",
          description:
            "以唐三彩骆驼载乐俑为主视觉，设计一套丝路风情手账套装。包含手账本、贴纸、印章、书签等，将唐代丝绸之路上的异域风情与现代文具设计相结合，让用户在记录生活的同时感受盛唐气象。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["唐三彩", "丝绸之路", "手账", "文具套装"]),
          status: "approved",
          viewCount: 2103,
          likeCount: 389,
        },
      ];
      for (const w of worksData) {
        const [existing] = (await connection.execute(
          "SELECT id FROM works WHERE title = ? AND designerId = ?",
          [w.title, w.designerId]
        )) as any;
        if (existing.length > 0) {
          log(`  ✓ 作品已存在: ${w.title}`);
        } else {
          await connection.execute(
            "INSERT INTO works (collectionId, designerId, title, description, images, tags, status, viewCount, likeCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              w.collectionId,
              w.designerId,
              w.title,
              w.description,
              w.images,
              w.tags,
              w.status,
              w.viewCount,
              w.likeCount,
            ]
          );
          log(`  ✓ 创建作品: ${w.title}`);
        }
      }

      log("\n✅ Demo 数据填充完成！");
      log(`   - ${museumIds.length} 个博物馆`);
      log(`   - ${collectionIds.length} 个征集项目（均为 active 状态）`);
      log(`   - ${designerIds.length} 个设计师`);
      log(`   - ${worksData.length} 件作品`);

      return res.json({ success: true, logs });
    } catch (err: any) {
      log(`❌ 错误: ${err.message}`);
      return res.status(500).json({ success: false, error: err.message, logs });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  });
}
