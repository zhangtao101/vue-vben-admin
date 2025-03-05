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
];

export default routes;
