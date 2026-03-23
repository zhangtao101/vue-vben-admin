# 项目结构说明

## 项目简介

Vue Vben Admin 是一个基于 Vue 3、Vite、TypeScript 等主流技术栈开发的开源中后台管理系统模板,采用 Monorepo 架构,支持多应用开发。当前项目为定制化的 MES(制造执行系统)版本。

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **开发语言**: TypeScript
- **包管理**: pnpm (workspace)
- **UI组件库**: Ant Design Vue
- **表格组件**: VXE Grid
- **图表组件**: AntV G2
- **包管理工具**: Turbo (Monorepo构建工具)

## 项目版本

- **Vue Vben Admin**: 5.7.0
- **Node.js**: >=20.19.0
- **pnpm**: >=10.0.0

## 根目录结构

```
vue-vben-admin/
├── apps/                   # 应用程序目录(多个子应用)
├── packages/               # 共享包目录(Monorepo核心)
├── docs/                   # 文档目录
├── internal/              # 内部工具和配置
├── playground/             # 演示和测试环境
├── scripts/               # 构建和部署脚本
├── -p/                    # 临时目录
├── cspell.json           # 拼写检查配置
├── eslint.config.mjs      # ESLint代码检查配置
├── lefthook.yml          # Git钩子配置
├── LICENSE               # MIT许可证
├── oxfmt.config.ts       # 代码格式化配置
├── oxlint.config.ts      # 代码检查配置
├── package.json          # 项目依赖配置
├── pnpm-lock.yaml       # pnpm锁定文件
├── pnpm-workspace.yaml  # pnpm工作区配置
├── stylelint.config.mjs # 样式检查配置
├── tea.yaml             # TeaCI配置
├── turbo.json           # Turbo构建配置
├── vitest.config.ts     # 单元测试配置
└── README.md            # 项目说明文档
```

## apps/ 应用程序目录

包含多个子应用,每个应用都是一个独立的前端项目:

### 主要应用

