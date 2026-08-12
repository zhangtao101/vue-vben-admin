// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 生产区列表查询参数 */
export interface ProductionAreaListParams {
  /** 生产区编号，支持模糊查询 */
  lineGroupCode?: string;
  /** 生产区名称，支持模糊查询 */
  lineGroupName?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 生产区记录 */
export interface ProductionAreaItem {
  /** 主键 */
  id: number;
  /** 生产区编号 */
  lineGroupCode: string;
  /** 生产区名称 */
  lineGroupName: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 分页查询结果 */
export interface ProductionAreaListResult {
  /** 当前页数据 */
  list: ProductionAreaItem[];
  /** 总条数 */
  total: number;
}

/** 新增生产区参数 */
export interface ProductionAreaCreateParams {
  /** 生产区编号，必填 */
  lineGroupCode: string;
  /** 生产区名称，必填 */
  lineGroupName: string;
}

/** 修改生产区参数 */
export interface ProductionAreaUpdateParams {
  /** 主键，必填 */
  id: number;
  /** 生产区编号，必填 */
  lineGroupCode: string;
  /** 生产区名称，必填 */
  lineGroupName: string;
}

// ========== 接口函数 ==========

/**
 * 分页查询生产区列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listProductionAreas(params: ProductionAreaListParams) {
  return requestClient.get<ProductionAreaListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/search?${qs.stringify(params)}`,
  );
}

/**
 * 新增生产区
 * @param params 生产区信息
 * @returns 新增后的生产区
 */
export async function createProductionArea(params: ProductionAreaCreateParams) {
  return requestClient.post<ProductionAreaItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/add`,
    params,
  );
}

/**
 * 修改生产区
 * @param params 生产区信息
 * @returns 修改后的生产区
 */
export async function updateProductionArea(params: ProductionAreaUpdateParams) {
  return requestClient.put<ProductionAreaItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/update`,
    params,
  );
}

/**
 * 删除生产区
 * @param id 主键
 * @returns 删除结果
 */
export async function deleteProductionArea(id: number) {
  return requestClient.delete<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/delete/${id}`,
  );
}
