// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分项用能占比
 */
export async function getFXEnergy(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getFXEnergy?${qs.stringify(params)}`,
  );
}
/**
 * 分项用能对比
 */
export async function getFXEnergyDB(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getFXEnergyDB?${qs.stringify(params)}`,
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
/**
 * 分项用能占比(二氧化碳排放)
 */
export async function getCo2FXEnergy() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getCo2FXEnergy`,
  );
}
/**
 * 分项用能对比(二氧化碳排放)
 */
export async function getCo2FXEnergyQS() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getCo2FXEnergyQS`,
  );
}
/**
 * 用能趋势(二氧化碳排放)
 */
export async function getCo2FXEnergyDB(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getCo2FXEnergyDB?${qs.stringify(params)}`,
  );
}
/**
 * 分项用能同比(二氧化碳排放)
 */
export async function getCo2FXEnergyTB(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getCo2FXEnergyTB?${qs.stringify(params)}`,
  );
}
