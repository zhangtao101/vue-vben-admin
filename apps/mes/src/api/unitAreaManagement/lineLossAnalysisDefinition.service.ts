// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取线损分析定义列表
 */
export async function getLineLossAnalysisList(queryParams: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/LineLossAnalysis/getLineLossAnalysisList?${qs.stringify(queryParams)}`,
  );
}
/**
 * 线损分析对象编号检验
 */
export async function checkLineLossNumber(queryParams: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/LineLossAnalysis/checkLineLossNumber?${qs.stringify(queryParams)}`,
  );
}
/**
 * 线损分析对象名称检验
 */
export async function checkLineLossName(queryParams: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/LineLossAnalysis/checkLineLossName?${qs.stringify(queryParams)}`,
  );
}
/**
 * 线损配置仪表查询
 */
export async function selectLossEquipment() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/LineLossAnalysis/selectLossEquipment`,
  );
}
/**
 * 新增分析对象
 */
export async function AddLineLossAnalysis(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/LineLossAnalysis/AddLineLossAnalysis`,
    params,
  );
}
/**
 * 线损配置
 */
export async function addLineLossAnalysisConfiguration(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/LineLossAnalysis/addLineLossAnalysisConfiguration`,
    params,
  );
}
/**
 * 编辑分析对象
 */
export async function updateLineLoss(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/LineLossAnalysis/updateLineLoss`,
    params,
  );
}

/**
 * 线损分析对象删除
 */
export async function deleteLineLossAnalysis(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/LineLossAnalysis/Delete/${params}`,
  );
}
