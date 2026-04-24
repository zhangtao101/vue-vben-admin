// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 点检计划相关 ==========

/**
 * 点巡检类型
 */
export type InspectionType = 'INSPECTION' | 'PATROL';

/**
 * 频率单位
 */
export type FrequencyUnit = 'DAY' | 'MONTH' | 'WEEK';

/**
 * 状态
 */
export type PlanStatus = 'ACTIVE' | 'DISABLED';

/**
 * 点检计划查询参数
 */
export interface InspectionPlanParams {
  keyword?: string;
  inspectionType?: InspectionType;
  status?: PlanStatus;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 点检计划
 */
export interface InspectionPlan {
  id?: number;
  planName?: string;
  schemeId?: number;
  schemeName?: string;
  inspectionType?: InspectionType;
  equipmentGroup?: string;
  equipmentCodes?: string;
  equipmentCount?: number;
  firstExecuteTime?: string;
  frequencyValue?: number;
  frequencyUnit?: FrequencyUnit;
  effectiveDate?: string;
  endDate?: string;
  status?: PlanStatus;
  remark?: string;
}

/**
 * 创建点检计划参数
 */
export interface CreateInspectionPlanParams {
  planName: string;
  schemeId: number | string;
  firstExecuteTime: string;
  frequencyValue: number;
  frequencyUnit: FrequencyUnit;
  effectiveDate: string;
  endDate?: string;
  status: PlanStatus;
  remark?: string;
}

/**
 * 更新点检计划参数
 */
export interface UpdateInspectionPlanParams extends CreateInspectionPlanParams {
  id: number;
}

// ========== 点检计划操作 ==========

/**
 * 点检计划下拉/不分页查询
 */
export async function getInspectionPlanList(params: InspectionPlanParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection/list?${qs.stringify(params)}`,
  );
}

/**
 * 点检计划列表分页查询
 */
export async function getInspectionPlanPage(params: InspectionPlanParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 点检计划详情
 */
export async function getInspectionPlanById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection/${id}`,
  );
}

/**
 * 新增点检计划
 */
export async function createInspectionPlan(params: CreateInspectionPlanParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection/create`,
    params,
  );
}

/**
 * 编辑点检计划
 */
export async function updateInspectionPlan(params: UpdateInspectionPlanParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection/update`,
    params,
  );
}

/**
 * 删除点检计划
 */
export async function deleteInspectionPlan(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection/${id}`,
  );
}

/**
 * 启用点检计划
 */
export async function enableInspectionPlan(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection/enable/${id}`,
  );
}

/**
 * 停用点检计划
 */
export async function disableInspectionPlan(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection/disable/${id}`,
  );
}
