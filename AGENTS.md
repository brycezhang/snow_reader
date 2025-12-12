# Snow Reader 代码协作指引（AGENTS）

本文件用于指导 AI/自动化 Agent 在本仓库内工作的方式与约束。其适用范围为整个仓库目录树。

## 1. 项目概览
- 产品：Snow Reader — Web 英文电子书/网页阅读与学习器 + Chrome 插件。
- 形态：Vue 3 Web 应用（iPad/桌面，PWA 支持离线阅读/离线词典）+ Chrome Manifest V3 插件（仅在线）。
- 阅读内核：Readium Web（EPUB3）。
- 学习能力：划词查词、行内注释、高亮/笔记、生词本、统计；网页端需可直接叠加学习装饰。
- 词典/翻译：免费/开源方案为主（在线聚合 API + Web 离线词典 + LibreTranslate 等翻译 Provider）。

## 2. 语言与技术栈约定
- 主要语言：TypeScript。
- 前端：Vue 3（Composition API）+ Vite + Pinia。
- 插件：Chrome Manifest V3 + TypeScript。
- 后端：Node.js（Express/NestJS，按仓库实际选择，保持模块化分层）。
- 数据：PostgreSQL；缓存 Redis；文件对象存储（S3/R2 兼容）。

## 3. 目录结构（后续落地时遵循）
- `apps/web/`：Vue Web 应用。
- `apps/extension/`：Chrome 插件（content/background/sidepanel）。
- `services/api/`：后端 BFF 与业务服务。
- `packages/reader-core/`：Readium 集成与跨端阅读核心。
- `packages/nlp-core/`：分词、lemma、词典/翻译 Provider 抽象。
- `docs/`：产品/技术/接口文档。

如实际结构不同，请优先跟随仓库现有组织方式。

## 4. 编码风格与规范
- 使用 ESLint + Prettier（若仓库中已有配置，以其为准）。
- 默认格式：
  - 2 空格缩进；单引号；末尾逗号遵循 Prettier。
  - 组件/文件命名：`PascalCase.vue`；工具/模块：`kebab-case.ts`。
  - 变量/函数：`camelCase`；常量：`UPPER_SNAKE_CASE`。
- Vue：
  - 统一使用 `<script setup lang="ts">`。
  - 组合式 API 优先；避免 Options API 混用。
  - 组件 props/emits 明确类型，避免 `any`。
- TypeScript：
  - 允许 `unknown`/泛型；避免裸 `any`。
  - 公共接口需在 `types/` 或模块内导出显式类型。
- 插件：
  - 避免全页一次性 DOM 重写；采用视口增量处理。
  - Content Script 与 Background 通过 message 通道交互，禁止直接在 content 中持有第三方密钥。
  - 插件不实现离线逻辑；仅允许短期缓存用于性能优化。

## 5. 业务与架构约束
- 阅读区与学习面板解耦：Readium Navigator 只负责渲染/定位；学习装饰通过 decorations/overlay 实现。
- 位置与高亮锚点：
  - EPUB 使用 CFI；
  - 网页使用 Range 序列化 + 容错（XPath/offset）。
- 在线时词典/翻译走自家后端聚合 API（防止 CORS/密钥泄露/不稳定）；离线时 Web 端直接查询本地词典。
- Web 需支持离线阅读与离线词典（PWA + Cache Storage/IndexedDB/OPFS）；插件不要求离线。

## 6. 测试与验证
- 若仓库配置了测试：
  - 前端单测：Vitest；
  - 插件与端到端：Playwright（或仓库现有工具）。
- Agent 改动后应优先运行与改动相关的最小测试集合，再考虑全量测试。
- 不修复与当前任务无关的失败测试；必要时在 PR/说明中注明。

## 7. 文档与交付
- 新增/修改核心模块需同步更新 `docs/` 下相关文档。
- 方案、接口、数据结构等变更要在文档中注明版本与日期。

## 8. 安全与合规
- 插件权限最小化；避免注入到非必要域名。
- 翻译/外部服务只发送用户选中片段；不上传整本书/整页正文。
- 使用 Wiktionary/CC-BY-SA 等数据时，遵循署名与 Share-Alike 要求（详见 `docs/tech_solution.md`）。

## 9. Agent 工作方式
- 遵循用户/系统指令优先级；避免无关重构。
- 每次变更保持小步、可回滚；提交清晰变更说明。
- 若任务涉及不确定的产品决策（如 UI/交互/术语），先向用户确认再实施。
