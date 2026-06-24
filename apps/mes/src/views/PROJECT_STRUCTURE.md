# MES 项目结构文档

> MES（制造执行系统）前端页面模块，基于 Vue 3 + Ant Design Vue + VXE Grid + TypeScript

## 目录结构总览

```
views/
├── _core/                          # 核心公共组件
│   └── chartCard.vue               # 图表卡片组件
├── accidentManagement/             # 事故管理
│   └── accidentManagement.vue      # 事故管理页面
├── alarmManagement/                # 报警管理
│   └── alarmManagement.vue         # 报警管理页面
├── asdie/                          # 辅助功能
│   └── printTemplate.vue           # 打印模板
├── baseInfo/                       # 基础信息
│   ├── barCodeManagement/          # 条码管理
│   │   └── barCodeManagement.vue
│   ├── BOMManagement/              # BOM管理
│   │   ├── materialBOM.vue
│   │   └── productBOM.vue
│   ├── factoryCalendar/            # 工厂日历
│   │   ├── factoryCalendar.vue
│   │   └── overtimeCalendar.vue
│   ├── materialBaseManagement/     # 物料基础管理
│   │   ├── materialCategory.vue
│   │   └── materialType.vue
│   ├── prodLineManage/             # 产线管理
│   │   └── prodLineManage.vue
│   └── productManagement/          # 产品管理
│       └── productManagement.vue
├── carbonEmissionMgmt/             # 碳排放管理
│   ├── carbonEmissionAnalysis.vue
│   └── carbonEmissionMgmt.vue
├── dashboard/                      # 仪表盘
│   ├── analytics/                  # 分析页
│   │   ├── analytics.vue
│   │   ├── analyticsData.ts
│   │   ├── analyticsGender.vue
│   │   ├── analyticsTrends.vue
│   │   └── analyticsVisits.vue
│   ├── analytics_black/            # 分析页（暗色）
│   │   ├── analyticsBlack.vue
│   │   └── analyticsData.ts
│   ├── welcome/                    # 欢迎页
│   │   └── welcome.vue
│   └── workspace/                  # 工作台
│       └── index.vue
├── energyConsumptionAnalysis/      # 能耗分析
│   ├── energyConsumptionAnalysis.vue
│   ├── energyConsumptionAnalysisExports.vue
│   └── energyConsumptionAnalysisReport.vue
├── energyConsumptionStatistics/    # 能耗统计
│   ├── energyConsumptionReport.vue
│   ├── energyRealTime.vue
│   └── energyStatistics.vue
├── energyUnitConsumptionMgmt/      # 能耗单耗管理
│   └── energyUnitConsumptionMgmt.vue
├── equipManagement/                # 设备管理
│   ├── equipmentCheck/             # 设备点检
│   │   ├── equipmentCheck.vue
│   │   └── equipmentCheckBoard.vue
│   ├── equipmentMonitor/           # 设备监控
│   │   ├── equipmentMonitor.vue
│   │   └── equipmentMonitorConfig.vue
│   ├── repairMaintenance/          # 设备维修
│   │   ├── equipmentRepair.vue
│   │   ├── maintenanceKanban.vue
│   │   ├── maintenanceRecord.vue
│   │   └── repairOrder.vue
│   ├── equipmentCategory.vue       # 设备类别
│   ├── equipmentDetailList.vue     # 设备明细列表
│   ├── equipmentFile.vue           # 设备档案
│   └── equipmentParam.vue          # 设备参数
├── fireOperationManagement/        # 动火作业管理
│   └── fireOperationManagement.vue
├── hiddenDanger/                   # 隐患排查
│   ├── hiddenDangerInspectionPlan.vue
│   ├── hiddenDangerInspectionStandard.vue
│   ├── hiddenDangerInspectionTask.vue
│   ├── hiddenDangerRectification.vue
│   ├── hiddenDangerRectificationKanBan.vue
│   ├── hiddenDangerReport.vue
│   └── Inspection.vue
├── Iamp/                           # 问题分配
│   ├── FlowConfiguration.vue
│   └── ProblemAllocation.vue
├── kanban/                         # 看板
│   ├── configOverview.vue
│   ├── kbBaseDictionary.vue
│   ├── terminalEquipment.vue
│   └── urlConfigure.vue
├── lowCode/                        # 低代码平台
│   ├── lowCodeProcessConfig.vue
│   ├── lowCodeProcessRuntime.vue
│   └── testTest.vue
├── lps/                            # 精益生产
│   ├── kittingCheck.vue
│   ├── laborHourEvaluation.vue
│   ├── lpsWorkOrderSplit.vue
│   ├── monthlyCapacityEvaluation.vue
│   ├── preOperation.vue
│   ├── schedulePlanning.vue
│   └── shortageTracking.vue
├── moldLifeMgmt/                   # 模具寿命管理
│   ├── maintenanceAlert.vue
│   ├── maintenanceRecord.vue
│   ├── maintenanceTask.vue
│   ├── moldArchiveMgmt.vue
│   ├── moldCategoryMgmt.vue
│   ├── moldChangeRecord.vue
│   ├── moldDismounting.vue
│   ├── moldMounting.vue
│   ├── moldRepair.vue
│   └── myMoldRepairTask.vue
├── operationFormula/               # 工艺配方
│   ├── operationFormulaView.vue
│   ├── processFormula.vue
│   ├── processFormulaInquiry.vue
│   ├── processParameterMonitoring.vue
│   ├── processParameterMonitoringAndQuery.vue
│   └── workstepRecipeManagement.vue
├── planManagement/                  # 计划管理
│   ├── planFinish.vue
│   ├── SMTmanagement.vue
│   ├── temporaryWorkOrderManagement.vue
│   └── workOrderStatusQuery.vue
├── processManagement/              # 工艺管理
│   ├── changeOperation.vue
│   ├── processBase.vue
│   ├── processParams.vue
│   ├── processParamsQuery.vue
│   ├── processRoute.vue
│   ├── selectionOfRDProcessRoute.vue
│   ├── sopBinding.vue
│   └── waterContentMaintenance.vue
├── productionReport/               # 生产报表
│   ├── productionQuery/            # 生产查询
│   │   ├── packingLook.vue
│   │   ├── productPackaging.vue
│   │   └── recordQuery.vue
│   ├── SMTfarm/                    # SMT工场
│   │   ├── dailynewspaper/         # 日报
│   │   │   ├── batchReportOnInputoutputOfVitrifiedBrickFactoryProducts.vue
│   │   │   ├── bpgPressingDetailTable.vue
│   │   │   ├── brokenSummary.vue
│   │   │   ├── dailyReportOfKilnShutdown.vue
│   │   │   ├── dayPFIOReport.vue
│   │   │   ├── detailedListOfGlazeLineShutdown.vue
│   │   │   ├── detailedListOfKilnShutdown.vue
│   │   │   ├── energyConsumptionOfPolishingFactory.vue
│   │   │   ├── energyConsumptionReport.vue
│   │   │   ├── gasMetersForKilnShutdownInEachFactory.vue
│   │   │   ├── glazeLineDaily.vue
│   │   │   ├── glazeLineMonthlyReport.vue
│   │   │   ├── glazeRoomDailyProductionReport.vue
│   │   │   ├── kilnDaily.vue
│   │   │   ├── kilnMonthlyReport.vue
│   │   │   ├── listOfVitrifiedBrickFactories.vue
│   │   │   ├── materialExceptionApprovalHistory.vue
│   │   │   ├── monthlyBPGIOReport.vue
│   │   │   ├── monthlyDetailedListOfPowderMaterials.vue
│   │   │   ├── monthlyPFIOReport.vue
│   │   │   ├── monthlyPowderReport.vue
│   │   │   ├── monthlyReportOfCompressor.vue
│   │   │   ├── poliShing.vue
│   │   │   ├── polishingProductionDailyReport.vue
│   │   │   ├── polishingQualityDailyReport.vue
│   │   │   ├── polishingShutdownDailyReport.vue
│   │   │   ├── polishingShutdownDetails.vue
│   │   │   ├── polishingWarehouseDailyReport.vue
│   │   │   ├── powderDaily.vue
│   │   │   ├── powderFactoryShutdownDetails.vue
│   │   │   ├── powderTransfer.vue
│   │   │   ├── powerConsumptionDetailsOfKilnFactory.vue
│   │   │   ├── pressDailyReport.vue
│   │   │   ├── pressShutdownDetailsTable.vue
│   │   │   ├── prodReportName.vue
│   │   │   ├── prodTimeName.vue
│   │   │   ├── productionOrderScheduledActualReport.vue
│   │   │   ├── productionSelectionSummaryTable.vue
│   │   │   ├── productionStatisticsOfAutomaticPackagingMachine.vue
│   │   │   ├── reportonactuallossofkilnglazematerials.vue
│   │   │   ├── sectionLoss.vue
│   │   │   ├── summaryOfPowderPlantShutdown.vue
│   │   │   ├── summaryTableOfCompressorShutdown.vue
│   │   │   ├── summaryTableOfGlazeLineShutdown.vue
│   │   │   ├── summaryTableOfKilnShutdown.vue
│   │   │   └── totalProductionAndBatchStatistics.vue
│   │   ├── productionDaily.vue
│   │   ├── SMTfulfil.vue
│   │   ├── SMTgeneral.vue
│   │   └── SMTwork.vue
│   ├── completedWorkOrderDetails.vue
│   ├── crossSystemInteractionWorkOrderLockList.vue
│   ├── energyConsumptionCollectionDetails.vue
│   ├── materialOffset.vue
│   ├── nonProductionEnergyConsumptionDetails.vue
│   ├── packagingAndInventoryReversal.vue
│   ├── productionFeedAudit.vue
│   ├── productRed.vue
│   ├── SMTPlantAdd.vue
│   ├── supplementaryFeedingOperation.vue
│   └── workOrderParams.vue
├── puctManagement/                 # 产品库存管理
│   ├── aintoryDetails.vue
│   ├── disttionDetail.vue
│   ├── productAllocation.vue
│   ├── productInput.vue
│   ├── productInventory.vue
│   └── productOutput.vue
├── qualityModule/                  # 质量模块
│   ├── badfindData/                # 不良数据
│   │   └── badfindSMT.vue
│   ├── qualityCheck/               # 质量检查
│   │   ├── qualityBaseSet/         # 质量基础设置
│   │   │   ├── measureMaintain.vue
│   │   │   └── specialMaintain.vue
│   │   ├── qualityCheckSet/        # 质量检查设置
│   │   │   ├── qualityCheckForm.vue
│   │   │   ├── qualityCheckItem.vue
│   │   │   └── standardQuery.vue
│   │   ├── qualityEntering/        # 质量录入
│   │   │   └── qualityEntering.vue
│   │   └── inspection.vue
│   └── defectCodeSet.vue
├── reportManagement/               # 报表管理
│   ├── reportDIP/                  # DIP报表
│   │   ├── reportDIPDate.vue
│   │   └── reportDIPWork.vue
│   └── reportSMT/                  # SMT报表
│       ├── reportSMTDate.vue
│       └── reportSMTWork.vue
├── riskManagement/                 # 风险管理
│   ├── lecRiskAssessmentCriteria.vue
│   ├── riskControl.vue
│   ├── riskHiddenDangerRectification.vue
│   ├── riskIdentificationAndAssessment.vue
│   ├── riskInspection.vue
│   ├── riskInspectionPlanExecution.vue
│   ├── riskInspectionPlanFormulation.vue
│   ├── riskProfile.vue
│   └── riskStandard.vue
├── stepManagement/                 # 工步管理
│   └── stepManagementView.vue
├── storeManagement/                # 仓库管理
│   ├── inventoryManagement/        # 库存管理
│   │   ├── inventoryMgmt/          # 盘点管理
│   │   │   ├── inventoryPlanMgmt.vue
│   │   │   └── inventoryTaskView.vue
│   │   ├── batchLock.vue
│   │   └── warehouseDetails.vue
│   ├── labelManagement/            # 标签管理
│   │   ├── labelDuplication.vue
│   │   ├── labelPrint.vue
│   │   └── materialBatchImport.vue
│   ├── materialManagement/         # 物料管理
│   │   ├── inQualityInspectio.vue
│   │   ├── ioBillManagement.vue
│   │   ├── ipcReport.vue
│   │   ├── iqcExamine.vue
│   │   ├── lineSideWarehouseAllocation.vue
│   │   ├── materialAllot.vue
│   │   ├── materialDetails.vue
│   │   ├── materialInputList.vue
│   │   ├── materialInspectionSlip.vue
│   │   ├── materialInventory.vue
│   │   ├── materialOutputList.vue
│   │   └── storesRequisition.vue
│   ├── physicalStore.vue
│   ├── storeBlock.vue
│   ├── storeLocation.vue
│   └── storeManage.vue
├── system/                         # 系统管理
│   ├── baseDictionary.vue
│   ├── baseOrganization.vue
│   ├── basePosition.vue
│   ├── baseStaff.vue
│   ├── regionManagement.vue
│   ├── resourceMgmt.vue
│   ├── sysRole.vue
│   ├── sysUser.vue
│   ├── sysWebButton.vue
│   └── sysWebMenu.vue
├── tracingModule/                  # 追溯模块
│   ├── batchTrace/                 # 批次追溯
│   │   ├── equipBatchTrace.vue
│   │   └── materialBatchTrace.vue
│   ├── productFlowRecord.vue
│   ├── productTrace.vue
│   └── productTraceSet.vue
└── unitAreaManagement/             # 单元区域管理
    ├── energyAreaManagement.vue
    ├── lineLossAnalysisDefinition.vue
    ├── subsystem.vue
    └── teamEnergyConsumption.vue
```

