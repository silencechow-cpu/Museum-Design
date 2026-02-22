/**
 * 扩展 Seed 路由 - 添加更多 demo 数据
 */
import { Router } from "express";
import mysql from "mysql2/promise";

export function registerSeedExtraRoute(app: Router) {
  app.post("/api/seed-extra", async (req, res) => {
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
    const log = (msg: string) => { console.log(msg); logs.push(msg); };

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

      log("🌱 开始填充扩展 Demo 数据...");

      // ============ 新增博物馆用户 ============
      log("📦 创建新博物馆用户...");
      const newMuseumUsers = [
        { openId: "demo_museum_006", name: "南京博物院", role: "museum" },
        { openId: "demo_museum_007", name: "浙江省博物馆", role: "museum" },
        { openId: "demo_museum_008", name: "湖南省博物馆", role: "museum" },
        { openId: "demo_museum_009", name: "四川博物院", role: "museum" },
        { openId: "demo_museum_010", name: "广东省博物馆", role: "museum" },
      ];
      const newMuseumUserIds: number[] = [];
      for (const u of newMuseumUsers) {
        const [existing] = await connection.execute(
          "SELECT id FROM users WHERE openId = ?", [u.openId]
        ) as any;
        if (existing.length > 0) {
          newMuseumUserIds.push(existing[0].id);
          log(`  ✓ 用户已存在: ${u.name}`);
        } else {
          const [result] = await connection.execute(
            "INSERT INTO users (openId, name, role) VALUES (?, ?, ?)",
            [u.openId, u.name, u.role]
          ) as any;
          newMuseumUserIds.push(result.insertId);
          log(`  ✓ 创建用户: ${u.name} (id=${result.insertId})`);
        }
      }

      // ============ 新增博物馆资料 ============
      log("🏛️  创建新博物馆资料...");
      const newMuseums = [
        {
          userId: newMuseumUserIds[0],
          name: "南京博物院",
          description: "南京博物院是中国三大博物馆之一，前身是1933年蔡元培等倡建的国立中央博物院，现有各类藏品43万余件，其中珍贵文物37万余件。",
          address: "江苏省南京市玄武区中山东路321号",
          logo: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=200&h=200&fit=crop",
          coverImage: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=400&fit=crop",
          contactEmail: "info@njmuseum.com",
          website: "https://www.njmuseum.com",
          verified: 1,
        },
        {
          userId: newMuseumUserIds[1],
          name: "浙江省博物馆",
          description: "浙江省博物馆创建于1929年，是浙江省内规模最大的综合性人文科学博物馆，馆藏文物10万余件，以越国青铜器、越窑青瓷、书画为特色。",
          address: "浙江省杭州市西湖区孤山路25号",
          logo: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=200&h=200&fit=crop",
          coverImage: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=400&fit=crop",
          contactEmail: "info@zhejiangmuseum.com",
          website: "https://www.zhejiangmuseum.com",
          verified: 1,
        },
        {
          userId: newMuseumUserIds[2],
          name: "湖南省博物馆",
          description: "湖南省博物馆是湖南省最大的历史艺术性博物馆，以马王堆汉墓出土文物、商周青铜器为特色，馆藏文物18万余件。",
          address: "湖南省长沙市开福区东风路50号",
          logo: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=200&h=200&fit=crop",
          coverImage: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=400&fit=crop",
          contactEmail: "info@hnmuseum.com",
          website: "https://www.hnmuseum.com",
          verified: 1,
        },
        {
          userId: newMuseumUserIds[3],
          name: "四川博物院",
          description: "四川博物院是西南地区最大的综合性博物馆，馆藏文物26万余件，以张大千书画、巴蜀青铜器、汉代陶器为特色藏品。",
          address: "四川省成都市青羊区浣花南路251号",
          logo: "https://images.unsplash.com/photo-1564399580075-5dfe19c205f1?w=200&h=200&fit=crop",
          coverImage: "https://images.unsplash.com/photo-1564399580075-5dfe19c205f1?w=800&h=400&fit=crop",
          contactEmail: "info@scmuseum.org.cn",
          website: "https://www.scmuseum.org.cn",
          verified: 1,
        },
        {
          userId: newMuseumUserIds[4],
          name: "广东省博物馆",
          description: "广东省博物馆是广东省最大的综合性博物馆，馆藏文物17万余件，以陶瓷、端砚、书画、自然标本为特色，是岭南文化的重要展示窗口。",
          address: "广东省广州市天河区珠江新城珠江东路2号",
          logo: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=200&h=200&fit=crop",
          coverImage: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=400&fit=crop",
          contactEmail: "info@gdmuseum.com",
          website: "https://www.gdmuseum.com",
          verified: 1,
        },
      ];
      const newMuseumIds: number[] = [];
      for (const m of newMuseums) {
        const [existing] = await connection.execute(
          "SELECT id FROM museums WHERE userId = ?", [m.userId]
        ) as any;
        if (existing.length > 0) {
          newMuseumIds.push(existing[0].id);
          log(`  ✓ 博物馆已存在: ${m.name}`);
        } else {
          const [result] = await connection.execute(
            "INSERT INTO museums (userId, name, description, address, logo, coverImage, contactEmail, website, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [m.userId, m.name, m.description, m.address, m.logo, m.coverImage, m.contactEmail, m.website, m.verified]
          ) as any;
          newMuseumIds.push(result.insertId);
          log(`  ✓ 创建博物馆: ${m.name} (id=${result.insertId})`);
        }
      }

      // ============ 新增征集项目 ============
      log("📋 创建新征集项目...");
      const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      const newCollections = [
        {
          museumId: newMuseumIds[0],
          title: "南朝·竹林七贤文创征集",
          description: "以南京博物院馆藏南朝砖画《竹林七贤与荣启期》为蓝本，征集融合魏晋风骨与现代生活美学的文创产品设计。鼓励设计师从竹、琴、酒、书等意象切入，创作兼具文化深度与实用价值的产品。",
          artifactName: "南朝砖画·竹林七贤与荣启期",
          artifactDescription: "南朝时期砖画，描绘竹林七贤与荣启期共九人席地而坐、各具情态的场景，是中国早期人物画的杰出代表。",
          images: JSON.stringify(["https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=600&fit=crop"]),
          prize: "¥60,000",
          prizeAmount: 60000,
          deadline: futureDate,
          status: "active",
        },
        {
          museumId: newMuseumIds[1],
          title: "越窑青瓷·秘色之美文创征集",
          description: "以浙江省博物馆馆藏越窑青瓷为主题，征集展现'秘色瓷'独特釉色美学的文创设计。欢迎从色彩、造型、纹饰等角度切入，将千年青瓷之美融入当代生活器物设计。",
          artifactName: "越窑秘色瓷八棱净瓶",
          artifactDescription: "唐代越窑精品，釉色青翠如玉，造型优雅，是越窑青瓷的代表作品，被誉为'千峰翠色'。",
          images: JSON.stringify(["https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=600&fit=crop"]),
          prize: "¥45,000",
          prizeAmount: 45000,
          deadline: futureDate,
          status: "active",
        },
        {
          museumId: newMuseumIds[2],
          title: "马王堆·辛追夫人文创征集",
          description: "以湖南省博物馆镇馆之宝马王堆汉墓出土文物为灵感，征集展现汉代贵族生活美学的文创产品。可从T形帛画、素纱单衣、漆器等文物切入，创作兼具历史厚度与现代感的设计作品。",
          artifactName: "马王堆汉墓T形帛画",
          artifactDescription: "西汉时期帛画，描绘天上、人间、地下三界的宏大图景，色彩鲜艳，构图精妙，是汉代绘画艺术的巅峰之作。",
          images: JSON.stringify(["https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop"]),
          prize: "¥70,000",
          prizeAmount: 70000,
          deadline: futureDate,
          status: "active",
        },
        {
          museumId: newMuseumIds[3],
          title: "三星堆·神秘古蜀文创征集",
          description: "以四川博物院馆藏三星堆文物为主题，征集展现古蜀文明神秘之美的文创设计。青铜纵目面具、金面罩、青铜神树等标志性文物均可作为创作灵感，期待设计师呈现古蜀文明的独特魅力。",
          artifactName: "三星堆青铜纵目面具",
          artifactDescription: "商代晚期青铜器，面具造型夸张神秘，双目突出，耳翼宽大，是三星堆文化最具代表性的文物之一。",
          images: JSON.stringify(["https://images.unsplash.com/photo-1564399580075-5dfe19c205f1?w=800&h=600&fit=crop"]),
          prize: "¥80,000",
          prizeAmount: 80000,
          deadline: futureDate,
          status: "active",
        },
        {
          museumId: newMuseumIds[4],
          title: "岭南·端砚文化文创征集",
          description: "以广东省博物馆馆藏端砚为主题，征集展现岭南文房文化的文创产品设计。端砚石品丰富，纹理独特，期待设计师将端砚文化融入现代文具、家居、装饰品等多元品类。",
          artifactName: "清代御题端砚",
          artifactDescription: "清代宫廷御用端砚，石质细腻，砚面刻有御题诗文，雕工精湛，是端砚中的极品，代表了岭南砚雕艺术的最高水准。",
          images: JSON.stringify(["https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop"]),
          prize: "¥40,000",
          prizeAmount: 40000,
          deadline: futureDate,
          status: "active",
        },
        {
          museumId: newMuseumIds[0],
          title: "明代·云锦织造文创征集",
          description: "以南京博物院馆藏明代云锦为主题，征集将云锦纹样与现代时尚设计相结合的文创作品。云锦以其华美的纹样和精湛的工艺著称，期待设计师将这一非遗技艺的美学精髓带入当代生活。",
          artifactName: "明代妆花缎龙袍料",
          artifactDescription: "明代宫廷织造，以妆花工艺织就，金线绣龙，色彩富丽堂皇，是南京云锦工艺的代表作品，展现了明代宫廷织造的最高水准。",
          images: JSON.stringify(["https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=600&fit=crop"]),
          prize: "¥55,000",
          prizeAmount: 55000,
          deadline: futureDate,
          status: "active",
        },
      ];
      const newCollectionIds: number[] = [];
      for (const c of newCollections) {
        const [existing] = await connection.execute(
          "SELECT id FROM collections WHERE title = ?", [c.title]
        ) as any;
        if (existing.length > 0) {
          newCollectionIds.push(existing[0].id);
          log(`  ✓ 征集已存在: ${c.title}`);
        } else {
          const [result] = await connection.execute(
            "INSERT INTO collections (museumId, title, description, artifactName, artifactDescription, images, prize, prizeAmount, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [c.museumId, c.title, c.description, c.artifactName, c.artifactDescription, c.images, c.prize, c.prizeAmount, c.deadline, c.status]
          ) as any;
          newCollectionIds.push(result.insertId);
          log(`  ✓ 创建征集: ${c.title} (id=${result.insertId})`);
        }
      }

      // ============ 获取已有设计师 ID ============
      const [existingDesigners] = await connection.execute(
        "SELECT id FROM designers ORDER BY id LIMIT 5"
      ) as any;
      const designerIds = existingDesigners.map((d: any) => d.id);

      // ============ 新增更多设计师 ============
      log("👤 创建新设计师...");
      const newDesignerUsers = [
        { openId: "demo_designer_006", name: "周雅芸", role: "designer" },
        { openId: "demo_designer_007", name: "吴天翔", role: "designer" },
        { openId: "demo_designer_008", name: "赵晨曦", role: "designer" },
        { openId: "demo_designer_009", name: "刘梦竹", role: "designer" },
        { openId: "demo_designer_010", name: "孙浩然", role: "designer" },
      ];
      const newDesignerUserIds: number[] = [];
      for (const u of newDesignerUsers) {
        const [existing] = await connection.execute(
          "SELECT id FROM users WHERE openId = ?", [u.openId]
        ) as any;
        if (existing.length > 0) {
          newDesignerUserIds.push(existing[0].id);
        } else {
          const [result] = await connection.execute(
            "INSERT INTO users (openId, name, role) VALUES (?, ?, ?)",
            [u.openId, u.name, u.role]
          ) as any;
          newDesignerUserIds.push(result.insertId);
          log(`  ✓ 创建用户: ${u.name}`);
        }
      }

      const newDesignersData = [
        {
          userId: newDesignerUserIds[0],
          displayName: "周雅芸",
          bio: "纺织品与服装设计师，专注于传统织物纹样的现代转化，曾参与多个非遗传承项目，作品在国内外时装周展出。",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
          type: "individual",
          skills: JSON.stringify(["纺织设计", "服装设计", "非遗传承"]),
          portfolio: "https://portfolio.example.com/zhouyayun",
        },
        {
          userId: newDesignerUserIds[1],
          displayName: "吴天翔",
          bio: "建筑与空间设计师，将中国传统建筑美学融入现代空间设计，曾主持多个博物馆文创空间的设计改造项目。",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
          type: "individual",
          skills: JSON.stringify(["空间设计", "建筑美学", "展览设计"]),
          portfolio: "https://portfolio.example.com/wutianxiang",
        },
        {
          userId: newDesignerUserIds[2],
          displayName: "赵晨曦",
          bio: "数字艺术家与交互设计师，擅长将传统文化元素与数字技术相结合，创作沉浸式文化体验作品。",
          avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face",
          type: "individual",
          skills: JSON.stringify(["数字艺术", "交互设计", "沉浸式体验"]),
          portfolio: "https://portfolio.example.com/zhaochen xi",
        },
        {
          userId: newDesignerUserIds[3],
          displayName: "刘梦竹",
          bio: "陶瓷艺术家，毕业于景德镇陶瓷大学，专注于传统陶瓷工艺的当代创新，作品被多家博物馆收藏。",
          avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face",
          type: "individual",
          skills: JSON.stringify(["陶瓷艺术", "工艺创新", "器物设计"]),
          portfolio: "https://portfolio.example.com/liumengzhu",
        },
        {
          userId: newDesignerUserIds[4],
          displayName: "孙浩然",
          bio: "品牌与视觉设计师，专注于文化机构的品牌形象设计，服务过多家国内知名博物馆和文化机构。",
          avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face",
          type: "individual",
          skills: JSON.stringify(["品牌设计", "视觉识别", "文化传播"]),
          portfolio: "https://portfolio.example.com/sunhaoran",
        },
      ];
      const newDesignerIds: number[] = [];
      for (const d of newDesignersData) {
        const [existing] = await connection.execute(
          "SELECT id FROM designers WHERE userId = ?", [d.userId]
        ) as any;
        if (existing.length > 0) {
          newDesignerIds.push(existing[0].id);
        } else {
          const [result] = await connection.execute(
            "INSERT INTO designers (userId, displayName, bio, avatar, type, skills, portfolio) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [d.userId, d.displayName, d.bio, d.avatar, d.type, d.skills, d.portfolio]
          ) as any;
          newDesignerIds.push(result.insertId);
          log(`  ✓ 创建设计师: ${d.displayName}`);
        }
      }

      // ============ 新增作品（针对新旧征集项目） ============
      log("🖼️  创建新作品...");

      // 获取已有征集 ID（前6个）
      const [existingCollections] = await connection.execute(
        "SELECT id FROM collections ORDER BY id LIMIT 6"
      ) as any;
      const oldCollectionIds = existingCollections.map((c: any) => c.id);

      const allDesignerIds = [...designerIds, ...newDesignerIds];

      const newWorksData = [
        // 针对旧征集的新作品
        {
          collectionId: oldCollectionIds[0],
          designerId: allDesignerIds[1] || designerIds[0],
          title: "龙纹·现代家居装饰画系列",
          description: "从故宫馆藏龙纹瓷器中提取核心纹样，以现代极简主义手法重新诠释，创作一套适合现代家居的装饰画系列。采用丝网印刷工艺，限量发行，每幅作品附有文物溯源卡片。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=1200&fit=crop",
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["龙纹", "装饰画", "极简主义", "限量版"]),
          status: "approved",
          viewCount: 1234,
          likeCount: 201,
        },
        {
          collectionId: oldCollectionIds[1],
          designerId: allDesignerIds[2] || designerIds[1],
          title: "汴京·城市地图艺术版",
          description: "以《清明上河图》为蓝本，重新绘制一幅北宋汴京城市地图，标注图中所有可辨识的地点、建筑和人物活动。采用仿古宣纸印刷，可作为装饰挂画，也可折叠成便携城市指南。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1000&fit=crop",
          ]),
          tags: JSON.stringify(["清明上河图", "地图设计", "宋代文化", "艺术版"]),
          status: "submitted",
          viewCount: 876,
          likeCount: 143,
        },
        {
          collectionId: oldCollectionIds[2],
          designerId: allDesignerIds[3] || designerIds[2],
          title: "鼎·现代书房摆件系列",
          description: "以后母戊鼎为原型，按1:10比例精缩，采用黄铜铸造工艺制作，表面保留青铜器特有的斑驳质感。配合现代书房场景设计，可作为镇纸、笔架、名片座等多功能书房摆件。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["青铜器", "书房摆件", "黄铜工艺", "文化礼品"]),
          status: "winner",
          viewCount: 4521,
          likeCount: 892,
        },
        // 针对新征集的作品
        {
          collectionId: newCollectionIds[0],
          designerId: allDesignerIds[0] || designerIds[0],
          title: "竹林七贤·文人雅集茶席套装",
          description: "以竹林七贤的隐逸精神为主题，设计一套融合魏晋风骨的茶席套装。竹制茶盘、青瓷茶杯、手绘茶旗，每件单品均取材于砖画中的具体场景，让现代人在品茶中感受魏晋名士的风雅。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=1000&fit=crop",
          ]),
          tags: JSON.stringify(["竹林七贤", "茶席", "魏晋风骨", "文人雅集"]),
          status: "approved",
          viewCount: 2156,
          likeCount: 378,
        },
        {
          collectionId: newCollectionIds[1],
          designerId: allDesignerIds[4] || designerIds[3],
          title: "秘色·青瓷釉色生活器皿系列",
          description: "以越窑秘色瓷的釉色为核心，与景德镇陶瓷工厂合作，开发一系列日常生活器皿。茶杯、花器、餐盘，以现代简约造型承载千年青瓷之美，让秘色瓷的釉色之美走入寻常百姓家。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["越窑青瓷", "生活器皿", "秘色釉", "当代陶瓷"]),
          status: "approved",
          viewCount: 1876,
          likeCount: 334,
        },
        {
          collectionId: newCollectionIds[2],
          designerId: allDesignerIds[1] || designerIds[1],
          title: "马王堆·帛画图案丝巾系列",
          description: "从马王堆T形帛画中提取最具代表性的纹样——龙凤纹、云气纹、神仙图像，设计一系列真丝丝巾。采用数码印花工艺，忠实还原帛画色彩，让两千年前的汉代图案在现代时尚中重焕生机。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop",
          ]),
          tags: JSON.stringify(["马王堆", "帛画", "丝巾", "汉代纹样"]),
          status: "submitted",
          viewCount: 1432,
          likeCount: 267,
        },
        {
          collectionId: newCollectionIds[3],
          designerId: allDesignerIds[2] || designerIds[2],
          title: "三星堆·青铜面具创意台灯",
          description: "以三星堆青铜纵目面具为造型灵感，设计一款兼具艺术性与功能性的创意台灯。灯罩采用镂空青铜面具造型，内置暖光LED，开灯后光影在墙面形成神秘的古蜀图案，营造独特的文化氛围。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["三星堆", "台灯", "青铜面具", "创意家居"]),
          status: "approved",
          viewCount: 3876,
          likeCount: 712,
        },
        {
          collectionId: newCollectionIds[4],
          designerId: allDesignerIds[3] || designerIds[3],
          title: "端砚·文房雅器礼盒套装",
          description: "以广东端砚文化为核心，设计一套高端文房礼盒。包含迷你端砚、徽墨、宣纸、毛笔，以及一本介绍端砚历史与使用方法的精装小册子，以现代礼品包装呈现岭南文房文化的雅致。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=1000&fit=crop",
          ]),
          tags: JSON.stringify(["端砚", "文房四宝", "礼盒", "岭南文化"]),
          status: "approved",
          viewCount: 1654,
          likeCount: 289,
        },
        {
          collectionId: newCollectionIds[5],
          designerId: allDesignerIds[4] || designerIds[4],
          title: "云锦·现代时装联名系列",
          description: "与国内知名时装品牌合作，将明代云锦纹样融入现代成衣设计。提取云锦中的龙凤纹、缠枝花卉纹等经典图案，以数码印花技术应用于现代剪裁的外套、连衣裙和配件，打造高端文化时尚产品线。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop",
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["云锦", "时装", "联名设计", "非遗时尚"]),
          status: "winner",
          viewCount: 5234,
          likeCount: 1023,
        },
        {
          collectionId: oldCollectionIds[3] || newCollectionIds[0],
          designerId: allDesignerIds[0] || designerIds[0],
          title: "玉见·良渚文化数字藏品",
          description: "以良渚玉琮、玉璧等典型器物为原型，创作一套限量数字藏品。每件数字藏品对应一件良渚文化真实文物，附有详细的考古背景介绍，让收藏者在拥有数字艺术的同时深入了解良渚文明。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop",
          ]),
          tags: JSON.stringify(["良渚文化", "数字藏品", "玉器", "NFT艺术"]),
          status: "approved",
          viewCount: 2987,
          likeCount: 534,
        },
        {
          collectionId: oldCollectionIds[4] || newCollectionIds[1],
          designerId: allDesignerIds[1] || designerIds[1],
          title: "园林·苏州四季插花艺术课程",
          description: "以苏州园林四季植物景观为主题，设计一套线上线下结合的插花艺术课程产品。包含课程手册、专用花器、配套工具套装，以及苏州园林植物图鉴，让学员在学习插花的同时感受苏州园林的诗意。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1487530811015-780780169c2a?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1490750967868-88df5691cc1e?w=800&h=1000&fit=crop",
          ]),
          tags: JSON.stringify(["苏州园林", "插花艺术", "课程产品", "生活美学"]),
          status: "approved",
          viewCount: 1789,
          likeCount: 312,
        },
        {
          collectionId: oldCollectionIds[5] || newCollectionIds[2],
          designerId: allDesignerIds[2] || designerIds[2],
          title: "唐风·长安十二时辰主题文具套装",
          description: "以唐代长安城的十二时辰为主题，设计一套融合唐代生活美学的文具套装。每件文具对应一个时辰，配有唐代诗词和生活场景插画，让使用者在日常书写中感受盛唐的繁华与诗意。",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1000&fit=crop",
          ]),
          tags: JSON.stringify(["唐代文化", "十二时辰", "文具套装", "长安风情"]),
          status: "approved",
          viewCount: 2345,
          likeCount: 456,
        },
      ];

      let newWorksCount = 0;
      for (const w of newWorksData) {
        const [existing] = await connection.execute(
          "SELECT id FROM works WHERE title = ?", [w.title]
        ) as any;
        if (existing.length > 0) {
          log(`  ✓ 作品已存在: ${w.title}`);
        } else {
          await connection.execute(
            "INSERT INTO works (collectionId, designerId, title, description, images, tags, status, viewCount, likeCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [w.collectionId, w.designerId, w.title, w.description, w.images, w.tags, w.status, w.viewCount, w.likeCount]
          );
          log(`  ✓ 创建作品: ${w.title}`);
          newWorksCount++;
        }
      }

      log("\n✅ 扩展 Demo 数据填充完成！");
      log(`   - ${newMuseumIds.length} 个新博物馆`);
      log(`   - ${newCollectionIds.length} 个新征集项目`);
      log(`   - ${newDesignerIds.length} 个新设计师`);
      log(`   - ${newWorksCount} 件新作品`);

      return res.json({ success: true, logs });
    } catch (err: any) {
      log(`❌ 错误: ${err.message}`);
      return res.status(500).json({ success: false, error: err.message, logs });
    } finally {
      if (connection) await connection.end();
    }
  });
}

// This is intentionally left empty - the update-downloads route is registered separately