1. **mes/** - MES制造执行系统(主应用)
   - 基于Vue Vben Admin开发的定制化MES系统
   - 包含生产管理、质量管理、仓储管理等核心业务

2. **backend-mock/** - 后端模拟服务
   - 用于前端开发的模拟后端服务
   - 提供API接口模拟

3. **web-antd/** - Ant Design Vue版本
   - 使用Ant Design Vue组件库的完整版应用

4. **web-antdv-next/** - Ant Design Vue Next版本
   - 使用Ant Design Vue最新版本的示例应用

5. **web-ele/** - Element Plus版本
   - 使用Element Plus组件库的应用

6. **web-naive/** - Naive UI版本
   - 使用Naive UI组件库的应用

7. **web-tdesign/** - TDesign版本
   - 使用腾讯TDesign组件库的应用

8. **ipc/** - IPC应用
   - 桌面端IPC通信相关应用

9. **my-ai/** - AI相关应用
   - 集成AI功能的应用

10. **playground/** - 演示和测试
    - 用于演示功能和测试新特性

---

## mes/ 应用详细结构

```
apps/mes/
├── src/
│   ├── adapter/          # 适配器层
│   ├── api/             # API接口层
│   ├── assets/          # 静态资源
│   ├── layouts/         # 布局组件
│   ├── locales/         # 国际化语言包
│   ├── router/          # 路由配置
│   ├── store/           # 状态管理
│   ├── util/            # 工具函数和公共组件
│   ├── views/           # 页面组件
│   ├── app.vue          # 根组件
│   ├── bootstrap.ts     # 应用启动文件
│   ├── main.ts          # 入口文件
│   ├── preferences.ts   # 偏好配置
│   └── type.d.ts        # 类型声明
├── public/              # 公共资源
├── index.html           # HTML模板
├── package.json         # 应用依赖
├── tsconfig.json        # TypeScript配置
├── vite.config.ts       # Vite构建配置
└── README.md           # 应用说明
```

### api/ API接口层

API接口按业务模块组织:

```
api/
├── accidentManagement/      # 事故管理API
├── alarmManagement/         # 告警管理API
├── baseInfo/                # 基础信息API
├── carbonEmissionMgmt/      # 碳排放管理API
├── equipManagement/         # 设备管理API
├── fireOperationManagement/ # 动火作业管理API
├── hiddenDanger/            # 隐患管理API
├── iamp/                    # IAMP管理API
├── kanban/                  # 看板管理API
├── operationFormula/        # 作业配方API
├── planManagement/          # 计划管理API
├── processManagement/       # 工艺管理API
├── productionReport/        # 生产报表API
├── puctManagement/          # 生产管理API
├── qualityCheck/            # 质量检验API
├── reportManagement/        # 报表管理API
├── riskManagement/          # 风险管理API
├── storeManagement/         # 仓储管理API
├── system/                  # 系统管理API
├── tracingModule/           # 追溯管理API
├── unitAreaManagement/      # 单元区域管理API
├── index.ts                 # API统一导出
└── request.ts              # 请求封装
```

### views/ 页面组件

页面组件按业务功能模块组织,每个目录包含README.md说明文件:

```
views/
├── accidentManagement/      # 事故管理
│   ├── accidentDashboard.vue      # 事故仪表板
│   ├── accidentManagement.vue     # 事故管理
│   ├── accidentOverview.vue       # 事故概览
│   └── README.md
├── alarmManagement/         # 告警管理
│   ├── energyWarningConfig.vue    # 能源预警配置
│   ├── energyWarningHandling.vue  # 能源预警处理
│   └── README.md
├── asdie/                  # ASDIE打印模板
│   ├── printTemplate.vue          # 打印模板
│   └── README.md
├── baseInfo/               # 基础信息管理
│   ├── barCodeManagement/         # 条码管理
│   ├── BOMManagement/             # BOM管理
│   ├── factoryCalendar/           # 工厂日历
│   ├── materialBaseManagement/    # 物料基础管理
│   ├── prodLineManage/            # 产线管理
│   ├── productManagement/         # 产品管理
│   ├── controlSet.vue             # 控制设置
│   ├── electricityTimeSlotRule.vue # 用电时段规则
│   ├── gasCo2CalcParamMaintenance.vue # 天然气CO2计算参数维护
│   ├── gridEmissionFactorMaintenance.vue # 电网排放因子维护
│   ├── interactionPoint.vue       # 交互点维护
│   ├── mouldManage.vue             # 模具管理
│   ├── printTemplateMaintenance.vue # 打印模板维护
│   ├── productManagement.vue      # 产品管理
│   └── README.md
├── carbonEmissionMgmt/     # 碳排放管理
│   ├── carbonEmissionAnalysis.vue  # 碳排放分析
│   ├── carbonEmissionStatChart.vue # 碳排放统计图表
│   └── README.md
├── codeTest/               # 代码测试
│   ├── testTest.vue               # 测试页面
│   └── README.md
├── dashboard/              # 仪表板
│   ├── analytics/                # 数据分析仪表板
│   ├── analytics_black/          # 黑色主题仪表板
│   ├── welcome/                  # 欢迎页面
│   ├── workspace/                # 工作区
│   └── README.md
├── energyConsumptionAnalysis/ # 能耗分析
│   ├── energyFlowDirection.vue        # 能源流向分析
│   ├── lossAnalysis.vue                # 损耗分析
│   ├── productEnergyConsumption.vue    # 产品能耗
│   ├── systemEnergyConsumption.vue     # 系统能耗
│   ├── teamEnergyConsumptionView.vue   # 班组能耗视图
│   └── README.md
├── energyConsumptionStatistics/ # 能耗统计
│   ├── electricityConsumptionData.vue # 用电量数据
│   ├── electricityCost.vue             # 电费统计
│   ├── waterUsageData.vue              # 用水量数据
│   ├── gasUsageData.vue                # 用气量数据
│   ├── collectionDataDisplay.vue      # 采集数据显示
│   ├── comprehensiveWaterFee.vue       # 综合水费
│   ├── adjustmentFee.vue               # 调整费用
│   └── README.md
├── energyUnitConsumptionMgmt/ # 能源单耗管理
│   ├── electricityConsumptionStat.vue  # 用电量统计
│   ├── singleProductEnergyConsumption.vue # 单产品能耗
│   └── README.md
├── equipManagement/         # 设备管理
│   ├── equipmentCheck/            # 设备点检
│   ├── equipmentMonitor/          # 设备监控
│   ├── energyEquipmentManagement.vue # 能源设备管理
│   ├── equipMaintenance.vue       # 设备维护
│   ├── equipmentRepair.vue       # 设备维修
│   ├── equipNameMaintain.vue      # 设备名称维护
│   ├── equipRecord.vue            # 设备记录
│   ├── resourceConsumptionEntry.vue # 资源消耗录入
│   └── README.md
├── fireOperationManagement/ # 动火作业管理
│   ├── fireOperation.vue           # 动火作业管理
│   └── README.md
├── hiddenDanger/           # 隐患管理
│   ├── hiddenDangerDashboard.vue   # 隐患仪表板
│   ├── hiddenDangerReport.vue      # 隐患报表
│   ├── hiddenDangerInspection.vue  # 隐患排查
│   ├── hiddenDangerInspectionPlan.vue # 隐患排查计划
│   ├── hiddenDangerInspectionTask.vue # 隐患排查任务
│   ├── hiddenDangerInspectionStandard.vue # 隐患排查标准
│   ├── hiddenDangerRectification.vue # 隐患整改
│   ├── hiddenDangerRectificationKanBan.vue # 隐患整改看板
│   └── README.md
├── Iamp/                   # IAMP管理
│   ├── FlowConfiguration.vue       # 流程配置
│   ├── ProblemAllocation.vue       # 问题分配
│   └── README.md
├── kanban/                 # 看板管理
│   ├── configOverview.vue          # 配置概览
│   ├── kbBaseDictionary.vue        # 看板基础字典
│   ├── terminalEquipment.vue       # 终端设备
│   ├── urlConfigure.vue            # URL配置
│   └── README.md
├── operationFormula/       # 作业配方
│   ├── operationFormulaView.vue   # 作业配方视图
│   ├── processFormula.vue         # 工艺配方
│   ├── processFormulaInquiry.vue   # 工艺配方查询
│   ├── processParameterMonitoring.vue # 工艺参数监控
│   ├── processParameterMonitoringAndQuery.vue # 工艺参数监控与查询
│   ├── workstepRecipeManagement.vue # 工步配方管理
│   └── README.md
├── planManagement/         # 计划管理
│   ├── planFinish.vue              # 计划完成
│   ├── SMTmanagement.vue           # SMT管理
│   ├── temporaryWorkOrderManagement.vue # 临时工单管理
│   ├── workOrderStatusQuery.vue    # 工单状态查询
│   └── README.md
├── processManagement/      # 工艺管理
│   ├── processRoute.vue            # 工艺路线
│   ├── selectionOfRDProcessRoute.vue # 研发工艺路线选择
│   ├── processParams.vue           # 工艺参数
│   ├── processParamsQuery.vue      # 工艺参数查询
│   ├── waterContentMaintenance.vue # 含水量维护
│   ├── processBase.vue             # 工艺基础
│   ├── changeOperation.vue         # 变更工序
│   ├── sopBinding.vue              # SOP绑定
│   └── README.md
├── productionReport/       # 生产报表
│   ├── SMTfarm/                   # SMT车间管理(50个页面)
│   ├── SMTPlantAdd.vue            # SMT车间添加
│   ├── productionQuery/           # 生产查询
│   ├── completedWorkOrderDetails.vue # 已完工工单明细
│   ├── supplementaryFeedingOperation.vue # 补料操作
│   ├── productionFeedAudit.vue    # 生产投料审核
│   ├── packagingAndInventoryReversal.vue # 包装与库存冲销
│   ├── productRed.vue             # 产品红冲
│   ├── energyConsumptionCollectionDetails.vue # 能耗采集明细
│   ├── nonProductionEnergyConsumptionDetails.vue # 非生产能耗明细
│   ├── crossSystemInteractionWorkOrderLockList.vue # 跨系统交互工单锁定列表
│   ├── materialOffset.vue         # 物料冲销
│   ├── schedulePlanning.vue       # 计划排产
│   ├── workOrderParams.vue        # 工单参数
│   └── README.md
├── puctManagement/         # 生产管理
│   ├── productInput.vue           # 生产入库
│   ├── productOutput.vue          # 生产出库
│   ├── productAllocation.vue      # 生产调拨
│   ├── productInventory.vue       # 生产库存
│   ├── disttionDetail.vue         # 分配明细
│   ├── aintoryDetails.vue         # 库存明细
│   └── README.md
├── qualityModule/          # 质量管理
│   ├── qualityCheck/              # 质量检验
│   ├── badfindData/               # 不良品数据
│   ├── defectCodeSet.vue          # 缺陷代码设置
│   └── README.md
├── reportManagement/       # 报表管理
│   ├── reportDIP/                 # DIP报表
│   ├── reportSMT/                 # SMT报表
│   └── README.md
├── riskManagement/         # 风险管理
│   ├── lecRiskAssessmentCriteria.vue # LEC风险评估标准
│   ├── riskStandard.vue           # 风险标准
│   ├── riskIdentificationAndAssessment.vue # 风险识别与评估
│   ├── riskProfile.vue            # 风险概况
│   ├── riskControl.vue            # 风险控制
│   ├── riskHiddenDangerRectification.vue # 风险隐患整改
│   ├── riskInspection.vue         # 风险检查
│   ├── riskInspectionPlanFormulation.vue # 风险检查计划制定
│   ├── riskInspectionPlanExecution.vue # 风险检查计划执行
│   └── README.md
├── stepManagement/         # 工步管理
│   ├── stepManagementView.vue    # 工步管理视图
│   └── README.md
├── storeManagement/        # 仓储管理
│   ├── materialManagement/        # 物料管理
│   ├── inventoryManagement/       # 库存管理
│   ├── labelManagement/          # 标签管理
│   ├── storeManage.vue            # 仓库管理
│   ├── storeBlock.vue             # 仓库区域
│   ├── storeLocation.vue          # 仓库货位
│   ├── physicalStore.vue          # 实物仓库
│   └── README.md
├── system/                 # 系统管理
│   ├── baseOrganization.vue       # 组织架构
│   ├── baseStaff.vue              # 员工管理
│   ├── basePosition.vue           # 岗位管理
│   ├── sysUser.vue                # 用户管理
│   ├── sysRole.vue                # 角色管理
│   ├── sysWebMenu.vue             # 菜单管理
│   ├── sysWebButton.vue           # 按钮管理
│   ├── baseDictionary.vue         # 基础字典
│   ├── regionManagement.vue       # 地区管理
│   └── README.md
├── tracingModule/          # 追溯管理
│   ├── productTrace.vue           # 产品追溯
│   ├── productFlowRecord.vue       # 产品流转记录
│   ├── productTraceSet.vue        # 产品追溯设置
│   ├── batchTrace/                # 批次追溯
│   └── README.md
└── unitAreaManagement/     # 单元区域管理
    ├── energyAreaManagement.vue   # 能源区域管理
    ├── subsystem.vue              # 子系统
    ├── lineLossAnalysisDefinition.vue # 线损分析定义
    ├── teamEnergyConsumption.vue  # 班组能源消耗
    └── README.md
```

### util/ 工具和公共组件

```
util/
├── component/              # 公共组件
│   ├── qualityEntering/     # 质量录入相关组件
│   └── ...                  # 其他公共组件
├── ...                     # 工具函数
```

### locales/ 国际化

```
locales/
├── langs/                  # 语言包
│   ├── zh-CN/             # 简体中文
│   │   ├── qualityModule.json     # 质量管理
│   │   ├── storeManagement.json    # 仓储管理
│   │   └── ...                    # 其他模块
│   ├── en-US/             # 英文
│   │   ├── qualityModule.json
│   │   ├── storeManagement.json
│   │   └── ...
│   └── ...                # 其他语言
└── index.ts               # 国际化配置
```

---

## packages/ 共享包目录

Monorepo架构的核心,所有应用共享的公共包:

```
packages/
├── @core/           # 核心包
│   ├── base-ui/          # 基础UI组件
│   ├── shared-ui/       # 共享UI组件
│   ├── ui-preset/       # UI预设
│   └── ...              # 其他核心功能
├── constants/       # 常量定义
├── effects/         # 副作用处理
├── icons/           # 图标库
├── locales/         # 国际化包
├── preferences/     # 偏好设置
├── stores/          # 状态管理
├── styles/          # 样式
├── types/           # 类型定义
└── utils/           # 工具函数
```

### @core/ 核心包详细说明

核心包提供Mes系统的基础架构和核心功能:

- **base-ui/** - 基础UI组件,包括按钮、输入框、表单等
- **shared-ui/** - 共享UI组件,可跨应用复用的高级组件
- **ui-preset/** - UI预设,提供预设的UI配置和主题
- **preferences/** - 偏好设置,用户偏好和系统配置管理

---

## scripts/ 脚本目录

包含构建、部署等自动化脚本:

```
scripts/
├── deploy/          # 部署脚本
│   └── build-local-docker-image.sh  # 本地Docker镜像构建
└── clean.mjs        # 清理脚本
```

---

## 常用命令

### 开发

```bash
# 启动MES应用开发服务器
pnpm dev:mes

# 启动其他应用
pnpm dev:antd        # Ant Design Vue版本
pnpm dev:ele         # Element Plus版本
pnpm dev:naive       # Naive UI版本
pnpm dev:tdesign     # TDesign版本
```

### 构建

```bash
# 构建所有应用
pnpm build

# 构建MES应用
pnpm build:mes

# 构建其他应用
pnpm build:antd
pnpm build:ele
pnpm build:naive
pnpm build:tdesign
```

### 代码检查

```bash
# 类型检查
pnpm check:type

# 依赖检查
pnpm check:dep

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 测试

```bash
# 单元测试
pnpm test:unit

# E2E测试
pnpm test:e2e
```

---

## 开发规范

### Git提交规范

遵循Angular规范:

- `feat` - 增加新功能
- `fix` - 修复问题/BUG
- `style` - 代码风格相关无影响运行结果的
- `perf` - 优化/性能提升
- `refactor` - 重构
- `revert` - 撤销修改
- `test` - 测试相关
- `docs` - 文档/注释
- `chore` - 依赖更新/脚手架配置修改等
- `ci` - 持续集成
- `types` - 类型定义文件更改

### 代码规范

- 使用 TypeScript 进行类型检查
- 使用 ESLint 进行代码质量检查
- 使用 Stylelint 进行样式检查
- 使用 Prettier 进行代码格式化
- 使用 OxLint 进行快速代码检查

---

## 浏览器支持

- 本地开发推荐使用 `Chrome 80+` 浏览器
- 支持现代浏览器,不支持 IE
- 支持的浏览器: Edge, Firefox, Chrome, Safari (最新2个版本)

---

## 技术架构特点

### 1. Monorepo架构

- 使用 pnpm workspace 和 Turbo 进行多应用管理
- 共享代码和依赖,减少重复
- 统一的构建和测试流程

### 2. 模块化设计

- 按业务模块组织代码
- API、视图、组件高度解耦
- 支持独立开发和测试

### 3. 类型安全

- 全面的 TypeScript 类型定义
- 编译时类型检查
- 更好的开发体验

### 4. 组件化

- VXE Grid 用于复杂表格
- Ant Design Vue 提供UI组件
- 公共组件复用

### 5. 国际化

- 支持多语言切换
- 按模块组织语言包
- 易于扩展新语言

---

## MES系统核心业务模块

### 生产管理

- 计划管理、工单管理、生产报表
- SMT生产管理、生产查询
- 补料、投料、调拨等操作

### 质量管理

- 质量检验、缺陷管理
- 不良品数据分析
- IQC/OQC检验流程

### 仓储管理

- 物料管理、库存管理
- 入库、出库、调拨
- 标签管理、盘点管理

### 设备管理

- 设备信息管理
- 设备监控、维护、维修
- 点检和记录管理

### 能源管理

- 能耗分析、统计
- 能源单耗管理
- 能源区域管理
- 碳排放管理

### 安全管理

- 事故管理、隐患管理
- 风险管理
- 动火作业管理

### 工艺管理

- 工艺路线、工艺参数
- 作业配方、工步管理
- SOP管理

### 系统管理

- 用户、角色、权限
- 组织架构、岗位管理
- 菜单、按钮权限
- 基础字典、地区管理

### 追溯管理

- 产品追溯
- 批次追溯
- 流转记录

---

## 项目文档

- [项目README](./README.zh-CN.md) - 项目介绍和快速开始
- [在线文档](https://doc.vben.pro/) - Vue Vben Admin官方文档
- [CHANGELOG](https://github.com/vbenjs/vue-vben-admin/releases) - 更新日志
- [各模块README](./apps/mes/src/views/) - 各业务模块的详细说明

---

## 相关链接

- [GitHub仓库](https://github.com/vbenjs/vue-vben-admin)
- [在线预览](https://vben.pro/)
- [文档地址](https://doc.vben.pro/)
- [问题反馈](https://github.com/vbenjs/vue-vben-admin/issues)

---

## 许可证

MIT © Vben-2020
