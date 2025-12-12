# Snow Reader（Web + Chrome 插件）产品技术方案

## 1. 背景与目标
Snow Reader 是一款面向英文阅读与学习的电子书/网页阅读器。首发形态为**网页版（适配 iPad 与桌面）**，并配套**Chrome 浏览器插件**，实现对任意英文网页的行内注释、划词与高亮学习。

目标：
- 提供舒适的 EPUB 阅读体验（双页/分页、主题、目录、进度）。
- 在 EPUB 与网页阅读中提供一致的学习增强：划词查词、行内注释、例句/词形、笔记/高亮、生词本、统计。
- 支持**离线阅读与离线词典**（PWA 本地缓存），无网络时仍可阅读与查词。
- 词典与翻译方案以**免费/开源**为主，避免商业授权依赖。

非目标（MVP 不做）：
- 离线翻译/离线 LLM（离线时仅保留阅读与查词）。
- PDF/MOBI 等多格式深度兼容（可二期扩展）。

## 2. 核心功能范围

### 2.1 EPUB 阅读
- EPUB 导入/书架管理（上传/删除/最近阅读）。
- Readium Web 渲染、分页/双页阅读、字号/行距/边距/主题切换。
- 目录（TOC）与章节跳转、书签、阅读进度保存与同步。

### 2.2 英文学习增强（EPUB & 网页一致）
- 划词查词：弹窗显示英汉/英英释义、音标、词性、词形、例句、发音。
- 行内注释：在行内或词上方展示简短中文释义（可开关、可配置密度）。
- 高亮/下划线：多颜色、标签分类、导出。
- 笔记：挂载在高亮上，支持引用原文与自定义标签。
- 生词本：自动收集查询词，可手动加入/标记掌握程度。
- 统计：阅读时长、查词频率、词汇覆盖率、章节完成率。

### 2.3 网页阅读与 Chrome 插件
- 插件在任意英文网页中：
  - 对正文文本进行分词并包裹可交互 token，实现行内注释与高亮。
  - 支持划词/划句触发弹窗查词与段落翻译。
  - 一键“发送到 Snow Reader”将网页正文投递到 Web 应用进行沉浸式阅读与复习。
- Web 应用中：
  - “文章书架”管理投递内容，统一样式与学习功能。

### 2.4 段落/划词翻译
- 划词翻译：对单词/短语返回直译与上下文解释。
- 段落翻译：对选中句子/段落返回中文翻译与简明要点。
- 采用可插拔 Provider：默认免费/开源翻译服务，允许后续接入付费/LLM。

### 2.5 离线阅读与离线词典（Web 端）
- 书籍/文章支持“下载离线包”，无网络时可在 Web 端继续阅读与定位。
- 离线词典：基础英汉/英英释义在本地可查询；联网时自动切换到在线聚合以获得更完整结果。
- 插件端不提供离线能力，需在线查词/翻译。

## 3. 总体架构

### 3.1 组件划分
1) **Web 应用（Vue）**
- 负责 UI、书架、阅读区容器、学习面板、生词/笔记/统计页。
- EPUB 阅读区内嵌 Readium Web Navigator（iframe 或 Web Component）。
- 作为 PWA 提供离线缓存：应用壳、离线书籍/文章资源、离线词典文件与索引。

2) **Chrome 插件（Manifest V3）**
- Content Script：注入到网页，抽取正文、分词、绘制行内注释/高亮、监听划选。
- Background Service Worker：鉴权、与后端 API 通信、队列/重试、跨域 fetch。
- 可选 Side Panel：展示生词/笔记/翻译结果（不阻断阅读）。
- 插件不要求离线；仅做性能缓存（内存/extension storage）。

3) **后端 API（BFF + 业务服务）**
- 统一鉴权与数据 API（用户/书籍/文章/标注/生词/统计）。
- 词典聚合服务（自建开源词库 + 缓存）。
- 翻译服务（Provider 抽象 + 缓存）。
- EPUB 文件存储与 Readium Go Toolkit Publication 服务（可选）。

4) **数据存储**
- 结构化数据：PostgreSQL（或 Supabase/Postgres BaaS）。
- 文件/资源：对象存储（S3 兼容，如 Cloudflare R2 / Supabase Storage）。
- 缓存：Redis（查词/翻译/阅读位置热点）。
- Web 本地：Cache Storage + IndexedDB/OPFS（离线书籍/文章与词典）。

