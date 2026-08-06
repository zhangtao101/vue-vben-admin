// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分页条件查询设备台账
 * @param params 查询参数（pageSize/pageNum/equipmentNameCode/equipmentName/equipmentCode/useDepartmentCode/assetsStatus）
 * @since 2026-08-06 接口由 POST 变更为 GET，参数统一走 query string
 */
export function queryScadaEquipLedgerPage(params: Record<string, any>) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/getEquipmentLedgerDTOByParams?${qs.stringify(params)}`,
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
 * 设备台账详情
 */
export interface EquipmentLedgerInfo {
  /** 主键ID */
  id?: number;
  /** 设备编码 */
  equipmentCode?: string;
  /** 设备名称 */
  equipmentName?: string;
  /** 型号 */
  model?: string;
  /** 位置 */
  location?: string;
  /** 使用部门 */
  useDepartmentName?: string;
}

/**
 * 根据设备编号查询设备台账详情
 * @param code 设备编码
 */
export function queryScadaEquipLedgerByCode(code: string) {
  return requestClient.get<EquipmentLedgerInfo>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/selectByCode?code=${code}`,
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

