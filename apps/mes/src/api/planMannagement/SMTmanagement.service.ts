// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

const { VITE_GLOB_MES_MAIN } = import.meta.env;

// ========== 类型定义 ==========

/** 工单分页查询参数 */
export interface WorksheetSearchParams {
  /** 每页条数 */
  pageSize?: number;
  /** 当前页码 */
  pageNum?: number;
  /** 其他查询条件 */
  [key: string]: any;
}

/** 工单列表项 */
export interface WorksheetItem {
  /** id（最后一行id为null的表示总和行） */
  id?: null | number;
  /** 工单编码 */
  workSheetCode?: null | string;
  /** 计划编码 */
  planCode?: null | string;
  customerName?: null;
  /** 产品名称 */
  productName?: null | string;
  /** 产品编码 */
  productCode?: null | string;
  /** 子计划编码 */
  subPlanCode?: null | string;
  /** 子产品编码 */
  subProductCode?: null | string;
  /** 子产品名称 */
  subProductName?: null | string;
  /** 计划开始日期 */
  planDateStart?: null | string;
  /** 计划结束日期 */
  planDateStop?: null | string;
  /** 子计划数量 */
  subPlanNumber?: null | number;
  /** 未排产数量 */
  produceUnarrangedNumber?: null | number;
  /** 未完成数量 */
  produceNotFinishNumber?: null | number;
  /** 工单计划数量 */
  workSheetPlanNumber: number;
  /** 工单完成数量 */
  workSheetFinishNumber?: null | number;
  /** 生产车间 */
  produceWorkshop?: null | string;
  /** 产线ID */
  lineId?: null | number;
  /** 产线名称 */
  lineName?: null | string;
  /** 备注 */
  remark?: null | string;
  /** 工序类型 */
  processType?: null | number;
  processTypeCode?: null;
  /** 状态 */
  status?: null | number;
  /** 延期状态 */
  delayStatus?: null | number;
  /** 创建时间 */
  createTime?: null | string;
  /** 更新时间 */
  updateTime?: null | string;
  /** 更新用户 */
  updateUser?: null | number;
  updateUsername?: null;
  isProductPlan?: null;
  /** 准时完成数量 */
  onTimeFinishNumber?: null | number;
  /** 延期完成数量 */
  delayFinishNumber?: null | number;
  sideNo?: null;
  worksheetCodea?: null;
  canDistributeNumber?: null;
  /** 更新日期标记 */
  updateDateFlag: boolean;
  defectNumber?: null;
  repairNumber?: null;
  isRework?: null;
  outputId?: null;
  workSheetId?: null;
  /** 合格品数量 */
  goodQty?: number;
  /** 不良品数量 */
  defectQty?: number;
  /** 剩余数量 */
  remainQty?: number;
}

/** 工单分页查询结果 */
export interface WorksheetSearchResult {
  /** 总数 */
  total: number;
  /** 计数 */
  count: number;
  /** 工单列表 */
  results: WorksheetItem[];
}

/** 工单结束上报参数 */
export interface WorksheetOutputUpdateParams {
  /** 不良品数量 */
  defectQty: number;
  /** 合格品数量 */
  goodQty: number;
  /** 主键ID */
  id: number;
  /** 剩余数量 */
  remainQty: number;
}

/** 工单状态修改参数 */
export interface WorksheetUpdateStatusParams {
  /** 工单ID */
  id: number;
  /** 状态 */
  status: string;
}

// ========== 接口函数 ==========

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
 * 工单结束上报
 * @param data 修改参数
 * @since 2026-08-11
 */
export async function worksheetOutputUpdateBatch(
  data: WorksheetOutputUpdateParams,
) {
  return requestClient.put<any>(
    `${VITE_GLOB_MES_MAIN}/plan/worksheet/update`,
    data,
  );
}

/**
 * 工单状态修改
 * @param data 状态修改参数
 * @since 2026-08-11
 */
export async function worksheetUpdateStatus(
  data: WorksheetUpdateStatusParams,
) {
  return requestClient.put<any>(
    `${VITE_GLOB_MES_MAIN}/plan/worksheet/updateStatus?${qs.stringify(data)}`,
    data,
  );
}
