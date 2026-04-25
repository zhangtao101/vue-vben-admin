// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 设备保养计划相关 ==========

/**
 * 设备保养计划接口参数
 */
export interface MaintenancePlanParams {
  keyword?: string;
  planType?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 设备保养计划实体
 */
export interface MaintenancePlan {
  id?: number;
  planName?: string;
  schemeId?: number;
  schemeName?: string;
  planType?: string;
  equipmentGroup?: string;
  equipmentCodes?: string;
  equipmentCount?: number;
  firstExecuteTime?: string;
  frequencyValue?: number;
  frequencyUnit?: string;
  effectiveDate?: string;
  endDate?: string;
  status?: string;
  remark?: string;
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
}

/**
 * 设备保养计划提交表单
 */
export interface MaintenancePlanSubmit {
  id?: number;
  planName: string;
  schemeId: number;
  firstExecuteTime: string;
  frequencyValue: number;
  frequencyUnit: string;
  effectiveDate: string;
  endDate?: string;
  status: string;
  remark?: string;
}

// ========== 设备保养计划查询 ==========

/**
 * 设备保养计划下拉/不分页查询
 */
export async function getMaintenancePlanList(params?: {
  keyword?: string;
  planType?: string;
  status?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 设备保养计划分页查询
 */
export async function getMaintenancePlanPage(params: MaintenancePlanParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 设备保养计划详情
 */
export async function getMaintenancePlanById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance/${id}`,
  );
}

// ========== 设备保养计划 CRUD ==========

/**
 * 新增设备保养计划
 */
export async function createMaintenancePlan(params: MaintenancePlanSubmit) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance/create`,
    params,
  );
}

/**
 * 编辑设备保养计划
 */
export async function updateMaintenancePlan(params: MaintenancePlanSubmit) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance/update`,
    params,
  );
}

/**
 * 删除设备保养计划
 */
export async function deleteMaintenancePlan(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance/${id}`,
  );
}

// ========== 设备保养计划状态操作 ==========

/**
 * 启用设备保养计划
 */
export async function enableMaintenancePlan(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance/enable/${id}`,
  );
}

/**
 * 停用设备保养计划
 */
export async function disableMaintenancePlan(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance/disable/${id}`,
  );
}
