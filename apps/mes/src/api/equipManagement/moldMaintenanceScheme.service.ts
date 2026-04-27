// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 模具保养方案相关 ==========

/**
 * 模具保养方案接口参数
 */
export interface MoldMaintenanceSchemeParams {
  keyword?: string;
  planType?: string;
  categoryName?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 保养项目
 */
export interface MoldMaintenanceItem {
  sequenceNo?: number;
  itemCode?: string;
  itemName?: string;
  itemRequirement?: string;
  itemStandard?: string;
}

/**
 * 模具保养方案实体
 */
export interface MoldMaintenanceScheme {
  id?: number;
  schemeName?: string;
  planType?: string;
  isStopMachine?: boolean;
  moldCategoryName?: string;
  moldCodes?: string;
  moldCount?: number;
  itemCount?: number;
  status?: string;
  operator?: string;
  remark?: string;
  details?: MoldMaintenanceItem[];
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
}

/**
 * 模具保养方案提交表单
 */
export interface MoldMaintenanceSchemeSubmit {
  id?: number;
  schemeName: string;
  planType: string;
  isStopMachine?: boolean;
  moldCategoryName?: string;
  moldCodes?: string;
  status: string;
  operator?: string;
  remark?: string;
  details: MoldMaintenanceItem[];
}

// ========== 模具保养方案查询 ==========

/**
 * 模具保养方案下拉/不分页查询
 */
export async function getMoldMaintenanceSchemeList(params?: {
  categoryName?: string;
  keyword?: string;
  planType?: string;
  status?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance-scheme/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 模具保养方案分页查询
 */
export async function getMoldMaintenanceSchemePage(
  params: MoldMaintenanceSchemeParams,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance-scheme/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 模具保养方案详情
 */
export async function getMoldMaintenanceSchemeById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance-scheme/detail?id=${id}`,
  );
}

// ========== 模具保养方案 CRUD ==========

/**
 * 新增模具保养方案
 */
export async function createMoldMaintenanceScheme(params: {
  details: MoldMaintenanceItem[];
  isStopMachine?: boolean;
  moldCategoryName?: string;
  moldCodes?: string;
  operator?: string;
  planType: string;
  remark?: string;
  schemeName: string;
  status: string;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance-scheme/create`,
    params,
  );
}

/**
 * 编辑模具保养方案
 */
export async function updateMoldMaintenanceScheme(params: {
  details: MoldMaintenanceItem[];
  id: number;
  isStopMachine?: boolean;
  moldCategoryName?: string;
  moldCodes?: string;
  operator?: string;
  planType: string;
  remark?: string;
  schemeName: string;
  status: string;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance-scheme/update`,
    params,
  );
}

/**
 * 删除模具保养方案
 */
export async function deleteMoldMaintenanceScheme(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance-scheme/${id}`,
  );
}

// ========== 模具保养方案状态操作 ==========

/**
 * 启用模具保养方案
 */
export async function enableMoldMaintenanceScheme(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance-scheme/enable/${id}`,
  );
}

/**
 * 停用模具保养方案
 */
export async function disableMoldMaintenanceScheme(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance-scheme/disable/${id}`,
  );
}
