// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

const { VITE_GLOB_MES_MAIN } = import.meta.env;

/**
 * 查询工单列表（分页）
 */
export async function smtWorksheetSearch(params: any) {
  return requestClient.get<any>(
    `${VITE_GLOB_MES_MAIN}/plan/worksheet/search?${qs.stringify(params)}`,
  );
}

/**
 * 新增工单
 */
export async function smtWorksheetCreate(data: any) {
  return requestClient.post<any>(`${VITE_GLOB_MES_MAIN}/plan/worksheet/add`, data);
}

/**
 * 查询工单详情
 */
export async function smtWorksheetDetail(id: string) {
  return requestClient.get<any>(`${VITE_GLOB_MES_MAIN}/plan/worksheet/detail/${id}`);
}

/**
 * 修改工单
 */
export async function smtWorksheetUpdate(data: any) {
  return requestClient.put<any>(`${VITE_GLOB_MES_MAIN}/plan/worksheet/update`, data);
}

/**
 * 删除工单
 */
export async function smtWorksheetDelete(id: string) {
  return requestClient.delete<any>(`${VITE_GLOB_MES_MAIN}/plan/worksheet/delete/${id}`);
}

/**
 * 导出工单
 */
export async function smtWorksheetExport(params: any) {
  return requestClient.get<any>(
    `${VITE_GLOB_MES_MAIN}/plan/worksheet/export?${qs.stringify(params)}`,
  );
}

/**
 * 下载导入模板
 */
export async function smtDownloadTemplate() {
  return requestClient.get<any>(`${VITE_GLOB_MES_MAIN}/plan/worksheet/downloadTemplate`);
}

/**
 * 查询子计划列表（用于选择子计划）
 */
export async function smtSubPlanSearch(params: any) {
  return requestClient.get<any>(
    `${VITE_GLOB_MES_MAIN}/plan/subPlan/search?${qs.stringify(params)}`,
  );
}

/**
 * 根据子计划号查询计划情况
 */
export async function smtPlanSituation(params: any) {
  return requestClient.get<any>(
    `${VITE_GLOB_MES_MAIN}/plan/worksheet/planSituation?${qs.stringify(params)}`,
  );
}

/**
 * 查询所有线别
 */
export async function smtAllLineList(processType: number) {
  return requestClient.get<any>(
    `${VITE_GLOB_MES_MAIN}/produce/Line/list/all?processType=${processType}`,
  );
}

/**
 * 根据字典编码查询字典信息（如工单单别 GDLX）
 */
export async function smtWorkerTypeList(parCode: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/listWordListByParCode?parCode=${parCode}`,
  );
}
