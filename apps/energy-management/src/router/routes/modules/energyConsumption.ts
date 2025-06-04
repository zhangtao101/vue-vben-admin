import type { RouteRecordRaw } from 'vue-router';

import { $t } from '@vben/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('menu.energyManagement'),
    },
    name: 'energy',
    path: '/energy',
    children: [
      {
        component: () =>
          import(
            '#/views/energyConsumptionAnalysis/useEnergyThroughoutTheEntireSection/energyFlowDirection.vue'
          ),
        meta: {
          title: $t('menu.energyFlowDirection'),
          ignoreAccess: true,
        },
        name: 'energyFlowDirection',
        path: 'energyFlowDirection',
      },
      {
        component: () =>
          import(
            '#/views/energyConsumptionAnalysis/useEnergyThroughoutTheEntireSection/lossAnalysis.vue'
          ),
        meta: {
          title: $t('menu.energyLoss'),
          ignoreAccess: true,
        },
        name: 'lossAnalysis',
        path: 'lossAnalysis',
      },
      {
        component: () =>
          import(
            '#/views/energyConsumptionAnalysis/testAnalysis/productEnergyConsumption.vue'
          ),
        meta: {
          title: $t('menu.energyConsumptionOfTheProduct'),
          ignoreAccess: true,
        },
        name: 'productEnergyConsumption',
        path: 'productEnergyConsumption',
      },
      {
        component: () =>
          import(
            '#/views/energyConsumptionAnalysis/testAnalysis/systemEnergyConsumption.vue'
          ),
        meta: {
          title: $t('menu.energyConsumptionOfSubSystems'),
          ignoreAccess: true,
        },
        name: 'systemEnergyConsumption',
        path: 'systemEnergyConsumption',
      },
      {
        component: () =>
          import(
            '#/views/energyConsumptionAnalysis/testAnalysis/teamEnergyConsumption.vue'
          ),
        meta: {
          title: $t('menu.teamEnergyUtilization'),
          ignoreAccess: true,
        },
        name: 'teamEnergyConsumption',
        path: 'teamEnergyConsumption',
      },
      // 耗能统计
      {
        component: () =>
          import(
            '#/views/energyConsumptionStatistics/energyConsumptionCost/electricityCost.vue'
          ),
        meta: {
          title: $t('menu.electricityConsumptionFee'),
          ignoreAccess: true,
        },
        name: 'electricityCost',
        path: 'electricityCost',
      },
      {
        component: () =>
          import(
            '#/views/energyConsumptionStatistics/energyConsumptionCost/adjustmentFee.vue'
          ),
        meta: {
          title: $t('menu.powerRegulationCharge'),
          ignoreAccess: true,
        },
        name: 'adjustmentFee',
        path: 'adjustmentFee',
      },
      {
        component: () =>
          import(
            '#/views/energyConsumptionStatistics/energyConsumptionCost/comprehensiveWaterFee.vue'
          ),
        meta: {
          title: $t('menu.combinedWaterCharge'),
          ignoreAccess: true,
        },
        name: 'comprehensiveWaterFee',
        path: 'comprehensiveWaterFee',
      },
      {
        component: () =>
          import(
            '#/views/energyConsumptionStatistics/qualityAnalysis/electricityConsumptionData.vue'
          ),
        meta: {
          title: $t('menu.electricityConsumptionData'),
          ignoreAccess: true,
        },
        name: 'electricityConsumptionData',
        path: 'electricityConsumptionData',
      },
      {
        component: () =>
          import(
            '#/views/energyConsumptionStatistics/qualityAnalysis/waterUsageData.vue'
          ),
        meta: {
          title: $t('menu.waterUsageData'),
          ignoreAccess: true,
        },
        name: 'waterUsageData',
        path: 'waterUsageData',
      },
      {
        component: () =>
          import('#/views/configurationEditing/configurationEditing.vue'),
        meta: {
          title: $t('menu.configurationEditing'),
          ignoreAccess: true,
        },
        name: 'configurationEditing',
        path: 'configurationEditing',
      },
    ],
  },
];

export default routes;
