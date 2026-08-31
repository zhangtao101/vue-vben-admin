import { requestClient } from '#/api/request';

/**
 * 设备选择实体
 */
export interface EquipSelectItem {
  /** 设备分组编码 */
  equipGroupCode?: string;
  /** 设备分组名称 */
  equipGroupName?: string;
  /** 设备编码 */
  equipmentCode?: string;
  /** 设备名称 */
  equipmentName?: string;
  /** 位置 */
  location?: string;
  /** 型号 */
  model?: string;
  /** 使用部门 */
  useDepartmentName?: string;
}

/**
 * 设备选择查询参数
 */
export interface EquipSelectParams {
  /** 每页条数 */
  pageSize?: number;
  /** 页码 */
  pageNum?: number;
  /** 设备编码 */
  equipmentCode?: string;
  /** 设备名称 */
  equipmentName?: string;
  /** 设备分组编码 */
  equipGroupCode?: string;
}

/**
 * 设备选择弹窗查询（设备台账）
 * @param params 查询参数
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @param params.equipmentCode 设备编码
 * @param params.equipmentName 设备名称
 * @param params.equipGroupCode 设备分组编码
 * @returns 设备列表分页结果 { list, total }
 * @since 2026-08-31
 */
export function getEquipSelectList(params: EquipSelectParams) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/getEquipmentLedgerDTOByParams?pageNum=${params.pageNum || 1}&pageSize=${params.pageSize || 20}`,
    {
      equipmentCode: params.equipmentCode,
      equipmentName: params.equipmentName,
      equipGroupCode: params.equipGroupCode,
    },
  );
}
