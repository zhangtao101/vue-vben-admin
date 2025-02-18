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
    ],
  },
];

export { coreRoutes, fallbackNotFoundRoute };
