# AGENTS.md

## 项目简介

本项目是基于 **Vue Vben Admin v5.7.0** 定制的 **MES（制造执行系统）**，采用 Monorepo 架构，支持多应用开发。主要面向制造业的生产管理、质量管理、仓储管理、设备管理等业务场景。

## 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite |
| 开发语言 | TypeScript |
| 包管理 | pnpm (workspace) + Turbo |
| UI 组件库 | Ant Design Vue |
| 表格组件 | VXE Grid |
| 图表组件 | AntV G2 |
| 状态管理 | Pinia |
| 代码检查 | ESLint + OxLint |
| 格式化 | Prettier + oxfmt |
| 国际化 | vue-i18n |

## 项目结构

```
apps/
├── mes/          # MES 主应用（当前开发重点）
├── ipc/          # IPC 桌面端应用
├── web-antd/     # Ant Design Vue 示例
├── web-ele/      # Element Plus 示例
├── web-naive/    # Naive UI 示例
├── web-tdesign/  # TDesign 示例
└── backend-mock/ # 后端模拟服务

packages/         # 共享包（@core、@vben/*）
```

## MES 应用（apps/mes）核心业务模块

| 模块 | 说明 |
|------|------|
| 生产管理 | 计划管理、工单管理、生产报表、SMT 管理 |
| 质量管理 | 质量检验、缺陷管理、不良品分析 |
| 仓储管理 | 物料管理、库存管理、标签管理 |
| 设备管理 | 设备监控、维护维修、点检记录 |
| 能源管理 | 能耗分析、碳排放管理 |
| 安全管理 | 事故管理、隐患管理、风险管理 |
| 工艺管理 | 工艺路线、作业配方、SOP 管理 |
| 追溯管理 | 产品追溯、批次追溯 |

## 常用命令

```bash
# 开发
pnpm dev:mes          # 启动 MES 开发服务器

# 构建
pnpm build:mes        # 构建 MES 应用

# 检查
pnpm check:type       # 类型检查
pnpm lint             # 代码检查
pnpm format           # 代码格式化
```

## 开发规范

### API 层

- 各子项目的 API 服务文件位于各自目录下，按业务模块组织：
  - MES: `apps/mes/src/api/`
  - IPC: `apps/ipc/src/api/`
  - 通用模式：`apps/{app}/src/api/`
- 请求封装基于各自项目的 `#/api/request.ts`
- 统一从 `#/api` 导出

### 国际化

- 各子项目的语言包位于各自目录下：
  - MES: `apps/mes/src/locales/langs/{zh-CN,en-US,ko-KR}/`
  - IPC: `apps/ipc/src/locales/langs/{zh-CN,en-US,ko-KR}/`
  - 通用模式：`apps/{app}/src/locales/langs/{语言}/`
- 按页面/模块拆分 JSON 文件
- 模板中使用 `$t('moduleName.key')` 引用

### Git 提交

- 遵循 Angular 提交规范：`<type>(<scope>): <subject>`
- 类型：feat / fix / refactor / style / chore / perf / docs / test
- Scope 使用 `@vben/mes` 或 `@vben/ipc` 等
- 当 pre-commit 钩子因历史遗留问题（非本次变更）报错时，使用 `--no-verify` 跳过

### 代码风格

- 优先使用 `.then()` 链式调用，而非 `async/await`
- Vue 组件使用 `<script setup>` 语法
- 表格组件使用 `useVbenVxeGrid` 封装
- 组件 import 按外部库 → 内部模块 → 相对路径排序

### 代码注释

- 组件或模块开发完成后，需调用 **"代码注释"** 技能为变更的文件添加规范注释
- 注释包括：文件头注释（L3 级别）和函数 JSDoc 注释（参数、返回值、异常、@since 时间）
