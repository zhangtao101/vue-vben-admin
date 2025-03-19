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
    ],
  },
];

export default routes;
