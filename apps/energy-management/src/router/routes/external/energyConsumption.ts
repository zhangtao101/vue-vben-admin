import type { RouteRecordRaw } from 'vue-router';

import { VBEN_LOGO_URL } from '@vben/constants';

const routes: RouteRecordRaw[] = [
  {
    component: () =>
      import(
        '#/views/energyConsumptionAnalysis/useEnergyThroughoutTheEntireSection/energyFlowDirection.vue'
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
        '#/views/energyConsumptionAnalysis/useEnergyThroughoutTheEntireSection/lossAnalysis.vue'
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
        '#/views/energyConsumptionAnalysis/testAnalysis/productEnergyConsumption.vue'
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
        '#/views/energyConsumptionAnalysis/testAnalysis/systemEnergyConsumption.vue'
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
        '#/views/energyConsumptionAnalysis/testAnalysis/teamEnergyConsumption.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '班组用能',
      ignoreAccess: true,
    },
    name: 'teamEnergyConsumption',
    path: '/teamEnergyConsumption',
  },
  // 耗能统计
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/energyConsumptionCost/electricityCost.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '电度电费',
      ignoreAccess: true,
    },
    name: 'electricityCost',
    path: '/electricityCost',
  },
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/energyConsumptionCost/adjustmentFee.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '力调电费',
      ignoreAccess: true,
    },
    name: 'adjustmentFee',
    path: '/adjustmentFee',
  },
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/energyConsumptionCost/comprehensiveWaterFee.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '综合水费',
      ignoreAccess: true,
    },
    name: 'comprehensiveWaterFee',
    path: '/comprehensiveWaterFee',
  },
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/qualityAnalysis/electricityConsumptionData.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '用电数据',
      ignoreAccess: true,
    },
    name: 'electricityConsumptionData',
    path: '/electricityConsumptionData',
  },
  {
    component: () =>
      import(
        '#/views/energyConsumptionStatistics/qualityAnalysis/waterUsageData.vue'
      ),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '用水数据',
      ignoreAccess: true,
    },
    name: 'waterUsageData',
    path: '/waterUsageData',
  },
  {
    component: () =>
      import('#/views/configurationEditing/configurationEditing.vue'),
    meta: {
      icon: VBEN_LOGO_URL,
      title: '组态编辑',
      ignoreAccess: true,
    },
    name: 'configurationEditing',
    path: '/configurationEditing',
  },
];

export default routes;
