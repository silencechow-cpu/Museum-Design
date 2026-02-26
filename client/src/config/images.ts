/**
 * 图片资源配置文件
 * 集中管理网站所有图片URL，方便统一查看和替换
 */

export const images = {
  // Logo相关
  logo: {
    main: '/brand/logo.png',
    description: '古韵新创主Logo（透明背景）',
  },

  // 首页横幅轮播图（5个广告位）
  // 使用 Unsplash 免版权高清图片，与数据库 Banner 管理保持一致
  heroBanners: [
    {
      url: 'https://images.unsplash.com/photo-1592356483175-5ed72a5e1443?w=1920&q=80&auto=format&fit=crop',
      title: '青铜器文创设计征集',
      description: '探索三千年青铜文明，为传统纹饰注入现代创意',
    },
    {
      url: 'https://images.unsplash.com/photo-1613306817574-7e31e63d4364?w=1920&q=80&auto=format&fit=crop',
      title: '宋代瓷器美学传承',
      description: '以宋瓷之美为灵感，创作当代生活美学作品',
    },
    {
      url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1920&q=80&auto=format&fit=crop',
      title: '丝绸之路文化创意',
      description: '丝路千年，织就东西方文化交融的创意画卷',
    },
    {
      url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=1920&q=80&auto=format&fit=crop',
      title: '书法艺术现代演绎',
      description: '传承汉字之美，探索书法艺术的当代表达',
    },
    {
      url: 'https://images.unsplash.com/photo-1702569919435-e691990a99c4?w=1920&q=80&auto=format&fit=crop',
      title: '玉器文化创新设计',
      description: '玉见千年，以现代设计语言诠释玉文化精髓',
    },
  ],

  // 征集版块背景
  collectionsBackground: {
    url: '/banners/bg-collections.jpg',
    description: '征集版块背景图',
  },

  // 征集项目示例图片（博物馆文物）
  collectionItems: [
    {
      id: 1,
      url: '/artifacts/artifact1.jpg',
      title: '商代青铜鼎',
      museum: '国家博物馆',
    },
    {
      id: 2,
      url: '/artifacts/artifact2.jpg',
      title: '周代青铜器',
      museum: '陕西历史博物馆',
    },
    {
      id: 3,
      url: '/artifacts/artifact3.jpg',
      title: '汉代青瓷瓶',
      museum: '故宫博物院',
    },
    {
      id: 4,
      url: '/artifacts/artifact4.jpg',
      title: '商代青铜礼器',
      museum: '首都博物馆',
    },
    {
      id: 5,
      url: '/artifacts/artifact5.jpg',
      title: '春秋青铜尊',
      museum: '上海博物馆',
    },
    {
      id: 6,
      url: '/artifacts/artifact6.jpg',
      title: '清代珐琅瓷瓶',
      museum: '湖北省博物馆',
    },
  ],

  // 征集详情页多图示例
  collectionDetailImages: {
    1: [
      '/artifacts/artifact1.jpg',
      '/artifacts/artifact2.jpg',
      '/artifacts/artifact3.jpg',
    ],
  },

  // 作品展示版块背景
  worksBackground: {
    url: '/banners/bg-works.jpg',
    description: '作品展示版块背景图',
  },

  // 设计作品示例图片（文创产品）
  designWorks: [
    {
      id: 1,
      url: '/creative-products/product1.jpg',
      title: '博物馆文创周边',
      designer: '故宫博物院',
    },
    {
      id: 2,
      url: '/creative-products/product2.jpg',
      title: '文创文具礼盒',
      designer: '国家博物馆',
    },
    {
      id: 3,
      url: '/creative-products/product3.jpg',
      title: '博物馆纪念品',
      designer: '中国美术学院',
    },
    {
      id: 4,
      url: '/creative-products/product4.jpg',
      title: '博物馆文创周边',
      designer: '北京工业大学',
    },
    {
      id: 5,
      url: '/creative-products/product5.jpg',
      title: '文创产品展示',
      designer: '王芳设计师',
    },
    {
      id: 6,
      url: '/creative-products/product6.jpg',
      title: '国潮文创礼盒',
      designer: '中央美术学院',
    },
  ],

  // 入驻版块背景
  joinBackground: {
    url: '/banners/bg-join.jpg',
    description: '入驻版块背景图',
  },

  // 占位图片（用于开发测试）
  placeholder: {
    artifact: '/artifacts/artifact1.jpg',
    design: '/creative-products/product1.jpg',
    museum: '/artifacts/artifact2.jpg',
  },
};

// 导出类型定义
export type ImageConfig = typeof images;
