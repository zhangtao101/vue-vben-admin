// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 产线列表查询参数 */
export interface ProductionLineListParams {
  /** 生产区 id，前端选名称后传 id */
  groupId?: number;
  /** 产线名称，支持模糊查询 */
  lineName?: string;
  /** 产线编号，支持模糊查询 */
  lineCode?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 产线记录 */
export interface ProductionLineItem {
  /** 主键 */
  id: number;
  /** 生产区 id */
  groupId: number;
  /** 产线名称 */
  lineName: string;
  /** 产线编号 */
  lineCode: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 分页查询结果 */
export interface ProductionLineListResult {
  /** 当前页数据 */
  list: ProductionLineItem[];
  /** 总条数 */
  total: number;
}

/** 新增产线参数 */
export interface ProductionLineCreateParams {
  /** 产线组（生产区）id，必填 */
  groupId: number;
  /** 产线名称，必填 */
  lineName: string;
  /** 产线编号，必填 */
  lineCode: string;
}

/** 修改产线参数 */
export interface ProductionLineUpdateParams {
  /** 主键 */
  id: number;
  /** 产线组（生产区）id，必填 */
  groupId: number;
  /** 产线名称，必填 */
  lineName: string;
  /** 产线编号，必填 */
  lineCode: string;
}

// ========== 接口函数 ==========

/**
 * 分页查询产线列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listProductionLines(params: ProductionLineListParams) {
  return requestClient.get<ProductionLineListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/searchLine?${qs.stringify(params)}`,
  );
}

/**
 * 新增产线
 * @param params 产线信息
 * @returns 新增后的产线
 */
export async function createProductionLine(params: ProductionLineCreateParams) {
  return requestClient.post<ProductionLineItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/addLine`,
    params,
  );
}

/**
 * 修改产线
 * @param params 产线信息
 * @returns 修改后的产线
 */
export async function updateProductionLine(params: ProductionLineUpdateParams) {
  return requestClient.put<ProductionLineItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/updateLine`,
    params,
  );
}

/**
 * 删除产线
 * @param id 主键
 * @returns 删除结果
 */
export async function deleteProductionLine(id: number) {
  return requestClient.delete<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/deleteLine/${id}`,
  );
}
