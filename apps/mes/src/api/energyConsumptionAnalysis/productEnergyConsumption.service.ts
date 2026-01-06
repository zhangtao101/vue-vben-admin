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
 * 获取分项系统下拉框(id)
 */
export async function getItemized() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getItemized`,
  );
}
/**
 * 获取二氧化碳排放分项系统下拉框
 */
export async function getCo2ItemizedList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getCo2ItemizedList`,
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
/**
 * 二氧化碳排放仪表查询
 */
export async function getCo2YB(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getCo2YB?${qs.stringify(params)}`,
  );
}
/**
 * 二氧化碳排数据查询
 */
export async function getCo2Data(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getCo2Data?${qs.stringify(params)}`,
  );
}
/**
 * 电网排放因子导入
 */
export async function introductionOfGridEmissionFactors(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/EnergyInsert/insertdwyz`,
    params,
  );
}
/**
 * 电网排放因子启停用
 */
export async function useGridEmissionFactors(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Param/UseDLParam`,
    params,
  );
}
/**
 * 电网排放因子查询
 */
export async function queryGridEmissionFactors(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Param/getDLParamList?${qs.stringify(params)}`,
  );
}
/**
 * 气体二氧化碳计算参数导入
 */
export async function introductionOfGasCarbonDioxideCalculationParameter(
  params: any,
) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/EnergyInsert/insertrqcs`,
    params,
  );
}

/**
 * 气体二氧化碳计算参数启停用
 */
export async function useGasCarbonDioxideCalculationParameter(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Param/UseRpParam`,
    params,
  );
}
/**
 * 气体二氧化碳计算参数查询
 */
export async function getGasCarbonDioxideCalculationParameter(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Param/GetQParamList?${qs.stringify(params)}`,
  );
}