### 3.2 数据流概览
- **EPUB 上传**
  1. Web 上传 EPUB → 后端存储文件。
  2. 后端生成书籍元数据（title/author/cover/TOC）并入库。
  3. Readium Web 通过 Publication URL 流式加载并渲染。

- **EPUB 阅读**
  1. Readium Navigator 负责排版与分页。
  2. 阅读事件（位置/页码/选词/高亮）通过 message bridge 回传 Vue。
  3. Vue 调用后端保存位置、标注、生词等。

- **网页行内学习（插件）**
  1. Content Script 抽取正文（Readability 类算法），对可见段落做分词/词形还原。
  2. 对词 token 进行懒加载注释：视口内批量请求词典 API，结果缓存到内存与 extension storage。
  3. 用户划词/划句 → 插件调用词典/翻译 API → UI 弹窗/side panel 展示 → 可写入高亮/笔记。

- **网页投递到 Web**
  1. 用户点击投递 → 插件发送正文 HTML + 元信息到后端。
  2. 后端净化 HTML、入库为 Article。
  3. Web 端展示于“文章书架”，复用阅读与学习能力。

- **离线下载/阅读（Web）**
  1. 用户在书籍/文章页点击“下载离线”。
  2. Web 端通过 Service Worker 预取 publication 资源（EPUB zip 或解包资源）与必要媒体，写入 Cache Storage/OPFS。
  3. 断网时 Readium Navigator 的资源请求由 Service Worker 从本地缓存响应。

- **离线查词（Web）**
  1. 首次进入“离线词典”设置页下载词典包（默认精简包，可选完整包）。
  2. 词典包存入 OPFS/IndexedDB，并加载 wasm 查询引擎与索引。
  3. 无网络时前端直接本地查询；联网时优先在线聚合，并回填本地缓存。

## 4. 关键技术选型

### 4.1 前端（Web）
- 框架：**Vue 3 + Vite**（Composition API、生态成熟、性能好）。
- 语言：TypeScript（提升复杂交互与跨端模块可维护性）。
- 状态管理：Pinia（轻量、与 Vue3 配合好）。
- UI/样式：TailwindCSS 或 CSS 变量 + 自研主题系统（需支持多主题与阅读偏好）。
- 富文本/标注：使用 DOM Range + 自定义 decoration 层；避免依赖重型编辑器。
- 离线能力：
  - PWA（`vite-plugin-pwa`/Workbox 类方案）缓存应用壳。
  - 书籍/文章离线包存储：Cache Storage + IndexedDB/OPFS（大文件优先 OPFS）。
  - 离线优雅降级：无网时隐藏在线翻译入口，仅保留本地阅读/查词。

### 4.2 EPUB 阅读（Readium Web）
- 使用 **Readium Web Toolkit（TypeScript Navigator）**：
  - 提供 EPUB3 兼容渲染、导航、偏好、decorations 能力。
  - 通过 iframe 嵌入 Navigator，宿主 Vue 与 Navigator 通过 postMessage 交互：
    - 宿主下发：主题/字号/边距/行距/页宽偏好、跳转 CFI、装饰（高亮/注释）。
    - Navigator 上报：当前位置 CFI、分页信息、选中文本范围、点击事件。
- 阅读位置锚定：使用 EPUB CFI 作为唯一定位，主题/字号变化后仍可复位。

### 4.3 Chrome 插件（MV3）
- Manifest V3（必选）。
- 技术栈：TypeScript + Vite/rollup 构建，content/background 分包。
- 关键能力：
  - Content Script：DOM 遍历 + TextNode 分割；对段落按需 token 化，避免全页一次性改写导致卡顿。
  - 高亮锚点：记录 XPath/文本偏移或基于 Range 的序列化（必要时做容错）。
  - 跨域请求与鉴权：由 background SW 统一 fetch，content 通过 message 调用。
- 离线：插件不支持离线阅读/词典/翻译；仅做短期缓存提升交互速度。

### 4.4 词典（免费/开源）
原则：**在线聚合 + Web 离线本地双模式**。
- 英汉基础库：**ECDICT（MIT）**，提供中文释义、例句、词频、词形字段。
- 英英补充：Wiktionary/Kaikki 抽取数据（需署名与 Share‑Alike 注意）。
- 语义关系：Open English WordNet（同义词/反义词/派生词）。
- 词形还原与分词：
  - 插件侧做轻量 tokenizer（用于行内交互与批量查词）。
  - 后端用更高质量 NLP（如 spaCy 或等价服务）做 lemma/POS，提升命中与释义排序。
