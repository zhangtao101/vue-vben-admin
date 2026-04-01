# 生产报表

## 目录说明

本目录包含各类生产报表和SMT生产管理的功能模块,是生产数据分析和管理的核心模块。

## 主要子模块

### SMT生产管理

- `SMTfarm/` - SMT车间管理,包含50个SMT生产相关页面
- `SMTPlantAdd.vue` - SMT车间添加,管理SMT车间信息

### 生产查询

- `productionQuery/` - 生产查询,查询生产相关数据

### 生产操作

- `completedWorkOrderDetails.vue` - 已完工工单明细,查看已完工工单的详细信息
- `supplementaryFeedingOperation.vue` - 补料操作,处理生产过程中的补料业务
- `productionFeedAudit.vue` - 生产投料审核,审核生产投料记录
- `packagingAndInventoryReversal.vue` - 包装与库存冲销,处理包装和库存冲销业务
- `productRed.vue` - 产品红冲,处理产品的红冲业务

### 能源报表

- `energyConsumptionCollectionDetails.vue` - 能耗采集明细,查看能耗采集的详细数据
- `nonProductionEnergyConsumptionDetails.vue` - 非生产能耗明细,查看非生产环节的能耗数据

### 其他报表

- `crossSystemInteractionWorkOrderLockList.vue` - 跨系统交互工单锁定列表,管理跨系统工单锁定
- `materialOffset.vue` - 物料冲销,处理物料冲销业务
- `workOrderParams.vue` - 工单参数,设置和管理工单参数