## 模块统计

| 序号 | 模块目录 | 说明 | Vue 文件数 |
|------|----------|------|------------|
| 1 | `_core` | 核心公共组件 | 1 |
| 2 | `accidentManagement` | 事故管理 | 1 |
| 3 | `alarmManagement` | 报警管理 | 1 |
| 4 | `asdie` | 辅助功能（打印模板） | 1 |
| 5 | `baseInfo` | 基础信息 | 10 |
| 6 | `carbonEmissionMgmt` | 碳排放管理 | 2 |
| 7 | `dashboard` | 仪表盘 | 7 |
| 8 | `energyConsumptionAnalysis` | 能耗分析 | 3 |
| 9 | `energyConsumptionStatistics` | 能耗统计 | 3 |
| 10 | `energyUnitConsumptionMgmt` | 能耗单耗管理 | 1 |
| 11 | `equipManagement` | 设备管理 | 11 |
| 12 | `fireOperationManagement` | 动火作业管理 | 1 |
| 13 | `hiddenDanger` | 隐患排查 | 7 |
| 14 | `Iamp` | 问题分配 | 2 |
| 15 | `kanban` | 看板配置 | 4 |
| 16 | `lowCode` | 低代码平台 | 3 |
| 17 | `lps` | 精益生产 | 7 |
| 18 | `moldLifeMgmt` | 模具寿命管理 | 10 |
| 19 | `operationFormula` | 工艺配方 | 6 |
| 20 | `planManagement` | 计划管理 | 4 |
| 21 | `processManagement` | 工艺管理 | 8 |
| 22 | `productionReport` | 生产报表 | 64 |
| 23 | `puctManagement` | 产品库存管理 | 6 |
| 24 | `qualityModule` | 质量模块 | 8 |
| 25 | `reportManagement` | 报表管理 | 4 |
| 26 | `riskManagement` | 风险管理 | 9 |
| 27 | `stepManagement` | 工步管理 | 1 |
| 28 | `storeManagement` | 仓库管理 | 24 |
| 29 | `system` | 系统管理 | 10 |
| 30 | `tracingModule` | 追溯模块 | 5 |
| 31 | `unitAreaManagement` | 单元区域管理 | 4 |

**总计：31 个模块，约 230 个 Vue 页面文件**

## 技术栈

| 技术 | 说明 |
|------|------|
| Vue 3 | 前端框架 |
| TypeScript | 类型支持 |
| Ant Design Vue | UI 组件库 |
| VXE Grid | 高性能表格组件 |
| Vite | 构建工具 |

---

> 最后更新：2026-06-24
