// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 设备保养方案相关 ==========

/**
 * 设备保养方案接口参数
 */
export interface MaintenanceSchemeParams {
  keyword?: string;
  planType?: string;
  equipmentGroup?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 保养项目
 */
export interface MaintenanceItem {
  sequenceNo?: number;
  itemCode?: string;
  itemName?: string;
  itemRequirement?: string;
  itemStandard?: string;
}

/**
 * 设备保养方案实体
 */
export interface MaintenanceScheme {
  id?: number;
  schemeName?: string;
  planType?: string;
  isStopMachine?: boolean;
  equipmentGroup?: string;
  equipmentCodes?: string;
  equipmentCount?: number;
  itemCount?: number;
  status?: string;
  operator?: string;
  remark?: string;
  details?: MaintenanceItem[];
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
}

/**
 * 设备保养方案提交表单
 */
export interface MaintenanceSchemeSubmit {
  id?: number;
  schemeName: string;
  planType: string;
  isStopMachine?: boolean;
  equipmentGroup?: string;
  equipmentCodes?: string;
  status: string;
  operator?: string;
  remark?: string;
  details: MaintenanceItem[];
}

// ========== 设备保养方案查询 ==========

/**
 * 设备保养方案下拉/不分页查询
 */
export async function getMaintenanceSchemeList(params?: {
  equipmentGroup?: string;
  keyword?: string;
  planType?: string;
  status?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance-scheme/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 设备保养方案分页查询
 */
export async function getMaintenanceSchemePage(params: MaintenanceSchemeParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance-scheme/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 设备保养方案详情
 */
export async function getMaintenanceSchemeById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance-scheme/${id}`,
  );
}

// ========== 设备保养方案 CRUD ==========

/**
 * 新增设备保养方案
 */
export async function createMaintenanceScheme(params: {
  details: MaintenanceItem[];
  equipmentCodes?: string;
  equipmentGroup?: string;
  isStopMachine?: boolean;
  operator?: string;
  planType: string;
  remark?: string;
  schemeName: string;
  status: string;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance-scheme/create`,
    params,
  );
}

/**
 * 编辑设备保养方案
 */
export async function updateMaintenanceScheme(params: {
  details: MaintenanceItem[];
  equipmentCodes?: string;
  equipmentGroup?: string;
  id: number;
  isStopMachine?: boolean;
  operator?: string;
  planType: string;
  remark?: string;
  schemeName: string;
  status: string;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance-scheme/update`,
    params,
  );
}

/**
 * 删除设备保养方案
 */
export async function deleteMaintenanceScheme(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance-scheme/${id}`,
  );
}

// ========== 设备保养方案状态操作 ==========

/**
 * 启用设备保养方案
 */
export async function enableMaintenanceScheme(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance-scheme/enable/${id}`,
  );
}

/**
 * 停用设备保养方案
 */
export async function disableMaintenanceScheme(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/maintenance-scheme/disable/${id}`,
  );
}
