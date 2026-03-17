import { requestClient } from '#/api/request';

/**
 * 查询测控点列表
 */
export function queryCheckPointList(params: {
  checkPointName?: string;
  equipmentName?: string;
  ipAddress?: string;
  pageNum?: number;
  pageSize?: number;
  processName?: string;
}) {
  return requestClient.get<{ results: any[]; total: number }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/checkPoint/search`,
    { params },
  );
}

/**
 * 删除测控点
 */
export function deleteCheckPoint(id: number | string) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/checkPoint/delete/${id}`,
  );
}

/**
 * 新增测控点
 */
export function createCheckPoint(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/checkPoint/add`,
    data,
  );
}

/**
 * 根据ID查询测控点详情
 */
export function queryCheckPointDetail(id: number | string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/checkPoint/detail/${id}`,
  );
}

/**
 * 更新测控点
 */
export function updateCheckPoint(data: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/checkPoint/update`,
    data,
  );
}

/**
 * 根据工序ID查询生产线列表
 */
export function queryLineByProcessId(processId: number | string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/list/checkPoint/${processId}`,
  );
}

/**
 * 根据设备名称模糊查询设备列表
 */
export function queryEquipmentByName(equipmentName: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentName/getListByName`,
    { params: { equipmentName } },
  );
}

/**
 * 根据设备名称查询设备编号列表
 */
export function queryEquipCodeByName(equipmentName: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/queryByEquipmentName`,
    { params: { equipmentName } },
  );
}

/**
 * 根据工序名称查询工序编号
 */
export function queryProcessCodeByName(processName: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/list/nameEqual/${processName}`,
  );
}
