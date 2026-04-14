// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 设备故障树 API ==========

/**
 * 模糊查询设备配置
 */
export async function searchBaseConfig(params?: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/search?${qs.stringify(params)}`,
  );
}

/**
 * 分页查询故障节点列表
 */
export async function getFaultTreeList(params?: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-tree/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 按设备组查询故障树
 */
export async function getFaultTreeByEquipment(equipmentGroup: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-tree/by-equipment/${equipmentGroup}`,
  );
}

/**
 * 新建故障节点
 */
export async function createFaultTree(params?: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-tree/create`,
    params,
  );
}

/**
 * 故障详情
 */
export async function getFaultTreeDetail(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-tree/detail/${id}`,
  );
}

/**
 * 故障树结构
 */
export async function getFaultTree() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-tree/tree`,
  );
}

/**
 * 更新故障节点
 */
export async function updateFaultTree(params?: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-tree/update`,
    params,
  );
}

/**
 * 删除故障节点
 */
export async function deleteFaultTree(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-tree/${id}`,
  );
}
