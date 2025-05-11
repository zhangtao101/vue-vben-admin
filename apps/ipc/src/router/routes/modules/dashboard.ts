import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
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
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('menu.workFlow'),
    },
    name: 'workFlow',
    path: '/workFlow',
    children: [
      {
        name: 'dispatchHomework',
        path: 'dispatchHomework',
        component: () => import('#/views/flow/dispatchHomework.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.dispatchOperation'),
        },
      },
      {
        name: 'workOrderEntry',
        path: 'workOrderEntry',
        component: () => import('#/views/flow/workOrderEntry.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.workOrderInbound'),
        },
      },
      {
        name: 'productionOperation',
        path: 'productionOperation',
        component: () => import('#/views/flow/productionOperation.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.productionOperation'),
        },
      },
      {
        name: 'workOrderOutbound',
        path: 'workOrderOutbound',
        component: () => import('#/views/flow/workOrderOutbound.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.workOrderOutbound'),
        },
      },
    ],
  },
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('menu.andonManagement'),
    },
    name: 'andon',
    path: '/andon',
    children: [
      {
        name: 'andonManagement',
        path: 'andonManagement',
        component: () => import('#/views/andon/andon.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.andonManagement'),
        },
      },
      {
        name: 'andonProblemAssessment',
        path: 'andonProblemAssessment',
        component: () => import('#/views/andon/andonProblemAssessment.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.andonProblemAssessment'),
        },
      },
      {
        name: 'andengFillingOut',
        path: 'andengFillingOut',
        component: () => import('#/views/andon/andengFillingOut.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.andengFillingOut'),
        },
      },
    ],
  },
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('menu.poorHandling'),
    },
    name: 'poorHandling',
    path: '/poorHandling',
    children: [
      {
        name: 'qualityInspection',
        path: 'qualityInspection',
        component: () => import('#/views/poorHandling/qualityInspection.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.qualityInspection'),
        },
      },
      {
        name: 'badJudgment',
        path: 'badJudgment',
        component: () => import('#/views/poorHandling/badJudgment.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.badJudgment'),
        },
      },
      {
        name: 'rework',
        path: 'rework/:id',
        component: () => import('#/views/poorHandling/rework.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.rework'),
          hideInMenu: true,
        },
      },
    ],
  },
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('menu.reportManagement'),
    },
    name: 'bb',
    path: '/bb',
    children: [
      {
        name: 'test',
        path: 'test',
        component: () => import('#/views/reportForms/test.vue'),
        meta: {
          ignoreAccess: true,
          title: $t('menu.dispatchOperation'),
        },
      },
    ],
  },
];

export default routes;
