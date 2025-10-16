// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 展示所有隐患处理信息
 */
export async function displayAllHiddenDangerHandlingInformation(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/report/listAll?${qs.stringify(params)}`,
  );
}
/**
 * 导出所有隐患处理信息
 */
export async function displayAllHiddenDangerHandlingInformationExport(
  params: any,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/report/downloadExcel?${qs.stringify(params)}`,
  );
}
/**
 * 展示隐患处理详情(历史)
 */
export async function displayHiddenDangerHandlingDetails(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/report/getByReportCode/${params}`,
  );
}
/**
 * 展示隐患处理详情
 */
export async function operationByReportCode(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/report/operationByReportCode/${params}`,
  );
}

/**
 * 更新数据
 */
export async function updateData(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/report/updateAll`,
    params,
  );
}

/**
 * 更新数据
 */
export async function retracementData(reportCode: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/report/updateState/${reportCode}`,
    {},
  );
}

/**
 * 隐患确认新增
 */
export async function confirmInsert(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/confirm/insert`,
    params,
  );
}

/**
 * 隐患确认更新
 */
export async function confirmUpdate(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/confirm/update`,
    params,
  );
}

/**
 * 隐患整改新增
 */
export async function rectificationInsert(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/rectification/insert`,
    params,
  );
}

/**
 * 隐患整改更新
 */
export async function rectificationUpdate(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/rectification/update`,
    params,
  );
}

/**
 * 隐患整改新增
 */
export async function implementationInsert(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/implementation/insert`,
    params,
  );
}

/**
 * 隐患整改更新
 */
export async function implementationUpdate(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/implementation/update`,
    params,
  );
}

/**
 * 隐患整改新增
 */
export async function acceptanceInsert(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/acceptance/insert`,
    params,
  );
}

/**
 * 隐患整改更新
 */
export async function acceptanceUpdate(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/acceptance/update`,
    params,
  );
}

/**
 * 隐患整改派发
 */
export async function distributed(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazard/confirm/updateConfrim`,
    params,
  );
}
