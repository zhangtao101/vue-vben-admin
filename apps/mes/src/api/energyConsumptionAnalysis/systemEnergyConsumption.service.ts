// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分项用能占比
 */
export async function getFXEnergy() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getFXEnergy`,
  );
}
/**
 * 分项用能对比
 */
export async function getFXEnergyDB() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getFXEnergyDB`,
  );
}
/**
 * 用能趋势
 */
export async function getFXEnergyQS(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getFXEnergyQS?${qs.stringify(params)}`,
  );
}
/**
 * 分项用能同比
 */
export async function getFXEnergyTB(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getFXEnergyTB?${qs.stringify(params)}`,
  );
}
