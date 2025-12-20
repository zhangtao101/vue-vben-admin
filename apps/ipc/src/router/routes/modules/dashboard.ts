import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  /*
  // 概览页
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
  },*/
  {
    meta: {
      icon: 'mdi:assignment',
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
          icon: 'mdi:shuffle-variant',
          ignoreAccess: true,
          title: $t('menu.dispatchOperation'),
        },
      },
      {
        name: 'workOrderEntry',
        path: 'workOrderEntry',
        component: () => import('#/views/flow/workOrderEntry.vue'),
        meta: {
          icon: 'mdi:elevator-down',
          ignoreAccess: true,
          title: $t('menu.workOrderInbound'),
        },
      },
      {
        name: 'productionOperation',
        path: 'productionOperation',
        component: () => import('#/views/flow/productionOperation.vue'),
        meta: {
          icon: 'mdi:file-clock-outline',
          ignoreAccess: true,
          title: $t('menu.productionOperation'),
        },
      },
      {
        name: 'workOrderOutbound',
        path: 'workOrderOutbound',
        component: () => import('#/views/flow/workOrderOutbound.vue'),
        meta: {
          icon: 'mdi:elevator-up',
          ignoreAccess: true,
          title: $t('menu.workOrderOutbound'),
        },
      },
      /* {
        name: 'barcodeInspection',
        path: 'barcodeInspection',
        component: () => import('#/views/flow/barcodeInspection.vue'),
        meta: {
          icon: 'mdi:qrcode',
          ignoreAccess: true,
          title: $t('menu.barcodeInspection'),
        },
      },
      {
        name: 'ctuCartonPicking',
        path: 'ctuCartonPicking',
        component: () => import('#/views/flow/ctuCartonPicking.vue'),
        meta: {
          icon: 'mdi:inbox-full-outline',
          ignoreAccess: true,
          title: $t('menu.ctuCartonPicking'),
        },
      },
      {
        name: 'ctuOutboundPicking',
        path: 'ctuOutboundPicking',
        component: () => import('#/views/flow/ctuOutboundPicking.vue'),
        meta: {
          icon: 'mdi:file-table-box-multiple-outline',
          ignoreAccess: true,
          title: $t('menu.ctuOutboundPicking'),
        },
      },
      {
        name: 'ioBillOperation',
        path: 'ioBillOperation',
        component: () => import('#/views/flow/ioBillOperation.vue'),
        meta: {
          icon: 'mdi:text-box-edit-outline',
          ignoreAccess: true,
          title: $t('menu.ioBillOperation'),
        },
      },*/
    ],
  },
  {
    meta: {
      icon: 'mdi:alarm-light',
      order: -1,
      title: $t('menu.andonManagement'),
    },
    name: 'andon',
    path: '/andon',
    children: [
      {
        name: 'andengFillingOut',
        path: 'andengFillingOut',
        component: () => import('#/views/andon/andengFillingOut.vue'),
        meta: {
          icon: 'mdi:file-edit-outline',
          ignoreAccess: true,
          title: $t('menu.andengFillingOut'),
        },
      },
      {
        name: 'andonProblemAssessment',
        path: 'andonProblemAssessment',
        component: () => import('#/views/andon/andonProblemAssessment.vue'),
        meta: {
          icon: 'mdi:report-problem',
          ignoreAccess: true,
          title: $t('menu.andonProblemAssessment'),
        },
      },
      {
        name: 'andonManagement',
        path: 'andonManagement',
        component: () => import('#/views/andon/andon.vue'),
        meta: {
          icon: 'mdi:alarm-light',
          ignoreAccess: true,
          title: $t('menu.andonManagement'),
        },
      },
    ],
  },
  {
    meta: {
      icon: 'mdi:quality-medium',
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
          icon: 'mdi:quality-medium',
          ignoreAccess: true,
          title: $t('menu.qualityInspection'),
        },
      },
      {
        name: 'badJudgment',
        path: 'badJudgment',
        component: () => import('#/views/poorHandling/badJudgment.vue'),
        meta: {
          icon: 'mdi:error-outline',
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
  /*  // 报表管理
  {
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
  },*/
];

export default routes;
