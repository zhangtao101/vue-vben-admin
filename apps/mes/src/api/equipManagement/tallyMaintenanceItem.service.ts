/**
 * [INPUT]: 依赖 #/api/request 的 requestClient 请求点检保养项与点检记录相关接口
 * [OUTPUT]: 对外提供点检保养项的增删改查、点检记录查询、设备名称模糊查询等函数
 * [POS]: 设备管理模块的子模块，属于 equipManagement API 层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-03 13:04:00
 */
// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 点检保养项查询 ==========

/**
 * 分页查询点检保养项列表
 * @param params 查询参数
 */
export async function getTallyMaintenanceItemList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_MONITOR}/equipCheckItem/queryList?${qs.stringify(params)}`,
  );
}

/**
 * 查询点检保养项详情
 * @param id 点检保养项ID
 */
export async function getTallyMaintenanceItemById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_MONITOR}/equipCheckItem/detail/${id}`,
  );
}

/**
 * 根据设备名称查询点检项列表
 * @param params 查询参数（包含设备名称等）
 */
export async function getTallyMaintenanceItemByName(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_MONITOR}/equipCheckItem/getCheckItemByName?${qs.stringify(params)}`,
  );
}

// ========== 点检保养项 CRUD ==========

/**
 * 新增点检保养项
 * @param params 点检保养项数据
 */
export async function createTallyMaintenanceItem(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_MONITOR}/equipCheckItem/save`,
    params,
  );
}

/**
 * 修改点检保养项
 * @param params 点检保养项数据
 */
export async function updateTallyMaintenanceItem(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_MONITOR}/equipCheckItem/update`,
    params,
  );
}

/**
 * 删除点检保养项
 * @param id 点检保养项ID
 */
export async function deleteTallyMaintenanceItem(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_MONITOR}/equipCheckItem/delete/${id}`,
  );
}

// ========== 设备名称查询 ==========

/**
 * 根据设备名称模糊查询设备列表
 * @param equipmentName 设备名称关键字
 */
export async function getTallyEquipmentListByName(equipmentName: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentName/getListByName?equipmentName=${equipmentName}`,
  );
}

// ========== 点检记录查询 ==========

/**
 * 查询点检记录详情
 * @param id 点检记录ID
 */
export async function getTallyCheckRecordDetail(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_MONITOR}/equipCheckRecord/detail/${id}`,
  );
}

/**
 * 分页查询点检记录列表
 * @param params 查询参数
 */
export async function getTallyCheckRecordList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_MONITOR}/equipCheckRecord/queryList?${qs.stringify(params)}`,
  );
}
