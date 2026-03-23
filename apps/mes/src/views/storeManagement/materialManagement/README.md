# 物料管理

## 目录说明

本目录包含物料管理的核心功能,涵盖物料的出入库、检验、调拨和库存查询。

## 功能模块

### 物料出入库

- `materialInputList.vue` - 物料入库单,管理物料入库单据
- `materialOutputList.vue` - 物料出库单,管理物料出库单据
- `storesRequisition.vue` - 领料单,管理物料领料业务
- `ioBillManagement.vue` - 出入库单管理,管理所有出入库单据

### 物料检验

- `iqcExamine.vue` - IQC检验,进行来料质量检验
- `inQualityInspectio.vue` - 进货检验,进行进货质量检验
- `materialInspectionSlip.vue` - 物料检验单,管理物料检验单据
- `ipcReport.vue` - IPC报表,查看IQC检验报表

### 物料调拨

- `materialAllot.vue` - 物料调拨,处理物料调拨业务
- `lineSideWarehouseAllocation.vue` - 线边仓调拨,处理线边仓的物料调拨

### 物料查询

- `materialDetails.vue` - 物料明细,查看物料的详细信息
- `materialInventory.vue` - 物料库存,查看物料库存情况
