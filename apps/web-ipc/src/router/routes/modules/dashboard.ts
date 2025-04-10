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
        component: import('#/views/productionOperation.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.productionOperation'),
        },
      },
      {
        name: 'dispatchHomework',
        path: '/dispatchHomework',
        component: import('#/views/dispatchHomework.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.dispatchOperation'),
        },
      },
      {
        name: 'workOrderEntry',
        path: '/workOrderEntry',
        component: import('#/views/workOrderEntry.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.workOrderInbound'),
        },
      },
      {
        name: 'workOrderOutbound',
        path: '/workOrderOutbound',
        component: import('#/views/workOrderOutbound.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.workOrderOutbound'),
        },
      },
      {
        name: 'andon',
        path: '/andon',
        component: import('#/views/andon.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.andonManagement'),
        },
      },
      {
        name: 'qualityInspection',
        path: '/qualityInspection',
        component: import('#/views/qualityInspection.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.qualityInspection'),
        },
      },
    ],
  },
];

export default routes;
