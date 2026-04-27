// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 模具保养计划相关 ==========

/**
 * 模具保养计划接口参数
 */
export interface MoldMaintenancePlanParams {
  keyword?: string;
  schemeName?: string;
  planType?: string;
  categoryName?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 保养项目
 */
export interface MoldMaintenancePlanItem {
  sequenceNo?: number;
  itemCode?: string;
  itemName?: string;
  itemRequirement?: string;
  itemStandard?: string;
}

/**
 * 模具保养计划实体（列表）
 */
export interface MoldMaintenancePlan {
  id?: number;
  planCode?: string;
  planName?: string;
  schemeId?: number;
  schemeCode?: string;
  schemeName?: string;
  moldId?: number;
  moldCode?: string;
  planType?: string;
  status?: string;
  operator?: string;
  remark?: string;
  createdTime?: string;
  updatedTime?: string;
  equipmentGroup?: string;
  firstExecuteTime?: string;
  frequencyValue?: number;
  frequencyUnit?: string;
  effectiveDate?: string;
  endDate?: string;
  isStopMachine?: boolean;
}

/**
 * 模具保养计划详情实体
 */
export interface MoldMaintenancePlanDetail {
  id?: number;
  planName?: string;
  schemeId?: number;
  schemeName?: string;
  planType?: string;
  moldCategoryName?: string;
  moldCodes?: string;
  moldCount?: number;
  firstExecuteTime?: string;
  frequencyValue?: number;
  frequencyUnit?: string;
  conditionDimension?: string;
  compareOperator?: string;
  triggerValue?: number;
  triggerUnit?: string;
  effectiveDate?: string;
  endDate?: string;
  status?: string;
  remark?: string;
}

/**
 * 模具保养计划提交表单
 */
export interface MoldMaintenancePlanSubmit {
  plan: {
    compareOperator?: string;
    conditionDimension?: string;
    effectiveDate: string;
    endDate?: string;
    firstExecuteTime?: string;
    frequencyUnit?: string;
    frequencyValue?: number;
    id?: number;
    planName: string;
    planType: string;
    schemeId: number;
    status: string;
    triggerUnit?: string;
    triggerValue?: number;
  };
  details: MoldMaintenancePlanItem[];
}

/**
 * 启用/停用状态更新
 */
export interface MoldMaintenancePlanStatus {
  planId: number;
  status: string;
}

// ========== 模具保养计划查询 ==========

/**
 * 模具保养计划下拉/不分页查询
 */
export async function getMoldMaintenancePlanList(params?: {
  keyword?: string;
  planType?: string;
  schemeName?: string;
  status?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/plan/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 模具保养计划分页查询
 */
export async function getMoldMaintenancePlanPage(
  params: MoldMaintenancePlanParams,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/plan/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 模具保养计划详情
 */
export async function getMoldMaintenancePlanById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/plan/detail?id=${id}`,
  );
}

/**
 * 删除模具保养计划
 */
export async function deleteMoldMaintenancePlan(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/plan/${id}`,
  );
}

// ========== 模具保养计划 CRUD ==========

/**
 * 新增/编辑模具保养计划
 */
export async function saveMoldMaintenancePlan(
  params: MoldMaintenancePlanSubmit,
) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/plan`,
    params,
  );
}

// ========== 模具保养计划状态操作 ==========

/**
 * 启用/停用模具保养计划
 */
export async function updateMoldMaintenancePlanStatus(
  params: MoldMaintenancePlanStatus,
) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/plan/update-status`,
    params,
  );
}
