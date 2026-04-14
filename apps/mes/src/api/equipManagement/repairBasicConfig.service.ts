// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 维修基础配置相关 ==========

/**
 * 按类型查询基础配置列表
 */
export async function getRepairBasicConfigList(params: {
  configType: string;
  status?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询基础配置详情
 */
export async function getRepairBasicConfigById(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/${id}`,
  );
}

/**
 * 创建基础配置项
 */
export async function createRepairBasicConfig(params: {
  configCode: string;
  configName: string;
  configType: string;
  parentCode?: string;
  remark?: string;
  repairGroupCode?: string;
  sortOrder?: number;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/create`,
    params,
  );
}

/**
 * 更新基础配置项
 */
export async function updateRepairBasicConfig(params: {
  configCode: string;
  configName: string;
  configType: string;
  id: number;
  parentCode?: string;
  remark?: string;
  repairGroupCode?: string;
  sortOrder?: number;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/update`,
    params,
  );
}

/**
 * 删除基础配置项
 */
export async function deleteRepairBasicConfig(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/${id}`,
  );
}

/**
 * 启用基础配置项
 */
export async function enableRepairBasicConfig(id: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/enable/${id}`,
  );
}

/**
 * 禁用基础配置项
 */
export async function disableRepairBasicConfig(id: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/disable/${id}`,
  );
}
