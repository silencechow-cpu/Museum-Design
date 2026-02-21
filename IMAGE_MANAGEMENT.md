# 图片资源管理说明

本文档说明如何管理和替换网站中的所有图片资源。

## 图片配置文件位置

所有图片URL集中管理在：`client/src/config/images.ts`

## 图片分类说明

### 1. Logo图片
- **位置**：`images.logo.main`
- **使用场景**：导航栏、页脚、加载页面
- **当前URL**：`https://s3.manus.space/manus-user-upload-v2/...`
- **说明**：古韵新创主Logo（透明背景PNG）

### 2. 首页横幅轮播图（5个广告位）
- **位置**：`images.heroBanners`（数组，包含5个元素）
- **使用场景**：首页顶部大横幅轮播
- **字段说明**：
  - `url`: 图片CDN地址
  - `title`: 文物名称
  - `description`: 文物描述

### 3. 征集版块图片
- **背景图**：`images.collectionsBackground.url`
- **征集项目图片**：`images.collectionItems`（数组）
  - 每个项目包含：`id`, `url`, `title`, `museum`
- **征集详情页多图**：`images.collectionDetailImages`
  - 按征集ID索引，每个征集可包含多张图片

### 4. 作品展示版块图片
- **背景图**：`images.worksBackground.url`
- **设计作品图片**：`images.designWorks`（数组）
  - 每个作品包含：`id`, `url`, `title`, `designer`

### 5. 入驻版块背景
- **位置**：`images.joinBackground.url`

### 6. 占位图片
- **位置**：`images.placeholder`
- **用途**：开发测试时的临时图片

## 如何替换图片

### 方法一：直接修改配置文件
1. 打开 `client/src/config/images.ts`
2. 找到要替换的图片URL
3. 将URL替换为新的CDN地址
4. 保存文件，网站会自动热更新

### 方法二：批量替换
如果需要替换多个图片，可以使用查找替换功能：
1. 在编辑器中打开 `client/src/config/images.ts`
2. 使用查找替换功能（Ctrl+H 或 Cmd+H）
3. 输入旧URL和新URL进行批量替换

## 图片要求

### 格式要求
- **Logo**：PNG格式，透明背景，建议尺寸 200x200px
- **横幅图**：JPG/PNG格式，建议尺寸 1920x1080px
- **征集文物图**：JPG/PNG格式，建议尺寸 800x800px
- **设计作品图**：JPG/PNG格式，建议尺寸 600x600px

### 存储要求
- **必须使用CDN外链**：所有图片必须上传到CDN并使用外链地址
- **禁止本地存储**：不要将图片文件放在项目目录中，会导致部署超时
- **推荐CDN服务**：
  - Manus CDN（已使用）：`https://s3.manus.space/...`
  - 其他CDN服务：阿里云OSS、腾讯云COS、七牛云等

## 上传图片到CDN

如果需要上传新图片到Manus CDN：
1. 将图片文件放到 `/home/ubuntu/webdev-static-assets/` 目录
2. 运行命令：`manus-upload-file /home/ubuntu/webdev-static-assets/your-image.png`
3. 复制返回的CDN URL
4. 将URL更新到 `client/src/config/images.ts` 配置文件中

## 使用图片配置的组件

以下组件已集成图片配置文件：
- `Navigation.tsx` - 导航栏Logo
- `HeroBanner.tsx` - 首页横幅轮播
- `LoadingScreen.tsx` - 加载页面Logo
- `Footer.tsx` - 页脚Logo

其他组件（CollectionsSection、WorksSection等）可以按需集成。

## 示例：替换Logo

```typescript
// 在 client/src/config/images.ts 中找到：
export const images = {
  logo: {
    main: 'https://s3.manus.space/old-logo.png',
    description: '古韵新创主Logo（透明背景）',
  },
  // ...
};

// 替换为新的URL：
export const images = {
  logo: {
    main: 'https://s3.manus.space/new-logo.png',
    description: '古韵新创主Logo（透明背景）',
  },
  // ...
};
```

保存后，所有使用Logo的地方（导航栏、页脚、加载页面）都会自动更新。

## 注意事项

1. **URL有效性**：确保新的图片URL可以正常访问
2. **图片尺寸**：保持与原图相近的尺寸比例，避免显示变形
3. **加载性能**：优化图片大小，建议使用WebP格式以提升加载速度
4. **备份原URL**：替换前建议备份原URL，以便需要时恢复
5. **测试验证**：替换后在浏览器中测试所有相关页面

## 技术支持

如有图片管理相关问题，请参考：
- 项目README: `/home/ubuntu/museum-creative-platform/README.md`
- 图片配置文件: `client/src/config/images.ts`
