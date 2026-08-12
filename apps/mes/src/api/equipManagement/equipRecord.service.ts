// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 台账分页查询 ==========

/** 设备台账分页查询参数 */
export interface EquipmentLedgerPageParams {
  /** 是否删除，1未删除，0删除 */
  assets?: number;
  /** 设备编号 */
  equipmentCode?: string;
  /** 设备类型编号 */
  equipmentNameCode?: string;
}

/** 设备台账分页列表项 */
export interface EquipmentLedgerItem {
  /** 主键ID */
  id: number;
  /** 设备编号 */
  equipmentCode: string;
  /** 设备类型编号 */
  equipmentNameCode: string;
  /** 出厂商 */
  manufacturer: string;
  /** 出厂编号 */
  manufacturingCode: string;
  /** 出厂日期 (DATE) */
  manufacturingDate: string;
  /** 安装日期 (DATE) */
  installDate: string;
  /** 设备类型 */
  equipmentType: number;
  /** 是否删除，1启用；2停用 */
  assets: number;
  /** 备注 */
  remark: string;
  /** 最后一次使用日期 */
  cTime: string;
  /** 实际使用时间 */
  actualUseHours: string;
  /** 更换周期 */
  replaceCycle: null | string;
  /** 设备名称 */
  equipmentName: string;
  /** 设备类型名称 */
  equipmentTypeName: string;
}

/** 设备台账分页查询结果 */
export interface EquipmentLedgerPageResult {
  list: EquipmentLedgerItem[];
  total: number;
}

// ========== 新增/更新设备台账 ==========

/** 新增设备台账参数 */
export interface EquipmentLedgerInsertParams {
  /** 是否删除，1未删除，0删除 */
  assets: number;
  /** 设备编号 */
  equipmentCode: string;
  /** 设备类型编号 */
  equipmentNameCode: string;
  /** 设备类型 */
  equipmentType: number;
  /** 安装日期 (yyyy-MM-dd) */
  installDate: string;
  /** 生产商 */
  manufacturer: string;
  /** 出厂编号 */
  manufacturingCode: string;
  /** 出厂日期 (yyyy-MM-dd) */
  manufacturingDate: string;
  /** 备注 */
  remark: string;
  /** 更换周期 */
  replaceCycle: string;
}

/** 更新设备台账参数 */
export interface EquipmentLedgerUpdateParams extends EquipmentLedgerInsertParams {
  /** 主键ID */
  id: number;
}

// ========== 其他已有类型 ==========

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

// ========== 接口函数 ==========

/**
 * 分页条件查询设备台账
 * @param pageNum  当前页码
 * @param pageSize 每页条数
 * @param data     查询/筛选条件
 * @returns 分页查询结果
 * @since 2026-08-11
 */
export function queryScadaEquipLedgerPage(
  pageNum: number,
  pageSize: number,
  data: EquipmentLedgerPageParams,
) {
  return requestClient.post<EquipmentLedgerPageResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/getEquipmentLedgerDTOByParams?pageNum=${pageNum}&pageSize=${pageSize}`,
    data,
  );
}

/**
 * 导出设备台账
 * @param data 导出条件
 * @since 2026-08-11
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
 * @since 2026-08-11
 */
export function queryScadaEquipLedgerById(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/selectById?${qs.stringify(query)}`,
  );
}

/**
 * 根据设备编号查询设备台账详情
 * @param code 设备编码
 * @returns 设备台账详情
 * @since 2026-08-11
 */
export function queryScadaEquipLedgerByCode(code: string) {
  return requestClient.get<EquipmentLedgerInfo>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/selectByCode?code=${code}`,
  );
}

/**
 * 更新设备台账
 * @param data 设备台账数据
 * @returns 更新结果
 * @since 2026-08-11
 */
export function updateScadaEquipLedger(data: EquipmentLedgerUpdateParams) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/updateById`,
    data,
  );
}

/**
 * 新增设备台账
 * @param data 设备台账数据
 * @returns 新增结果
 * @since 2026-08-11
 */
export function insertScadaEquipLedger(data: EquipmentLedgerInsertParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/insert`,
    data,
  );
}