- 离线词典实现（Web）：
  - 构建阶段将 ECDICT/Wiktionary 抽取为 SQLite 或压缩 JSON（两档：精简高频包、完整包）。
  - 前端使用 `sqlite-wasm`/`sql.js` 或等价 wasm 引擎在本地查询，词典文件存 OPFS。
  - 版本化更新：在线检测词典版本，用户确认后增量下载替换。
- 在线词典实现（Web/插件）：
  - Web 在线时与插件统一调用后端聚合 API；后端做多源融合与缓存。

### 4.5 翻译（免费/开源）
采用 Provider 抽象，默认走开源/免费方案：
- **自建 LibreTranslate**（开源、REST API），作为默认划句/段落翻译服务。
- 结果按文本 hash 缓存（Redis + DB），减少成本与延迟。
- 预留第三方 Provider 接口（如 DeepL/Google/LLM），仅在合规前提下可配置启用。
- 离线模式下不提供翻译能力。

### 4.6 后端与部署
- 运行时：Node.js（与前端同栈，适合 BFF + 聚合）。
- 框架：NestJS/Express 任一（MVP 推荐 Express + 模块化分层）。
- 数据库：PostgreSQL。
- 文件：对象存储（R2/S3/Supabase Storage）。
- 部署：Docker + 云函数/容器（如 Fly.io/Render/Vercel serverless + 独立 DB）。

## 5. 数据模型（简要）
- User：账号、偏好、订阅状态。
- Book：metadata、cover、publication_url、import_source。
- Article：来源 URL、标题、净化后 HTML、阅读时长。
- ReadingPosition：user_id、book/article_id、cfi/anchor、updated_at。
- Highlight：范围锚点（cfi 或 xpath+offset）、颜色、标签。
- Note：highlight_id、文本、标签、created_at。
- VocabItem：lemma、display_word、book/article_id、熟练度、例句引用。
- LookupHistory：word/lemma、context_snippet、source、timestamp。
- StatsDaily：阅读分钟、查词次数、完成章节/文章数。

## 6. 交互与性能策略
- 行内注释采用**视口增量**：仅对可见段落分词与注释，滚动时批量预取下一屏。
- 查词/翻译做**去重合并与节流**：同一屏内的重复 lemma 只请求一次。
- 高亮/注释渲染与正文分离：使用 overlay/decoration 避免破坏 EPUB/网页原排版。
- 大章节/长网页采用虚拟滚动或分页模式，保证 iPad 流畅度。

## 7. 安全与合规
- 插件需最小权限：仅对当前页面注入与可选域名白名单。
- 传输安全：全站 HTTPS、token 存在 httpOnly cookie 或 extension storage。
- 第三方词典/翻译数据仅用于即时展示，不回传原书/全页正文到外部服务。
- Wiktionary 等 CC‑BY‑SA 数据若对外分发需保留署名与 Share‑Alike 说明。

## 8. 里程碑建议
**MVP（6–8 周）**
- Web：书架、EPUB 上传与阅读、主题/字号、目录、进度、划词查词、基础高亮/笔记、生词本、离线下载与离线查词。
- 后端：用户/书籍/标注/生词 API，ECDICT 查询与缓存，词典版本发布。
- 插件：正文抽取、行内 token 化、划词查词、高亮、投递到 Web（仅在线）。
- 翻译：接入 LibreTranslate Provider（段落翻译，在线）。

**Beta（二期）**
- 统计面板、复习/间隔重复。
- PDF 支持、更多主题与学习模式。
- 多端同步优化、协作/导出。

## 9. 风险与对策
- EPUB 兼容差异：优先 Readium Web；对异常书籍提供降级（单页滚动）。
- 网页 token 化性能：视口增量 + 缓存；提供“仅划词弹窗”低负载模式。
- 词典数据质量不一致：多源融合排序 + 置信度规则；允许用户切换“简洁/详细”。
- 免费翻译服务不稳定：缓存 + 重试 + 备用 Provider。
- 离线包体积与更新：提供精简/完整两档；OPFS 存储；可中断续传与版本回滚。

---
如需下一步，我可以基于此方案继续补一份更细的接口清单（API 列表、事件桥协议、前端路由/模块图）。  
