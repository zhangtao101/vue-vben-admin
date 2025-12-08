// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分页条件查询设备台账
 * @param pageNum  当前页码
 * @param pageSize 每页条数
 * @param data     查询/筛选条件
 */
export function queryScadaEquipLedgerPage(
  pageNum: number,
  pageSize: number,
  data: any,
) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/getEquipmentLedgerDTOByParams?pageNum=${pageNum}&pageSize=${pageSize}`,
    data,
  );
}

/**
 * 导出设备台账
 * @param data 导出条件
 */
export function exportScadaEquipLedger(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/getExportUrl`,
    data,
  );
}

/**
 * 根据主键查询设备台账详情
 * @param query 需包含设备 ID
 */
export function queryScadaEquipLedgerById(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/selectById?${qs.stringify(query)}`,
  );
}

/**
 * 根据设备编号查询设备台账详情
 * @param query 需包含设备编号
 */
export function queryScadaEquipLedgerByCode(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/selectByCode?${qs.stringify(query)}`,
  );
}

/**
 * 更新设备台账
 * @param data 设备台账数据
 */
export function updateScadaEquipLedger(data: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/updateById`,
    data,
  );
}

/**
 * 新增设备台账
 * @param data 设备台账数据
 */
export function insertScadaEquipLedger(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/insert`,
    data,
  );
}
