/**
 * [INPUT]: 依赖 requestClient、qs API
 * [OUTPUT]: 对外提供模具上下模相关 API 函数和类型定义
 * [POS]: 模具管理模块 的模具上下模服务层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-19 15:00:00
 */

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 操作类型枚举 */
export type OperationType = 'INSTALL' | 'REMOVE';

/** 上模前校验请求参数 */
export interface MoldValidateParams {
  /** 模具编码 */
  moldCode: string;
  /** 设备编码 */
  equipmentCode: string;
  /** 工单号 */
  workOrderNo: string;
}

/** 上模前校验响应数据 */
export interface MoldValidateResult {
  /** 校验是否通过 */
  valid: boolean;
  /** 提示信息 */
  message: string;
  /** 是否预警 */
  warning: boolean;
}

/** 当前在机模具信息 */
export interface MoldCurrentInfo {
  /** 设备编码 */
  equipmentCode: string;
  /** 当前在机模具编码 */
  moldCode: null | string;
  /** 当前在机模具名称 */
  moldName: null | string;
  /** 当前工单号 */
  workOrderNo: null | string;
  /** 上模操作时间 */
  installTime: null | string;
}

/** 上模/下模提交请求参数 */
export interface MoldSubmitParams {
  /** 操作类型：INSTALL-上模，REMOVE-下模 */
  operationType: OperationType;
  /** 模具编码 */
  moldCode: string;
  /** 设备编码 */
  equipmentCode: string;
  /** 工单号（上模必填，下模可不传） */
  workOrderNo?: string;
}

/** 上模/下模提交响应数据 */
export interface MoldSubmitResult {
  /** 操作记录ID */
  id: string;
}

/** 上下模记录列表项 */
export interface MoldOperationRecord {
  /** 上模/下模 */
  operationTypeName: string;
  /** 模具编码 */
  moldCode: string;
  /** 模具名称 */
  moldName: string;
  /** 设备编码 */
  equipmentCode: string;
  /** 工单号 */
  workOrderNo: string;
  /** 操作人 */
  operator: string;
  /** 操作时间 */
  operationTime: string;
}

/** 上下模记录分页响应 */
export interface MoldOperationPageResult {
  results: MoldOperationRecord[];
}

/** 上下模记录查询参数 */
export interface MoldOperationListParams {
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 设备编码 */
  equipmentCode?: string;
  /** 操作类型 */
  operationType?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/** 工单信息 */
export interface WorkSheetInfo {
  /** 工单单号 */
  workSheetCode: string;
  /** 计划号 */
  planCode: string;
  /** 产品编码 */
  productCode: string;
  /** 产品名称 */
  productName: string;
}

// ========== 接口定义 ==========

/**
 * 上模前校验（模具状态、是否已在机）
 * @param params 校验参数
 * @returns 校验结果
 */
export async function validateMoldOperation(params: MoldValidateParams) {
  return requestClient.post<{
    code: number;
    data: MoldValidateResult;
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/operation/validate`,
    params,
  );
}

/**
 * 查询当前在机模具信息
 * @param equipmentCode 设备编码
 * @returns 当前在机模具信息
 */
export async function getMoldCurrentInfo(equipmentCode: string) {
  return requestClient.get<{
    code: number;
    data: MoldCurrentInfo;
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/operation/current-info?${qs.stringify(
      {
        equipmentCode,
      },
    )}`,
  );
}

/**
 * 上模/下模提交（统一入口）
 * @param params 提交参数
 * @returns 提交结果
 */
export async function submitMoldOperation(params: MoldSubmitParams) {
  return requestClient.post<{
    code: number;
    data: MoldSubmitResult;
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/operation/submit`,
    params,
  );
}

/**
 * 分页查询上下模记录
 * @param params 查询参数
 * @returns 上下模记录分页列表
 */
export async function getMoldOperationListPage(
  params: MoldOperationListParams,
) {
  return requestClient.get<{
    code: number;
    count: number;
    data: MoldOperationPageResult;
    msg: string;
    total: number;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/operation/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 根据工单单号获取工单信息
 * @param worksheetCode 工单单号
 * @returns 工单信息列表
 */
export async function getWorkSheetByCode(worksheetCode: string) {
  return requestClient.get<{
    code: number;
    count: number;
    data: WorkSheetInfo[];
    msg: string;
    total: number;
  }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/getWorksheetListByCode/${encodeURIComponent(worksheetCode)}`,
  );
}

/**
 * 根据工单单号获取工单信息（V2版本）
 * @param worksheetCode 工单单号
 * @returns 工单信息
 */
export async function getWorkSheetByCodeV2(worksheetCode: string) {
  return requestClient.get<{
    code: number;
    data: WorkSheetInfo;
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/getWorksheetByCode/${encodeURIComponent(worksheetCode)}`,
  );
}
