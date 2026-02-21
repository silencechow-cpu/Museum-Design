# 博物馆文创对接平台 - 功能规划与实现状态

## 一、用户系统

### 1.1 账户体系
- [x] OAuth登录（Manus OAuth）
- [x] 角色分配（museum/designer/admin）
- [x] 权限控制（基于role的路由和API保护）
- [x] 个人资料编辑（EditProfile页面）
- [x] 头像管理（头像上传功能）
- [ ] 社交账号绑定（待实现）

### 1.2 个人中心
- [x] 我的征集（Profile页面 - collections标签）
- [x] 我的作品（Profile页面 - works标签 + MyWorksManagement页面）
- [x] 我的收藏（Profile页面 - favorites标签）
- [ ] 我的评分（待实现）
- [x] 数据统计卡片（Profile页面顶部stats）

## 二、征集系统

### 2.1 发布管理
- [x] 发布征集（EditCollection页面 - 新建模式）
- [x] 编辑征集（EditCollection页面）
- [x] 图片管理（多图上传和删除）
- [x] 状态管理（draft/active/closed/completed）
- [ ] 自动截止逻辑（待实现 - 定时任务）

### 2.2 展示页
- [x] 多图轮播（CollectionDetail页面）
- [ ] 推荐征集（待实现 - 推荐算法）
- [x] 分享（分享按钮已存在）
- [x] 收藏（收藏功能已实现）
- [x] 作品列表排序（CollectionDetail页面）
- [ ] 评分显示（待实现）

## 三、作品系统

### 3.1 提交系统
- [x] 多图上传（MyWorksManagement页面 - 批量上传）
- [ ] 图片压缩（待实现 - 前端压缩）
- [ ] 草稿保存（待实现）
- [ ] 自动填充资料（待实现）

### 3.2 作品详情
- [x] 高清图（WorkDetail页面）
- [x] 灯箱（图片点击放大）
- [x] 标签（tags显示）
- [ ] 评分（待实现）
- [x] 分享（分享按钮）
- [ ] 相关作品推荐（待实现）

### 3.3 审核系统
- [x] 批量审核（AdminReviewWorks页面）
- [ ] 评分（待实现）
- [ ] 审核记录（待实现 - 审核历史）

## 四、互动系统（新增 - 全部待实现）

- [ ] 评论功能
  - [ ] 评论列表
  - [ ] 回复评论
  - [ ] 评论分页
- [ ] 举报功能
  - [ ] 举报评论
  - [ ] 举报作品
  - [ ] 举报处理
- [ ] 点赞功能
  - [ ] 作品点赞
  - [ ] 评论点赞
- [ ] 消息通知
  - [ ] 实时通知
  - [ ] 通知列表

## 五、通知系统（新增 - 全部待实现）

- [ ] 站内通知中心
  - [ ] 通知列表页面
  - [ ] 未读标记
  - [ ] 通知分类
- [ ] 新作品通知（征集有新作品提交）
- [ ] 审核结果通知（作品审核通过/拒绝）
- [ ] 获奖通知（作品获奖）
- [ ] 未读提醒（导航栏红点）

## 六、搜索与推荐系统（部分实现）

- [x] 关键词搜索（CollectionList、WorkList页面）
- [x] 多维筛选（状态、分类筛选）
- [ ] 无限滚动（待实现 - 当前是分页）
- [ ] 推荐算法优化（待实现）
  - [ ] 基于用户行为的推荐
  - [ ] 热门征集推荐
  - [ ] 相似作品推荐

## 七、管理后台（部分实现）

- [ ] 用户管理（待实现）
  - [ ] 用户列表
  - [ ] 用户禁用/启用
  - [ ] 角色修改
- [x] 作品审核（AdminReviewWorks页面）
- [ ] 举报管理（待实现）
- [ ] 征集管理（待实现 - 管理员视角）
- [ ] 数据总览（待实现 - Dashboard）

## 八、SEO与增长（全部待实现）

- [ ] sitemap生成
- [ ] 结构化数据（JSON-LD）
- [ ] 分享优化（Open Graph、Twitter Card）
- [ ] 热门榜单
- [ ] 活跃榜单

## 九、商业化预留（全部待实现）

- [ ] 会员体系
  - [ ] 会员等级
  - [ ] 会员权益
  - [ ] 会员中心
- [ ] 置顶推荐
  - [ ] 征集置顶
  - [ ] 作品推荐位
- [ ] 广告位管理
- [ ] 数据报告导出

---

## 实现优先级

### P0 - 核心功能缺失（立即实现）
1. 评分系统（作品评分、征集评分）
2. 自动截止逻辑（定时任务）
3. 图片压缩（前端优化）
4. 审核记录（审核历史追踪）

### P1 - 互动系统（高优先级）
1. 评论功能（评论、回复）
2. 点赞功能
3. 通知系统（站内通知）
4. 举报功能

### P2 - 搜索推荐（中优先级）
1. 无限滚动
2. 推荐算法
3. 相关作品推荐

### P3 - 管理后台（中优先级）
1. 用户管理
2. 举报管理
3. 数据总览Dashboard

### P4 - SEO与增长（低优先级）
1. sitemap
2. 结构化数据
3. 分享优化
4. 榜单系统

### P5 - 商业化预留（最低优先级）
1. 会员体系
2. 置顶推荐
3. 广告位管理
4. 数据报告导出

---

## 数据库Schema需求

### 新增表

#### ratings（评分表）
- id
- userId
- targetType (collection/work)
- targetId
- rating (1-5)
- createdAt

#### comments（评论表）
- id
- userId
- targetType (collection/work)
- targetId
- content
- parentId (回复)
- createdAt

#### likes（点赞表）
- id
- userId
- targetType (work/comment)
- targetId
- createdAt

#### notifications（通知表）
- id
- userId
- type (work_submitted/work_reviewed/work_won/comment_reply)
- title
- content
- targetType
- targetId
- read
- createdAt

#### reports（举报表）
- id
- reporterId
- targetType (work/comment/user)
- targetId
- reason
- status (pending/resolved/rejected)
- createdAt

### 现有表需要扩展

#### works表
- 添加 likesCount
- 添加 commentsCount
- 添加 averageRating

#### collections表
- 添加 averageRating
- 添加 viewsCount

#### users表
- 添加 memberLevel (normal/vip/premium)
- 添加 memberExpireAt
