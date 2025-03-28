import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('#/views/ai/myTest.vue'),
    meta: {
      icon: VBEN_LOGO_URL,
      title: $t('demos.vben.title'),
      ignoreAccess: true,
    },
    name: 'aiTest',
    path: '/aiTest',
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
      ignoreAccess: true,
    },
    name: 'Test',
    path: '/',
    children: [
      {
        name: 'Analytics',
        path: '/analytics_test',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.analytics'),
          ignoreAccess: true,
        },
      },
      {
        name: 'Workspace',
        path: '/workspace_test',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
          ignoreAccess: true,
        },
      },
      {
        name: 'productionOperation',
        path: '/productionOperation',
        component: import('#/views/productionOperation.vue'),
        meta: {
          ignoreAccess: true,
          title: '生产作业',
        },
      },
      {
        name: 'dispatchHomework',
        path: '/dispatchHomework',
        component: import('#/views/dispatchHomework.vue'),
        meta: {
          ignoreAccess: true,
          title: '派工作业',
        },
      },
      {
        name: 'workOrderEntry',
        path: '/workOrderEntry',
        component: import('#/views/workOrderEntry.vue'),
        meta: {
          ignoreAccess: true,
          title: '工单进站',
        },
      },
      {
        name: 'workOrderOutbound',
        path: '/workOrderOutbound',
        component: import('#/views/workOrderOutbound.vue'),
        meta: {
          ignoreAccess: true,
          title: '工单出站',
        },
      },
      {
        name: 'andon',
        path: '/andon',
        component: import('#/views/andon.vue'),
        meta: {
          ignoreAccess: true,
          title: '安灯管理',
        },
      },
      {
        name: 'qualityInspection',
        path: '/qualityInspection',
        component: import('#/views/qualityInspection.vue'),
        meta: {
          ignoreAccess: true,
          title: '质量检验',
        },
      },
    ],
  },
];

export default routes;
