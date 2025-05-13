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
  // 报表管理
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('menu.reportManagement'),
    },
    name: 'reportManager',
    path: '/reportManager',
    children: [
      {
        name: 'reportManager',
        path: 'reportManager',
        component: () => import('#/views/reportManager/reportManager.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.dispatchOperation'),
        },
      },
    ],
  },
];

export default routes;
