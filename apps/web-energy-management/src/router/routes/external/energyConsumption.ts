import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

const routes: RouteRecordRaw[] = [
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/useEnergyThroughoutTheEntireSection/energyFlowDirection.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '能源流向',
      ignoreAccess: true,
    },
    name: 'energyFlowDirection',
    path: '/energyFlowDirection',
  },
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/useEnergyThroughoutTheEntireSection/lossAnalysis.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '能源损耗',
      ignoreAccess: true,
    },
    name: 'lossAnalysis',
    path: '/lossAnalysis',
  },
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/testAnalysis/productEnergyConsumption.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '产品用能',
      ignoreAccess: true,
    },
    name: 'productEnergyConsumption',
    path: '/productEnergyConsumption',
  },
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/testAnalysis/systemEnergyConsumption.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '分项系统用能',
      ignoreAccess: true,
    },
    name: 'systemEnergyConsumption',
    path: '/systemEnergyConsumption',
  },
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/testAnalysis/teamEnergyConsumption.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '班组用能',
      ignoreAccess: true,
    },
    name: 'teamEnergyConsumption',
    path: '/teamEnergyConsumption',
  },
];

export default routes;
