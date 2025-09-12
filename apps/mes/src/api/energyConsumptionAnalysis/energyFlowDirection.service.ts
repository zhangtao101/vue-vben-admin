// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 电能源流向
 */
export async function getEnergyFlowDL(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getEnergyFlowDL?${qs.stringify(params)}`,
  );
}

/**
 * 水能源流向
 */
export async function getEnergyFlowWL(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getEnergyFlowWL?${qs.stringify(params)}`,
  );
}
