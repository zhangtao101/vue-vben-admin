// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 响应类型定义 ==========

/** 报修单保存结果 */
export interface RepairRequestSaveResult {
  id: number;
  requestNo: string;
  status: string;
}

/** 报修单详情 */
export interface RepairRequestDetail {
  id: number;
  requestNo: string;
  equipmentCode: string;
  equipmentName: string;
  repairType: string;
  urgentLevel: string;
  reportBy: string;
  reportTime: string;
  faultTime?: null | string;
  status: string;
  isDowntime?: null | number;
  repairContent: string;
  faultName?: string;
  relatedTaskId?: null | number;
  relatedTaskType?: null | string;
  cancelReason?: null | string;
  cancelTime?: null | string;
  repairConclusion?: string;
  /** 资产类型，EQUIPMENT-设备，MOLD-模具 */
  assetType?: string;
  /** 模具编码（模具报修单） */
  moldCode?: string;
  /** 模具名称（模具报修单） */
  moldName?: string;
}

/** 报修单列表项 */
export interface RepairRequestListItem {
  id: number;
  requestNo: string;
  equipmentCode: string;
  equipmentName: string;
  repairType: string;
  urgentLevel: string;
  status: string;
  faultName?: string;
  reportTime: string;
  /** 资产类型，EQUIPMENT-设备，MOLD-模具 */
  assetType?: string;
  /** 模具编码（模具报修单） */
  moldCode?: string;
  /** 模具名称（模具报修单） */
  moldName?: string;
}

/** 报修单分页列表响应 */
export interface RepairRequestPageResponse {
  results: RepairRequestListItem[];
  total?: number;
  count?: number;
}

/** 保存报修单草稿请求参数 */
export interface SaveRepairRequestParams {
  id?: null | number;
  equipmentCode: string;
  equipmentName?: null | string;
  repairType: string;
  urgentLevel: string;
  repairContent: string;
  faultName?: null | string;
  relatedTaskId?: null | number;
  acceptPeriod: number;
  /** 资产类型，EQUIPMENT-设备，MOLD-模具 */
  assetType?: string;
}

/** 提交报修单请求参数 */
export interface SubmitRepairRequestParams {
  id?: null | number;
  equipmentCode: string;
  equipmentName?: null | string;
  repairType: string;
  urgentLevel: string;
  repairContent: string;
  faultName?: null | string;
  relatedTaskId?: null | number;
  acceptPeriod: number;
  /** 资产类型，EQUIPMENT-设备，MOLD-模具 */
  assetType?: string;
}

/** 报修单列表查询参数 */
export interface RepairRequestListParams {
  requestNo?: string;
  equipmentCode?: string;
  equipmentName?: string;
  status?: string;
  repairType?: string;
  startTime?: string;
  endTime?: string;
  /** 资产类型，EQUIPMENT-设备，MOLD-模具 */
  assetType?: string;
  /** 模具编码（模具报修单查询） */
  moldCode?: string;
  /** 模具名称（模具报修单查询） */
  moldName?: string;
  pageNum: number;
  pageSize: number;
}

// ========== 接口定义 ==========

/**
 * 保存报修单草稿
 * @param params 保存报修单草稿请求参数
 * @returns 报修单保存结果
 */
export async function saveRepairRequest(params: SaveRepairRequestParams) {
  return requestClient.post<RepairRequestSaveResult>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/request/save`,
    params,
  );
}

/**
 * 提交报修单
 * @param params 提交报修单请求参数
 * @returns 报修单提交结果
 */
export async function submitRepairRequest(params: SubmitRepairRequestParams) {
  return requestClient.post<RepairRequestSaveResult>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/request/submit`,
    params,
  );
}

/**
 * 获取报修单详情
 * @param id 报修单ID
 * @returns 报修单详情
 */
export async function getRepairRequestById(id: number) {
  return requestClient.get<RepairRequestDetail>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/request/${id}`,
  );
}

/**
 * 删除报修单草稿
 * @param id 报修单ID
 */
export async function deleteRepairRequest(id: number) {
  return requestClient.delete<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/request/${id}`,
  );
}

/**
 * 取消报修单
 * @param requestId 报修单ID
 * @param cancelReason 取消原因
 */
export async function cancelRepairRequest(
  requestId: number,
  cancelReason: string,
) {
  return requestClient.post<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/request/cancel?${qs.stringify(
      {
        requestId,
        cancelReason,
      },
    )}`,
  );
}

/**
 * 分页查询报修单列表
 * @param params 查询参数
 * @returns 报修单分页列表
 */
export async function getRepairRequestPageList(
  params: RepairRequestListParams,
) {
  return requestClient.get<RepairRequestPageResponse>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/request/list-page?${qs.stringify(params)}`,
  );
}
