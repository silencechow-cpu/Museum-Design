/**
 * 数据库 Seed 脚本
 * 填充博物馆、征集项目、设计师和作品的 demo 数据
 */
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL!;

async function seed() {
  console.log('🌱 开始填充 Demo 数据...');
  
  // 解析 DATABASE_URL
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });

  try {
    // ============ 1. 创建博物馆用户账号 ============
    console.log('📦 创建博物馆用户...');
    const museumUsers = [
      { openId: 'demo_museum_001', name: '故宫博物院', role: 'museum' },
      { openId: 'demo_museum_002', name: '国家博物馆', role: 'museum' },
      { openId: 'demo_museum_003', name: '上海博物馆', role: 'museum' },
      { openId: 'demo_museum_004', name: '苏州博物馆', role: 'museum' },
      { openId: 'demo_museum_005', name: '陕西历史博物馆', role: 'museum' },
    ];

    const museumUserIds: number[] = [];
    for (const u of museumUsers) {
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE openId = ?', [u.openId]
      ) as any;
      if (existing.length > 0) {
        museumUserIds.push(existing[0].id);
        console.log(`  ✓ 用户已存在: ${u.name} (id=${existing[0].id})`);
      } else {
        const [result] = await connection.execute(
          'INSERT INTO users (openId, name, role) VALUES (?, ?, ?)',
          [u.openId, u.name, u.role]
        ) as any;
        museumUserIds.push(result.insertId);
        console.log(`  ✓ 创建用户: ${u.name} (id=${result.insertId})`);
      }
    }

    // ============ 2. 创建博物馆资料 ============
    console.log('🏛️  创建博物馆资料...');
    const museums = [
      {
        userId: museumUserIds[0],
        name: '故宫博物院',
        description: '故宫博物院建立于1925年10月10日，位于北京故宫紫禁城内，是中国最大的古代文化艺术博物馆，其文物收藏主要来源于清代宫廷旧藏。',
        address: '北京市东城区景山前街4号',
        logo: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=200&h=200&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=400&fit=crop',
        contactEmail: 'info@dpm.org.cn',
        website: 'https://www.dpm.org.cn',
        verified: 1,
      },
      {
        userId: museumUserIds[1],
        name: '中国国家博物馆',
        description: '中国国家博物馆位于北京天安门广场东侧，是以历史与艺术为主，系统展示中华民族悠久历史和灿烂文化的综合性博物馆。',
        address: '北京市东城区东长安街16号',
        logo: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=200&h=200&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=400&fit=crop',
        contactEmail: 'info@chnmuseum.cn',
        website: 'https://www.chnmuseum.cn',
        verified: 1,
      },
      {
        userId: museumUserIds[2],
        name: '上海博物馆',
        description: '上海博物馆是一座大型中国古代艺术博物馆，馆藏文物近百万件，其中珍贵文物12万余件，素有"文物精品与文化财富宝库"之誉。',
        address: '上海市黄浦区人民大道201号',
        logo: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=200&h=200&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=400&fit=crop',
        contactEmail: 'info@shanghaimuseum.net',
        website: 'https://www.shanghaimuseum.net',
        verified: 1,
      },
      {
        userId: museumUserIds[3],
        name: '苏州博物馆',
        description: '苏州博物馆由贝聿铭设计，是一座集现代化馆舍建筑、古建筑与创新山水园林三位一体的综合性博物馆，馆藏文物4万余件。',
        address: '江苏省苏州市姑苏区东北街204号',
        logo: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=200&h=200&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=400&fit=crop',
        contactEmail: 'info@szmuseum.com',
        website: 'https://www.szmuseum.com',
        verified: 1,
      },
      {
        userId: museumUserIds[4],
        name: '陕西历史博物馆',
        description: '陕西历史博物馆是中国第一座大型现代化国家级博物馆，被誉为"华夏宝库"，馆藏文物171万余件，上起远古人类初始阶段使用的简单石器，下至1840年前社会生活中的各类器物。',
        address: '陕西省西安市雁塔区小寨东路91号',
        logo: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=200&h=200&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&h=400&fit=crop',
        contactEmail: 'info@sxhm.com',
        website: 'https://www.sxhm.com',
        verified: 1,
      },
    ];

    const museumIds: number[] = [];
    for (const m of museums) {
      const [existing] = await connection.execute(
        'SELECT id FROM museums WHERE userId = ?', [m.userId]
      ) as any;
      if (existing.length > 0) {
        museumIds.push(existing[0].id);
        console.log(`  ✓ 博物馆已存在: ${m.name} (id=${existing[0].id})`);
      } else {
        const [result] = await connection.execute(
          'INSERT INTO museums (userId, name, description, address, logo, coverImage, contactEmail, website, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [m.userId, m.name, m.description, m.address, m.logo, m.coverImage, m.contactEmail, m.website, m.verified]
        ) as any;
        museumIds.push(result.insertId);
        console.log(`  ✓ 创建博物馆: ${m.name} (id=${result.insertId})`);
      }
    }

    // ============ 3. 创建征集项目 ============
    console.log('📋 创建征集项目...');
    const futureDate = (daysFromNow: number) => {
      const d = new Date();
      d.setDate(d.getDate() + daysFromNow);
      return d.toISOString().slice(0, 19).replace('T', ' ');
    };

    const collections = [
      {
        museumId: museumIds[0],
        title: '故宫青铜器文创设计征集',
        description: '以故宫馆藏商周青铜器为灵感，征集融合传统纹样与现代审美的文创产品设计方案，包括但不限于文具、家居、饰品等品类。',
        artifactName: '商代青铜鼎',
        artifactDescription: '商代晚期青铜礼器，通高122厘米，重832.84千克，是迄今世界上出土最大、最重的青铜礼器，享有"镇国之宝"的美誉。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop',
        ]),
        requirements: '1. 设计需体现青铜器纹样的文化内涵；2. 产品需具有实用性；3. 提交效果图及设计说明；4. 作品需为原创，未在其他平台发布。',
        prize: '一等奖：¥50,000；二等奖：¥20,000；三等奖：¥10,000；优秀奖（5名）：¥2,000',
        prizeAmount: 50000,
        deadline: futureDate(90),
        status: 'active',
      },
      {
        museumId: museumIds[0],
        title: '清明上河图文创衍生品设计',
        description: '以北宋张择端《清明上河图》为蓝本，征集创意文创衍生品设计，将千年名画中的市井生活与现代生活方式相结合。',
        artifactName: '清明上河图（局部）',
        artifactDescription: '北宋风俗画，北宋画家张择端仅见的存世精品，属国宝级文物。生动记录了中国十二世纪北宋都城东京（又称汴京，今河南开封）的城市面貌和当时社会各阶层人民的生活状况。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop',
        ]),
        requirements: '1. 设计需提取画作中的经典元素；2. 产品形式不限；3. 需附设计理念说明；4. 鼓励系列化设计。',
        prize: '一等奖：¥30,000；二等奖：¥15,000；三等奖：¥8,000',
        prizeAmount: 30000,
        deadline: futureDate(60),
        status: 'active',
      },
      {
        museumId: museumIds[1],
        title: '后母戊鼎文创设计大赛',
        description: '以国家博物馆镇馆之宝后母戊鼎为主题，面向全国设计师征集文创产品设计方案，弘扬中华青铜文明。',
        artifactName: '后母戊鼎',
        artifactDescription: '商代晚期青铜礼器，因鼎腹内壁铸有"后母戊"三字铭文而得名，是中国目前已发现的最大、最重的青铜器，被誉为"国之重器"。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        ]),
        requirements: '1. 以后母戊鼎造型或纹饰为核心设计元素；2. 产品需具有传播中华文化的价值；3. 提交完整设计方案。',
        prize: '特等奖：¥100,000；一等奖：¥50,000；二等奖：¥20,000',
        prizeAmount: 100000,
        deadline: futureDate(120),
        status: 'active',
      },
      {
        museumId: museumIds[2],
        title: '上海博物馆玉器文创征集',
        description: '以上海博物馆馆藏历代玉器为主题，征集融合玉文化精髓的现代文创产品设计，传承"君子比德于玉"的中华传统美德。',
        artifactName: '良渚玉琮',
        artifactDescription: '良渚文化代表性器物，距今约5000年，是中国最早的玉器之一，体现了良渚先民高超的玉器制作技艺和深厚的宗教信仰。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&h=600&fit=crop',
        ]),
        requirements: '1. 设计需体现玉文化的精神内涵；2. 鼓励使用环保材料；3. 产品需具有实用性或观赏性。',
        prize: '一等奖：¥40,000；二等奖：¥20,000；三等奖：¥10,000；入围奖（10名）：¥1,000',
        prizeAmount: 40000,
        deadline: futureDate(75),
        status: 'active',
      },
      {
        museumId: museumIds[3],
        title: '苏州博物馆园林文创设计',
        description: '以苏州园林文化为主题，结合苏州博物馆贝聿铭建筑风格，征集融合传统与现代的文创产品设计方案。',
        artifactName: '明代吴门画派作品',
        artifactDescription: '明代中期以苏州为中心形成的绘画流派，以沈周、文徵明、唐寅、仇英为代表，画风清新雅致，对后世影响深远。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop',
        ]),
        requirements: '1. 设计需融入苏州园林或吴文化元素；2. 鼓励与现代生活方式结合；3. 产品需具有苏州地域特色。',
        prize: '一等奖：¥25,000；二等奖：¥12,000；三等奖：¥6,000',
        prizeAmount: 25000,
        deadline: futureDate(45),
        status: 'active',
      },
      {
        museumId: museumIds[4],
        title: '唐三彩文创创意设计大赛',
        description: '以陕西历史博物馆馆藏唐三彩为主题，征集展现盛唐风貌的文创产品设计，让千年唐风焕发新生。',
        artifactName: '唐三彩骆驼载乐俑',
        artifactDescription: '唐代陶器，以黄、绿、白三色为主，是唐代工艺美术的杰出代表。骆驼载乐俑生动展现了丝绸之路上胡汉文化交融的历史画卷。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=600&fit=crop',
        ]),
        requirements: '1. 设计需体现唐代文化特色；2. 可以是实物产品或数字文创；3. 需附设计说明及市场分析。',
        prize: '一等奖：¥60,000；二等奖：¥30,000；三等奖：¥15,000；优秀奖（8名）：¥3,000',
        prizeAmount: 60000,
        deadline: futureDate(100),
        status: 'active',
      },
    ];

    const collectionIds: number[] = [];
    for (const c of collections) {
      const [existing] = await connection.execute(
        'SELECT id FROM collections WHERE title = ? AND museumId = ?', [c.title, c.museumId]
      ) as any;
      if (existing.length > 0) {
        collectionIds.push(existing[0].id);
        console.log(`  ✓ 征集项目已存在: ${c.title} (id=${existing[0].id})`);
      } else {
        const [result] = await connection.execute(
          'INSERT INTO collections (museumId, title, description, artifactName, artifactDescription, images, requirements, prize, prizeAmount, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [c.museumId, c.title, c.description, c.artifactName, c.artifactDescription, c.images, c.requirements, c.prize, c.prizeAmount, c.deadline, c.status]
        ) as any;
        collectionIds.push(result.insertId);
        console.log(`  ✓ 创建征集项目: ${c.title} (id=${result.insertId})`);
      }
    }

    // ============ 4. 创建设计师用户 ============
    console.log('🎨 创建设计师用户...');
    const designerUsers = [
      { openId: 'demo_designer_001', name: '林晓雨', role: 'designer' },
      { openId: 'demo_designer_002', name: '陈明轩', role: 'designer' },
      { openId: 'demo_designer_003', name: '王思远', role: 'designer' },
      { openId: 'demo_designer_004', name: '张雅婷', role: 'designer' },
      { openId: 'demo_designer_005', name: '李浩然', role: 'designer' },
    ];

    const designerUserIds: number[] = [];
    for (const u of designerUsers) {
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE openId = ?', [u.openId]
      ) as any;
      if (existing.length > 0) {
        designerUserIds.push(existing[0].id);
      } else {
        const [result] = await connection.execute(
          'INSERT INTO users (openId, name, role) VALUES (?, ?, ?)',
          [u.openId, u.name, u.role]
        ) as any;
        designerUserIds.push(result.insertId);
        console.log(`  ✓ 创建设计师用户: ${u.name} (id=${result.insertId})`);
      }
    }

    // ============ 5. 创建设计师资料 ============
    console.log('👤 创建设计师资料...');
    const designers = [
      {
        userId: designerUserIds[0],
        displayName: '林晓雨',
        bio: '清华大学美术学院视觉传达设计专业，专注于传统文化与现代设计的融合创新，曾获多项国内外设计大奖。',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        type: 'individual',
        organization: '清华大学美术学院',
        skills: JSON.stringify(['品牌设计', '包装设计', '文创产品', '插画']),
      },
      {
        userId: designerUserIds[1],
        displayName: '陈明轩',
        bio: '中央美术学院工业设计专业，擅长将传统工艺与现代产品设计结合，作品多次入选国家级展览。',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        type: 'individual',
        organization: '中央美术学院',
        skills: JSON.stringify(['工业设计', '产品设计', '3D建模', '文创开发']),
      },
      {
        userId: designerUserIds[2],
        displayName: '王思远',
        bio: '自由设计师，10年文创设计经验，与多家知名博物馆合作，擅长将历史文物转化为现代生活美学产品。',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
        type: 'individual',
        organization: null,
        skills: JSON.stringify(['文创设计', '品牌策划', '插画创作', '手工艺']),
      },
      {
        userId: designerUserIds[3],
        displayName: '张雅婷',
        bio: '上海交通大学设计学院在读博士，研究方向为文化遗产数字化与创意转化，热衷于用设计讲述中国故事。',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        type: 'individual',
        organization: '上海交通大学设计学院',
        skills: JSON.stringify(['数字设计', 'UI/UX', '文化研究', '品牌设计']),
      },
      {
        userId: designerUserIds[4],
        displayName: '李浩然',
        bio: '北京服装学院艺术设计专业，专注于传统纹样在现代时尚中的应用，作品融合东方美学与当代设计语言。',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        type: 'individual',
        organization: '北京服装学院',
        skills: JSON.stringify(['服装设计', '纹样设计', '时尚文创', '传统工艺']),
      },
    ];

    const designerIds: number[] = [];
    for (const d of designers) {
      const [existing] = await connection.execute(
        'SELECT id FROM designers WHERE userId = ?', [d.userId]
      ) as any;
      if (existing.length > 0) {
        designerIds.push(existing[0].id);
      } else {
        const [result] = await connection.execute(
          'INSERT INTO designers (userId, displayName, bio, avatar, type, organization, skills) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [d.userId, d.displayName, d.bio, d.avatar, d.type, d.organization, d.skills]
        ) as any;
        designerIds.push(result.insertId);
        console.log(`  ✓ 创建设计师: ${d.displayName} (id=${result.insertId})`);
      }
    }

    // ============ 6. 创建作品 ============
    console.log('🖼️  创建作品...');
    const worksData = [
      {
        collectionId: collectionIds[0],
        designerId: designerIds[0],
        title: '鼎纹·生活系列',
        description: '以商代青铜鼎的饕餮纹为核心设计元素，提炼其几何抽象美感，应用于现代家居文具系列。包含笔记本、马克杯、书签等产品，以哑光黑与金色为主色调，呈现"古典·现代"的双重气质。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop',
        ]),
        tags: JSON.stringify(['青铜纹样', '家居文具', '国潮设计', '极简风格']),
        status: 'winner',
        viewCount: 2847,
        likeCount: 423,
      },
      {
        collectionId: collectionIds[1],
        designerId: designerIds[1],
        title: '汴京烟火·城市明信片',
        description: '从《清明上河图》中截取12个最具代表性的市井场景，以现代插画手法重新演绎，制作成系列明信片和海报。每张作品都附有原画位置标注和历史故事，让观者在欣赏中了解北宋城市生活。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=600&fit=crop',
        ]),
        tags: JSON.stringify(['清明上河图', '明信片', '插画', '宋代文化']),
        status: 'approved',
        viewCount: 1923,
        likeCount: 287,
      },
      {
        collectionId: collectionIds[2],
        designerId: designerIds[2],
        title: '国之重器·文房四宝套装',
        description: '以后母戊鼎的造型为灵感，设计一套融合商代青铜艺术的现代文房套装。笔筒取鼎足之稳，砚台借鼎腹之深，镇纸仿鼎耳之形，整套产品既有文化内涵，又具备实用功能。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        ]),
        tags: JSON.stringify(['文房四宝', '青铜器', '书房文化', '礼品套装']),
        status: 'approved',
        viewCount: 1456,
        likeCount: 198,
      },
      {
        collectionId: collectionIds[3],
        designerId: designerIds[3],
        title: '玉见·现代首饰系列',
        description: '以良渚玉琮的方圆相融造型为灵感，结合现代首饰设计语言，创作一系列轻奢首饰。项链、耳环、手链三件套，以925银为基材，局部镶嵌天然玉石，传递"君子如玉"的东方气质。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop',
        ]),
        tags: JSON.stringify(['玉文化', '首饰设计', '轻奢', '东方美学']),
        status: 'winner',
        viewCount: 3241,
        likeCount: 567,
      },
      {
        collectionId: collectionIds[4],
        designerId: designerIds[4],
        title: '园林·四时系列香薰',
        description: '以苏州园林"春夏秋冬"四季景致为主题，设计四款香薰产品。包装以园林窗格为造型，内含与四季对应的植物香型，让用户在家中感受苏州园林的诗意生活。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=600&fit=crop',
        ]),
        tags: JSON.stringify(['苏州园林', '香薰', '生活美学', '四季主题']),
        status: 'approved',
        viewCount: 1789,
        likeCount: 312,
      },
      {
        collectionId: collectionIds[5],
        designerId: designerIds[0],
        title: '盛唐·丝路风情手账套装',
        description: '以唐三彩骆驼载乐俑为主视觉，设计一套丝路风情手账套装。包含手账本、贴纸、印章、书签等，将唐代丝绸之路上的异域风情与现代文具设计相结合，让用户在记录生活的同时感受盛唐气象。',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop',
        ]),
        tags: JSON.stringify(['唐三彩', '丝绸之路', '手账', '文具套装']),
        status: 'approved',
        viewCount: 2103,
        likeCount: 389,
      },
    ];

    for (const w of worksData) {
      const [existing] = await connection.execute(
        'SELECT id FROM works WHERE title = ? AND designerId = ?', [w.title, w.designerId]
      ) as any;
      if (existing.length > 0) {
        console.log(`  ✓ 作品已存在: ${w.title}`);
      } else {
        await connection.execute(
          'INSERT INTO works (collectionId, designerId, title, description, images, tags, status, viewCount, likeCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [w.collectionId, w.designerId, w.title, w.description, w.images, w.tags, w.status, w.viewCount, w.likeCount]
        );
        console.log(`  ✓ 创建作品: ${w.title}`);
      }
    }

    console.log('\n✅ Demo 数据填充完成！');
    console.log(`   - ${museumIds.length} 个博物馆`);
    console.log(`   - ${collectionIds.length} 个征集项目（均为 active 状态）`);
    console.log(`   - ${designerIds.length} 个设计师`);
    console.log(`   - ${worksData.length} 件作品`);

  } finally {
    await connection.end();
  }
}

seed().catch(console.error);
