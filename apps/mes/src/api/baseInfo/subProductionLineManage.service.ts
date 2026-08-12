// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 子产线列表查询参数 */
export interface SubProductionLineListParams {
  /** 产线 id，用户选择名称后传 id */
  lineId?: number;
  /** 子产线编号，支持模糊查询 */
  subLineCode?: string;
  /** 子产线名称，支持模糊查询 */
  subLineName?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 子产线记录 */
export interface SubProductionLineItem {
  /** 主键 */
  id: number;
  /** 产线 id */
  lineId: number;
  /** 子产线编码 */
  subLineCode: string;
  /** 子产线名称 */
  subLineName: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 分页查询结果 */
export interface SubProductionLineListResult {
  /** 当前页数据 */
  list: SubProductionLineItem[];
  /** 总条数 */
  total: number;
}

/** 新增子产线参数 */
export interface SubProductionLineCreateParams {
  /** 产线 id，必填 */
  lineId: number;
  /** 子产线编号，必填 */
  subLineCode: string;
  /** 子产线名称，必填 */
  subLineName: string;
}

/** 修改子产线参数 */
export interface SubProductionLineUpdateParams {
  /** 主键，必填 */
  id: number;
  /** 产线 id，必填 */
  lineId: number;
  /** 子产线编号，必填 */
  subLineCode: string;
  /** 子产线名称，必填 */
  subLineName: string;
}

// ========== 接口函数 ==========

/**
 * 分页查询子产线列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listSubProductionLines(params: SubProductionLineListParams) {
  return requestClient.get<SubProductionLineListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/search?${qs.stringify(params)}`,
  );
}

/**
 * 新增子产线
 * @param params 子产线信息
 * @returns 新增后的子产线
 */
export async function createSubProductionLine(params: SubProductionLineCreateParams) {
  return requestClient.post<SubProductionLineItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/addSubLine`,
    params,
  );
}

/**
 * 修改子产线
 * @param params 子产线信息
 * @returns 修改后的子产线
 */
export async function updateSubProductionLine(params: SubProductionLineUpdateParams) {
  return requestClient.put<SubProductionLineItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/updateLine`,
    params,
  );
}

/**
 * 删除子产线
 * @param id 主键
 * @returns 删除结果
 */
export async function deleteSubProductionLine(id: number) {
  return requestClient.delete<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/deleteSubLine/${id}`,
  );
}
