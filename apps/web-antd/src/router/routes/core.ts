import type { RouteRecordRaw } from 'vue-router';

import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@vben/constants';

import { AuthPageLayout, EmptyLayout } from '#/layouts';
import { $t } from '#/locales';
import Login from '#/views/_core/authentication/login.vue';

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
  {
    meta: {
      title: 'Root',
    },
    name: 'Root',
    path: '/',
    redirect: DEFAULT_HOME_PATH,
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
          import('#/views/productionReport/packagingAndInventoryReversal.vue'),
        meta: {
          ignoreAccess: true,
          title: '打包入库冲销',
          code: 'WM_473',
        },
        name: 'packagingAndInventoryReversal',
        path: 'packagingAndInventoryReversal',
      },
    ],
  },
];

export { coreRoutes, fallbackNotFoundRoute };
