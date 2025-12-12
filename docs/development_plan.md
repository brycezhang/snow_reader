# Snow Reader 开发计划

## 项目概述

Snow Reader 是一款面向英文阅读与学习的电子书/网页阅读器，包含：
- **Web 应用**：Vue 3 + Vite + PWA，支持 EPUB 阅读、离线功能
- **Chrome 插件**：Manifest V3，支持网页划词、行内注释、高亮
- **后端 API**：Express + TypeScript + PostgreSQL + Redis

---

## 一、MVP 阶段（聚焦核心功能）

> **MVP 策略**：不实现用户认证，默认单用户本地模式。聚焦 EPUB 阅读 + 词汇级别注释两大核心功能。

### 第 1 周：EPUB 阅读器核心 ⬅️ 当前

#### 1.1 EPUB 加载与渲染
- [ ] 集成 epub.js 实现 EPUB 解析与渲染
- [ ] 双页/单页阅读布局
- [ ] 章节内容提取与分页
- [ ] 翻页控制（键盘/点击/滑动）

#### 1.2 左侧边栏
- [ ] 书籍信息展示（书名、作者）
- [ ] 章节目录（TOC）导航
- [ ] 配色方案切换（Green Calm / Vintage Brown / Teal Modern / Mint Paper）
- [ ] 词汇注释级别选择器

#### 1.3 词汇级别注释
- [ ] 词汇分级数据（基础词汇/高级词汇/专业词汇/其他词汇）
- [ ] 根据用户选择的级别过滤需要注释的单词
- [ ] 行内中文注释渲染（单词上方小字显示释义）
- [ ] 注释级别实时切换

---

### 第 2 周：阅读体验完善

#### 2.1 阅读偏好
- [ ] 字号/行距/边距调节
- [ ] 阅读进度保存（localStorage）
- [ ] 阅读位置恢复

#### 2.2 词典增强
- [ ] 点击单词查看详细释义弹窗
- [ ] 词形变化显示
- [ ] 例句展示

#### 2.3 书架管理
- [ ] EPUB 文件上传
- [ ] 书架展示
- [ ] 最近阅读

---

### 第 3 周：功能扩展（可选）

#### 3.1 高亮与笔记
- [ ] 选中文本高亮
- [ ] 添加笔记
- [ ] 高亮/笔记列表

#### 3.2 生词本
- [ ] 添加生词
- [ ] 生词列表
- [ ] 掌握度标记

#### 3.3 Chrome 插件（基础版）
- [ ] 网页划词查词
- [ ] 行内注释

---

## 二、Beta 阶段（二期）

### 翻译功能
- [ ] LibreTranslate 集成
- [ ] 段落翻译 UI
- [ ] 翻译结果缓存
- [ ] Provider 切换机制

### 统计与复习
- [ ] 阅读统计面板
- [ ] 查词频率统计
- [ ] 生词复习（间隔重复）
- [ ] 每日/每周报告

### 文章阅读
- [ ] 文章书架管理
- [ ] 文章阅读器
- [ ] 与 EPUB 统一的学习功能

### 高级功能
- [ ] PDF 支持（pdf.js）
- [ ] 更多主题与自定义
- [ ] 多端同步优化
- [ ] 社区/协作功能

---

## 三、技术栈清单

### 前端（Web）
| 分类 | 技术 |
|------|------|
| 框架 | Vue 3.5 + Composition API |
| 构建 | Vite 6 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 样式 | TailwindCSS 3.4 |
| PWA | vite-plugin-pwa |
| EPUB | Readium Web Navigator |
| HTTP | fetch / axios |

### Chrome 插件
| 分类 | 技术 |
|------|------|
| 规范 | Manifest V3 |
| 语言 | TypeScript 5.7 |
| 构建 | Vite + Rollup |
| 存储 | chrome.storage |

### 后端
| 分类 | 技术 |
|------|------|
| 运行时 | Node.js 20+ |
| 框架 | Express 4 |
| 数据库 | PostgreSQL + Prisma |
| 缓存 | Redis (ioredis) |
| 认证 | JWT (jsonwebtoken) |
| 验证 | Zod |
| 文件 | S3 兼容存储 |

### 共享包
| 包名 | 职责 |
|------|------|
| @snow-reader/reader-core | Readium 集成、位置定位、装饰 |
| @snow-reader/nlp-core | 分词、词形还原、词典/翻译 Provider |

---

## 四、目录结构

```
snow-reader/
├── apps/
│   ├── web/                    # Vue Web 应用
│   │   ├── src/
│   │   │   ├── components/     # 通用组件
│   │   │   ├── views/          # 页面视图
│   │   │   ├── stores/         # Pinia stores
│   │   │   ├── router/         # 路由配置
│   │   │   ├── styles/         # 全局样式
│   │   │   ├── types/          # TypeScript 类型
│   │   │   └── utils/          # 工具函数
│   │   └── ...
│   └── extension/              # Chrome 插件
│       ├── src/
│       │   ├── background/     # Service Worker
│       │   ├── content/        # Content Script
│       │   ├── popup/          # 弹窗页面
│       │   ├── sidepanel/      # 侧边栏
│       │   ├── services/       # API 服务
│       │   └── types/          # 类型定义
│       └── manifest.json
├── services/
│   └── api/                    # 后端 API
│       ├── src/
│       │   ├── routes/         # 路由处理
│       │   ├── middleware/     # 中间件
│       │   ├── services/       # 业务服务
│       │   └── lib/            # 工具库
│       └── prisma/             # 数据库 Schema
├── packages/
│   ├── reader-core/            # 阅读核心
│   └── nlp-core/               # NLP 核心
├── docs/                       # 文档
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## 五、启动指南

### 环境要求
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 14
- Redis >= 6

### 安装依赖
```bash
pnpm install
```

### 数据库初始化
```bash
# 复制环境变量
cp services/api/.env.example services/api/.env
# 编辑 .env 配置数据库连接

# 运行迁移
pnpm --filter @snow-reader/api db:migrate
```

### 启动开发服务
```bash
# 启动 Web 应用 (http://localhost:3000)
pnpm dev:web

# 启动 API 服务 (http://localhost:4000)
pnpm dev:api

# 构建 Chrome 插件
pnpm build:extension
```

---

## 六、里程碑节点

| 里程碑 | 目标 | 预计完成 |
|--------|------|----------|
| M1 | 项目框架搭建完成 | Week 1 ✅ |
| M2 | 用户系统与基础 API | Week 2 |
| M3 | EPUB 阅读器可用 | Week 4 |
| M4 | 词典与生词本功能 | Week 6 |
| M5 | Chrome 插件可用 | Week 7 |
| M6 | MVP 完成，PWA 离线 | Week 8 |

---

## 七、风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| Readium Web 集成复杂 | 阅读器进度延迟 | 预留缓冲时间，准备降级方案 |
| EPUB 兼容性问题 | 部分书籍显示异常 | 单页滚动降级，记录问题书籍 |
| 词典数据质量 | 释义不准确 | 多源融合，用户可切换详略 |
| 插件性能问题 | 页面卡顿 | 视口增量处理，提供低负载模式 |
| 离线包体积 | 下载时间长 | 分档提供，支持断点续传 |

---

## 八、下一步行动

1. **立即**：安装依赖，验证项目可运行
2. **本周**：完成用户认证系统
3. **下周**：开始 Readium Web 集成调研

```bash
# 验证项目
cd /Users/bryce/workspace/snow_reader
pnpm install
pnpm dev:web
```
