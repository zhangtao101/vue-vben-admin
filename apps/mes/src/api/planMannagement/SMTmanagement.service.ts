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
 * 工单状态修改（开始/结束/暂停/恢复/撤回等）
 * 根据按钮修改 status 状态：
 * 1 未开始 2 开始(正在进行中) 3 完成 4 暂停
 * 撤回：开始(2)→未开始(1)，完成(3)→开始(2)，其他不可撤回
 * 恢复：改为开始状态(2)
 */
export async function smtWorksheetUpdateStatus(data: any) {
  return requestClient.put<any>(
    `${VITE_GLOB_MES_MAIN}/plan/worksheet/updateStatus`,
    data,
  );
}

/**
 * 工单报工 / 工单冲红
 * @param bindingId 工单 id
 * @param qualityNumber 良品数（冲红可为负，报工不可）
 * @param unqualityNumber 不良品数（冲红可为负，报工不可）
 * @param personTime 人时
 * @param equipTime 机时
 * @param reportFlag 1 报工 2 冲红
 */
export async function smtWorksheetReport(data: any) {
  return requestClient.post<any>(
    `${VITE_GLOB_MES_MAIN}/plan/worksheet/report`,
    data,
  );
}

/**
 * 工单报工查看详情（返回报工/冲红记录列表）
 * @param id 工单 id
 */
export async function smtWorksheetReportDetail(id: string) {
  return requestClient.get<any>(
    `${VITE_GLOB_MES_MAIN}/plan/worksheet/reportdetail/${id}`,
  );
}
