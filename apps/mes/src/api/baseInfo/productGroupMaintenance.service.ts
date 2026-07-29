// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 产品组列表查询参数 */
export interface ProductGroupListParams {
  /** 产品组编码，支持模糊查询 */
  productGroupCode?: string;
  /** 产品组名称，支持模糊查询 */
  productGroupName?: string;
  /** 状态：1=启用，0=停用 */
  status?: number;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 产品组 */
export interface ProductGroupItem {
  /** 主键 */
  id: number;
  /** 产品组编码 */
  productGroupCode: string;
  /** 产品组名称 */
  productGroupName: string;
  /** 产品组说明 */
  description?: string;
  /** 状态：1=启用，0=停用 */
  status: number;
}

/** 分页查询结果 */
export interface ProductGroupListResult {
  /** 当前页数据 */
  results: ProductGroupItem[];
  /** 总条数 */
  total: number;
  /** 当前页条数 */
  count: number;
}

/** 新增产品组参数 */
export interface ProductGroupCreateParams {
  /** 产品组编码，必填且全局唯一 */
  productGroupCode: string;
  /** 产品组名称，必填 */
  productGroupName: string;
  /** 产品组说明，选填 */
  description?: string;
  /** 状态：1=启用，0=停用，默认1 */
  status?: number;
}

/** 修改产品组参数 */
export interface ProductGroupUpdateParams {
  /** 主键，必填 */
  id: number;
  /** 产品组编码，必填且须与原记录一致 */
  productGroupCode: string;
  /** 产品组名称，必填 */
  productGroupName: string;
  /** 产品组说明，选填 */
  description?: string;
  /** 状态：1=启用，0=停用 */
  status: number;
}

/** 删除产品组参数 */
export interface ProductGroupDeleteParams {
  /** 主键 */
  id: number;
}

// ========== 接口函数 ==========

/**
 * 分页查询产品组列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listProductGroups(params: ProductGroupListParams) {
  return requestClient.get<ProductGroupListResult>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/product-group/list?${qs.stringify(params)}`,
  );
}

/**
 * 新增产品组
 * @param params 产品组信息
 * @returns 新增后的产品组
 */
export async function createProductGroup(params: ProductGroupCreateParams) {
  return requestClient.post<ProductGroupItem>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/product-group/create`,
    params,
  );
}

/**
 * 修改产品组
 * @param params 产品组信息
 * @returns 修改后的产品组
 */
export async function updateProductGroup(params: ProductGroupUpdateParams) {
  return requestClient.post<ProductGroupItem>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/product-group/update`,
    params,
  );
}

/**
 * 删除产品组
 * @param params 主键
 * @returns 被删除的产品组主键
 */
export async function deleteProductGroup(params: ProductGroupDeleteParams) {
  return requestClient.delete<number>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/product-group/${params.id}`,
  );
}
