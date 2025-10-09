import type { RouteRecordRaw } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';

import { $t } from '#/locales';
import Login from '#/views/_core/authentication/login.vue';

const BasicLayout = () => import('#/layouts/basic.vue');
const AuthPageLayout = () => import('#/layouts/auth.vue');
const EmptyLayout = () => import('#/layouts/empty.vue');
/** 全局404页面 */
const fallbackNotFoundRoute: RouteRecordRaw = {
  component: () => import('#/views/_core/fallback/not-found.vue'),
  meta: {
    hideInBreadcrumb: true,
    hideInMenu: true,
    hideInTab: true,
    title: '404',
  },
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
};

/** 基本路由，这些路由是必须存在的 */
const coreRoutes: RouteRecordRaw[] = [
  /**
   * 根路由
   * 使用基础布局，作为所有页面的父级容器，子级就不必配置BasicLayout。
   * 此路由必须存在，且不应修改
   */
  {
    component: BasicLayout,
    meta: {
      hideInBreadcrumb: true,
      title: 'Root',
    },
    name: 'Root',
    path: '/',
    redirect: preferences.app.defaultHomePath,
    children: [],
  },
  {
    component: AuthPageLayout,
    meta: {
      hideInTab: true,
      title: 'Authentication',
    },
    name: 'Authentication',
    path: '/auth',
    redirect: LOGIN_PATH,
    children: [
      {
        name: 'Login',
        path: 'login',
        component: Login,
        meta: {
          title: $t('page.auth.login'),
        },
      },
      {
        name: 'CodeLogin',
        path: 'code-login',
        component: () => import('#/views/_core/authentication/code-login.vue'),
        meta: {
          title: $t('page.auth.codeLogin'),
        },
      },
      {
        name: 'QrCodeLogin',
        path: 'qrcode-login',
        component: () =>
          import('#/views/_core/authentication/qrcode-login.vue'),
        meta: {
          title: $t('page.auth.qrcodeLogin'),
        },
      },
      {
        name: 'ForgetPassword',
        path: 'forget-password',
        component: () =>
          import('#/views/_core/authentication/forget-password.vue'),
        meta: {
          title: $t('page.auth.forgetPassword'),
        },
      },
      {
        name: 'Register',
        path: 'register',
        component: () => import('#/views/_core/authentication/register.vue'),
        meta: {
          title: $t('page.auth.register'),
        },
      },
    ],
  },
  // 工作台维护
  {
    component: EmptyLayout,
    name: 'empty',
    path: '/empty',
    children: [
      {
        component: () => import('#/views/baseInfo/workStationMaintenance.vue'),
        meta: {
          code: 'WM_454',
          ignoreAccess: true,
          title: '工作站维护',
        },
        name: 'workStationMaintenance',
        path: 'workStationMaintenance',
      },
      {
        component: () => import('#/views/processManagement/processParams.vue'),
        meta: {
          code: 'WM_379',
          ignoreAccess: true,
          title: '工艺参数管理',
        },
        name: 'processParams',
        path: 'processParams',
      },
      {
        component: () =>
          import('#/views/processManagement/changeOperation.vue'),
        meta: {
          code: 'WM_456',
          ignoreAccess: true,
          title: '应用变更',
        },
        name: 'changeOperation',
        path: 'changeOperation',
      },
      {
        component: () =>
          import('#/views/processManagement/waterContentMaintenance.vue'),
        meta: {
          code: 'WM_457',
          ignoreAccess: true,
          title: '工单批号含水率维护',
        },
        name: 'waterContentMaintenance',
        path: 'waterContentMaintenance',
      },
      {
        component: () =>
          import('#/views/productionReport/productionFeedAudit.vue'),
        meta: {
          code: 'WM_458',
          ignoreAccess: true,
          title: '生产投料异常审核',
        },
        name: 'productionFeedAudit',
        path: 'productionFeedAudit',
      },
      {
        component: () => import('#/views/asdie/printTemplate.vue'),
        meta: {
          ignoreAccess: true,
          title: '模板编辑',
        },
        name: 'printTemplate',
        path: 'printTemplate',
      },
      {
        component: () =>
          import('#/views/baseInfo/printTemplateMaintenance.vue'),
        meta: {
          ignoreAccess: true,
          title: '模板维护',
        },
        name: 'printTemplateMaintenance',
        path: 'printTemplateMaintenance',
      },
      {
        component: () => import('#/views/productionReport/productRed.vue'),
        meta: {
          ignoreAccess: true,
          title: '工单冲红',
          code: 'WM_284',
        },
        name: 'productRed',
        path: 'productRed',
      },
      {
        component: () =>
          import('#/views/planManagement/workOrderStatusQuery.vue'),
        meta: {
          ignoreAccess: true,
          title: '工单状态查看',
          code: 'WM_460',
        },
        name: 'workOrderStatusQuery',
        path: 'workOrderStatusQuery',
      },
      {
        component: () =>
          import(
            '#/views/storeManagement/materialManagement/storesRequisition.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '领料申请',
          code: 'WM_322',
        },
        name: 'storesRequisition',
        path: 'storesRequisition',
      },
      {
        component: () =>
          import(
            '#/views/storeManagement/materialManagement/lineSideWarehouseAllocation.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '线边仓调拨',
          code: 'WM_521',
        },
        name: 'lineSideWarehouseAllocation',
        path: 'lineSideWarehouseAllocation',
      },
      {
        component: () =>
          import('#/views/productionReport/SMTfarm/productionDaily.vue'),
        meta: {
          ignoreAccess: true,
          title: '生产日报',
          code: 'WM_322',
        },
        name: 'productionDaily',
        path: 'productionDaily',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/pressDailyReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '压机日报',
          code: 'WM_322',
        },
        name: 'pressDailyReport',
        path: 'pressDailyReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/kilnDaily.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '窑炉日报',
          code: 'WM_322',
        },
        name: 'kilnDaily',
        path: 'kilnDaily',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/glazeLineDaily.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '釉线日报',
          code: 'WM_322',
        },
        name: 'glazeLineDaily',
        path: 'glazeLineDaily',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/poliShing.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '抛光产量日报',
          code: 'WM_322',
        },
        name: 'poliShing',
        path: 'poliShing',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/polishingShutdownDailyReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '抛光停机日报',
          code: 'WM_322',
        },
        name: 'polishingShutdownDailyReport',
        path: 'polishingShutdownDailyReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/powderDaily.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '粉料统计日报',
          code: 'WM_322',
        },
        name: 'powderDaily',
        path: 'powderDaily',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/reportonactuallossofkilnglazematerials.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '窑釉料实际损耗日报',
        },
        name: 'reportonactuallossofkilnglazematerials',
        path: 'reportonactuallossofkilnglazematerials',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/powderTransfer.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '粉料移交报表',
          code: 'WM_322',
        },
        name: 'powderTransfer',
        path: 'powderTransfer',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/polishingProductionDailyReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '抛光产量日报',
          code: 'WM_322',
        },
        name: 'polishingProductionDailyReport',
        path: 'polishingProductionDailyReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/energyConsumptionReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '能耗报表',
          code: 'WM_322',
        },
        name: 'energyConsumptionReport',
        path: 'energyConsumptionReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/summaryTableOfKilnShutdown.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '窑炉停机汇总',
          code: 'WM_322',
        },
        name: 'summaryTableOfKilnShutdown',
        path: 'summaryTableOfKilnShutdown',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/summaryTableOfGlazeLineShutdown.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '釉线停机汇总',
          code: 'WM_322',
        },
        name: 'summaryTableOfGlazeLineShutdown',
        path: 'summaryTableOfGlazeLineShutdown',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/summaryTableOfCompressorShutdown.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '压缩机停机汇总',
          code: 'WM_322',
        },
        name: 'summaryTableOfCompressorShutdown',
        path: 'summaryTableOfCompressorShutdown',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/summaryOfPowderPlantShutdown.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '粉料停机汇总',
          code: 'WM_322',
        },
        name: 'summaryOfPowderPlantShutdown',
        path: 'summaryOfPowderPlantShutdown',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/prodTimeName.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '生成产品名称',
          code: 'WM_322',
        },
        name: 'prodTimeName',
        path: 'prodTimeName',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/prodReportName.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '生产报告名称',
          code: 'WM_322',
        },
        name: 'prodReportName',
        path: 'prodReportName',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/powerConsumptionDetailsOfKilnFactory.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '窑炉耗电量详情',
          code: 'WM_322',
        },
        name: 'powerConsumptionDetailsOfKilnFactory',
        path: 'powerConsumptionDetailsOfKilnFactory',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/gasMetersForKilnShutdownInEachFactory.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '窑炉停机用燃气表',
          code: 'WM_322',
        },
        name: 'gasMetersForKilnShutdownInEachFactory',
        path: 'gasMetersForKilnShutdownInEachFactory',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/polishingWarehouseDailyReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '抛光入库日报',
          code: 'WM_322',
        },
        name: 'polishingWarehouseDailyReport',
        path: 'polishingWarehouseDailyReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/brokenSummary.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '破碎汇总',
          code: 'WM_322',
        },
        name: 'brokenSummary',
        path: 'brokenSummary',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/productionStatisticsOfAutomaticPackagingMachine.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '自动打包机生产统计',
          code: 'WM_322',
        },
        name: 'productionStatisticsOfAutomaticPackagingMachine',
        path: 'productionStatisticsOfAutomaticPackagingMachine',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/sectionLoss.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '工段损耗',
          code: 'WM_322',
        },
        name: 'sectionLoss',
        path: 'sectionLoss',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/polishingQualityDailyReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '抛光质量日报',
          code: 'WM_322',
        },
        name: 'polishingQualityDailyReport',
        path: 'polishingQualityDailyReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/batchReportOnInputoutputOfVitrifiedBrickFactoryProducts.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '玻化砖厂产品投入产出批报',
          code: 'WM_322',
        },
        name: 'batchReportOnInputoutputOfVitrifiedBrickFactoryProducts',
        path: 'batchReportOnInputoutputOfVitrifiedBrickFactoryProducts',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/dailyReportOfKilnShutdown.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '窑炉停机日报',
          code: 'WM_322',
        },
        name: 'dailyReportOfKilnShutdown',
        path: 'dailyReportOfKilnShutdown',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/monthlyBPGIOReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '玻化砖厂生产投入产出月报',
          code: 'WM_322',
        },
        name: 'monthlyBPGIOReport',
        path: 'monthlyBPGIOReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/monthlyPFIOReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '抛光厂投入产出月报',
          code: 'WM_322',
        },
        name: 'monthlyPFIOReport',
        path: 'monthlyPFIOReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/bpgPressingDetailTable.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '玻化砖厂压制量明细表',
          code: 'WM_322',
        },
        name: 'bpgPressingDetailTable',
        path: 'bpgPressingDetailTable',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/glazeRoomDailyProductionReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '制釉间生产日报',
          code: 'WM_322',
        },
        name: 'glazeRoomDailyProductionReport',
        path: 'glazeRoomDailyProductionReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/monthlyReportOfCompressor.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '压机月报',
          code: 'WM_322',
        },
        name: 'monthlyReportOfCompressor',
        path: 'monthlyReportOfCompressor',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/glazeLineMonthlyReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '釉线月报',
          code: 'WM_322',
        },
        name: 'glazeLineMonthlyReport',
        path: 'glazeLineMonthlyReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/dayPFIOReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '抛光厂投入产出日报',
          code: 'WM_322',
        },
        name: 'dayPFIOReport',
        path: 'dayPFIOReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/kilnMonthlyReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '窑炉月报',
          code: 'WM_322',
        },
        name: 'kilnMonthlyReport',
        path: 'kilnMonthlyReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/monthlyPowderReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '粉料月报',
          code: 'WM_322',
        },
        name: 'monthlyPowderReport',
        path: 'monthlyPowderReport',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/totalProductionAndBatchStatistics.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '生产总量与批次统计',
          code: 'WM_322',
        },
        name: 'totalProductionAndBatchStatistics',
        path: 'totalProductionAndBatchStatistics',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/monthlyDetailedListOfPowderMaterials.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '粉料分月明细表',
          code: 'WM_322',
        },
        name: 'monthlyDetailedListOfPowderMaterials',
        path: 'monthlyDetailedListOfPowderMaterials',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/productionSelectionSummaryTable.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '生产复选汇总表',
          code: 'WM_322',
        },
        name: 'productionSelectionSummaryTable',
        path: 'productionSelectionSummaryTable',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/energyConsumptionOfPolishingFactory.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '抛光分厂能耗',
          code: 'WM_322',
        },
        name: 'energyConsumptionOfPolishingFactory',
        path: 'energyConsumptionOfPolishingFactory',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/powderFactoryShutdownDetails.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '粉料厂停机明细表',
          code: 'WM_322',
        },
        name: 'powderFactoryShutdownDetails',
        path: 'powderFactoryShutdownDetails',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/detailedListOfGlazeLineShutdown.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '釉线停机明细表',
          code: 'WM_322',
        },
        name: 'detailedListOfGlazeLineShutdown',
        path: 'detailedListOfGlazeLineShutdown',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/detailedListOfKilnShutdown.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '窑炉停机明细表',
          code: 'WM_322',
        },
        name: 'detailedListOfKilnShutdown',
        path: 'detailedListOfKilnShutdown',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/pressShutdownDetailsTable.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '压机停机明细表',
          code: 'WM_322',
        },
        name: 'pressShutdownDetailsTable',
        path: 'pressShutdownDetailsTable',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/polishingShutdownDetails.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '抛光停机明细表',
          code: 'WM_322',
        },
        name: 'polishingShutdownDetails',
        path: 'polishingShutdownDetails',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/productionOrderScheduledActualReport.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '生产工单应发实发报表',
          code: 'WM_322',
        },
        name: 'productionOrderScheduledActualReport',
        path: 'productionOrderScheduledActualReport',
      },
      {
        component: () =>
          import('#/views/productionReport/packagingAndInventoryReversal.vue'),
        meta: {
          ignoreAccess: true,
          title: '打包入库冲销',
          code: 'WM_473',
        },
        name: 'packagingAndInventoryReversal',
        path: 'packagingAndInventoryReversal',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/energyConsumptionCollectionDetails.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '能耗采集',
          code: 'WM_473',
        },
        name: 'energyConsumptionCollectionDetails',
        path: 'energyConsumptionCollectionDetails',
      },
      {
        component: () =>
          import('#/views/productionReport/completedWorkOrderDetails.vue'),
        meta: {
          ignoreAccess: true,
          title: '完工工单明细',
          code: 'WM_516',
        },
        name: 'completedWorkOrderDetails',
        path: 'completedWorkOrderDetails',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/nonProductionEnergyConsumptionDetails.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '非生产能耗',
          code: 'WM_510',
        },
        name: 'nonProductionEnergyConsumptionDetails',
        path: 'nonProductionEnergyConsumptionDetails',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/crossSystemInteractionWorkOrderLockList.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '跨系统交互工单锁定列表',
          code: 'WM_502',
        },
        name: 'crossSystemInteractionWorkOrderLockList',
        path: 'crossSystemInteractionWorkOrderLockList',
      },
      {
        component: () =>
          import('#/views/processManagement/selectionOfRDProcessRoute.vue'),
        meta: {
          ignoreAccess: true,
          title: '研发工艺路线选择',
          code: 'WM_503',
        },
        name: 'selectionOfRDProcessRoute',
        path: 'selectionOfRDProcessRoute',
      },
      {
        component: () =>
          import('#/views/productionReport/supplementaryFeedingOperation.vue'),
        meta: {
          ignoreAccess: true,
          title: '补投料作业',
          code: 'WM_504',
        },
        name: 'supplementaryFeedingOperation',
        path: 'supplementaryFeedingOperation',
      },
      {
        component: () =>
          import('#/views/planManagement/temporaryWorkOrderManagement.vue'),
        meta: {
          ignoreAccess: true,
          title: '工单临时作业管理',
          code: 'WM_505',
        },
        name: 'temporaryWorkOrderManagement',
        path: 'temporaryWorkOrderManagement',
      },
      {
        component: () => import('#/views/productionReport/materialOffset.vue'),
        meta: {
          ignoreAccess: true,
          title: '冲红',
          code: 'WM_506',
        },
        name: 'materialOffset',
        path: 'materialOffset',
      },
      {
        component: () => import('#/views/productionReport/workOrderParams.vue'),
        meta: {
          ignoreAccess: true,
          title: '工单参数绑定',
          code: 'WM_511',
        },
        name: 'workOrderParams',
        path: 'workOrderParams',
      },
      {
        component: () =>
          import(
            '#/views/productionReport/SMTfarm/dailynewspaper/materialExceptionApprovalHistory.vue'
          ),
        meta: {
          ignoreAccess: true,
          title: '投料异常审批历史记录',
          code: 'WM_511',
        },
        name: 'materialExceptionApprovalHistory',
        path: 'materialExceptionApprovalHistory',
      },
    ],
  },
];

export { coreRoutes, fallbackNotFoundRoute };
