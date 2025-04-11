import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('menu.workFlow'),
    },
    name: 'workFlow',
    path: '/workFlow',
    children: [
      {
        name: 'productionOperation',
        path: '/productionOperation',
        component: import('#/views/flow/productionOperation.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.productionOperation'),
        },
      },
      {
        name: 'dispatchHomework',
        path: '/dispatchHomework',
        component: import('#/views/flow/dispatchHomework.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.dispatchOperation'),
        },
      },
      {
        name: 'workOrderEntry',
        path: '/workOrderEntry',
        component: import('#/views/flow/workOrderEntry.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.workOrderInbound'),
        },
      },
      {
        name: 'workOrderOutbound',
        path: '/workOrderOutbound',
        component: import('#/views/flow/workOrderOutbound.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.workOrderOutbound'),
        },
      },
      {
        name: 'andon',
        path: '/andon',
        component: import('#/views/flow/andon.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.andonManagement'),
        },
      },
      {
        name: 'qualityInspection',
        path: '/qualityInspection',
        component: import('#/views/flow/qualityInspection.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.qualityInspection'),
        },
      },
    ],
  },
];

export default routes;
