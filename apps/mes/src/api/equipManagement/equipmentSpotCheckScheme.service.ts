// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 点巡检方案相关 ==========

/**
 * 点巡检项
 */
export interface InspectionDetail {
  /** 序号 */
  sequenceNo?: number;
  /** 点巡检项编码 */
  itemCode?: string;
  /** 点巡检项名称 */
  itemName?: string;
  /** 点检要求 */
  itemRequirement?: string;
  /** 点检标准/说明 */
  itemStandard?: string;
}

/**
 * 点巡检方案参数
 */
export interface InspectionSchemeParams {
  /** 方案名称模糊查询 */
  keyword?: string;
  /** 点巡检类型 */
  inspectionType?: string;
  /** 设备组 */
  equipmentGroup?: string;
  /** 状态 */
  status?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 点巡检方案实体
 */
export interface InspectionScheme {
  /** 方案ID */
  id?: number;
  /** 方案名称 */
  schemeName?: string;
  /** 点巡检类型 */
  inspectionType?: string;
  /** 设备组 */
  equipmentGroup?: string;
  /** 绑定设备编码，逗号分隔 */
  equipmentCodes?: string;
  /** 绑定设备数量 */
  equipmentCount?: number;
  /** 点巡检项数量 */
  itemCount?: number;
  /** 状态 */
  status?: string;
  /** 负责人 */
  operator?: string;
  /** 备注 */
  remark?: string;
  /** 点巡检项列表 */
  details?: InspectionDetail[];
  /** 创建人 */
  createdBy?: string;
  /** 创建时间 */
  createdTime?: string;
}

/**
 * 点巡检方案提交参数
 */
export interface InspectionSchemeSubmit {
  /** 方案ID（编辑时传；新增不传） */
  id?: number;
  /** 方案名称 */
  schemeName: string;
  /** 点巡检类型 */
  inspectionType: string;
  /** 设备组 */
  equipmentGroup?: string;
  /** 绑定设备编码，逗号分隔 */
  equipmentCodes?: string;
  /** 状态 */
  status: string;
  /** 负责人 */
  operator?: string;
  /** 备注 */
  remark?: string;
  /** 点巡检项列表 */
  details: InspectionDetail[];
}

// ========== 点巡检方案查询 ==========

/**
 * 点检方案下拉/不分页查询
 * @param params - 查询参数
 */
export async function getInspectionSchemeList(params?: {
  equipmentGroup?: string;
  inspectionType?: string;
  keyword?: string;
  status?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection-scheme/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 点检方案列表分页查询
 * @param params - 查询参数
 */
export async function getInspectionSchemePage(params: InspectionSchemeParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection-scheme/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 点检方案详情
 * @param id - 方案ID
 */
export async function getInspectionSchemeById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection-scheme/${id}`,
  );
}

// ========== 点巡检方案操作 ==========

/**
 * 新增点检方案
 * @param params - 方案参数
 */
export async function createInspectionScheme(params: InspectionSchemeSubmit) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection-scheme/create`,
    params,
  );
}

/**
 * 编辑点检方案
 * @param params - 方案参数
 */
export async function updateInspectionScheme(params: InspectionSchemeSubmit) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection-scheme/update`,
    params,
  );
}

/**
 * 删除点检方案
 * @param id - 方案ID
 */
export async function deleteInspectionScheme(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection-scheme/${id}`,
  );
}

/**
 * 启用点检方案
 * @param id - 方案ID
 */
export async function enableInspectionScheme(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection-scheme/enable/${id}`,
  );
}

/**
 * 停用点检方案
 * @param id - 方案ID
 */
export async function disableInspectionScheme(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/plan/inspection-scheme/disable/${id}`,
  );
}

// ========== 点检项相关 ==========

/**
 * 点检项实体
 */
export interface EquipCheckItem {
  /** 点检项编号 */
  checkItemCode?: string;
  /** 点检项名称 */
  checkItemName?: string;
  /** 类型 */
  itemTypeName?: string;
  /** 通用/专用 */
  isSpecialName?: string;
}

/**
 * 点检项查询参数
 */
export interface EquipCheckItemParams {
  /** 每页条数 */
  pageSize?: number;
  /** 页码 */
  pageNum?: number;
  /** 点检项编号 */
  checkItemCode?: string;
  /** 点检项名称 */
  checkItemName?: string;
}

/**
 * 点检项选择弹窗查询（老系统）
 * @param params - 查询参数
 */
export async function getEquipCheckItemList(params: EquipCheckItemParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_MONITOR}/equipCheckItem/queryList?${qs.stringify(params)}`,
  );
}

// ========== 设备选择相关 ==========

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
 * 设备选择弹窗查询
 * @param params - 查询参数
 */
export async function getEquipSelectList(params: EquipSelectParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/getEquipmentLedgerDTOByParams?pageNum=${params.pageNum || 1}&pageSize=${params.pageSize || 20}`,
    {
      equipmentCode: params.equipmentCode,
      equipmentName: params.equipmentName,
      equipGroupCode: params.equipGroupCode,
    },
  );
}
