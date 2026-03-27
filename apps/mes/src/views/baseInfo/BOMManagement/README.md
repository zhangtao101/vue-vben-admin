# BOM管理

## 目录说明

本目录包含物料清单(BOM)管理的相关功能,用于维护产品的物料构成和层级关系。

## 功能模块

### BOM基础管理

- `bomCategory.vue` - BOM分类,维护BOM的分类信息
- `productBom.vue` - 产品BOM,管理产品的物料清单

### 外协BOM

- `outProcessBom.vue` - 外协BOM,管理外协加工的BOM
- `outProcessCategory.vue` - 外协分类,维护外协加工的分类
- `outProcessMaterial.vue` - 外协物料,管理外协加工的物料

### 半成品管理

- `semiFinishedCategory.vue` - 半成品分类,维护半成品的分类
- `semiFinishedInform.vue` - 半成品信息,维护半成品的基础信息

### 质量物料

- `maintainQualityMaterials.vue` - 维护质量物料,维护质量相关的物料信息
