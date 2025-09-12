// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取分项系统下拉框
 */
export async function getItemizedList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getItemizedList`,
  );
}
/**
 * 分项系统日用能
 */
export async function getDayItemizedEnergy(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getDayItemizedEnergy?${qs.stringify(params)}`,
  );
}
/**
 * 分项系统年用能
 */
export async function getYearItemizedEnergy(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getYearItemizedEnergy?${qs.stringify(params)}`,
  );
}
/**
 * 分项系统月用能
 */
export async function getMonthItemizedEnergy(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getMonthItemizedEnergy?${qs.stringify(params)}`,
  );
}
