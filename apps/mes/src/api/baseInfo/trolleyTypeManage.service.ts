// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 台车类型分页查询参数 */
export interface TrolleyTypeListParams {
  /** 台车类型编码，支持模糊查询 */
  cartType?: string;
  /** 台车类型名称，支持模糊查询 */
  catTypeName?: string;
  /** 状态：0=停用，1=启用 */
  status?: number;
  /** 页码，从1开始 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 台车类型实体 */
export interface TrolleyTypeItem {
  /** 主键ID */
  id: number;
  /** 台车类型编码，保存后不可修改 */
  cartType: string;
  /** 台车类型名称 */
  catTypeName: string;
  /** 状态：0=停用，1=启用 */
  status: number;
}

/** 台车类型分页查询结果 */
export interface TrolleyTypeListResult {
  /** 当前页数据 */
  results: TrolleyTypeItem[];
  /** 总记录数 */
  total: number;
  /** 当前页记录数 */
  count: number;
}

/** 新增台车类型参数 */
export interface TrolleyTypeCreateParams {
  /** 台车类型编码，必填，保存后不可修改，最大长度64 */
  cartType: string;
  /** 台车类型名称，必填，最大长度128 */
  catTypeName: string;
  /** 状态：0=停用，1=启用，必填 */
  status: number;
}

/** 修改台车类型参数 */
export interface TrolleyTypeUpdateParams {
  /** 主键ID，必填 */
  id: number;
  /** 台车类型编码，必填，必须与保存时一致 */
  cartType: string;
  /** 台车类型名称，必填，改名会同步更新台车中已保存的名称 */
  catTypeName: string;
  /** 状态：0=停用，1=启用，必填 */
  status: number;
}

/** 台车类型下拉选项 */
export interface TrolleyTypeOption {
  /** 台车类型编码 */
  cartType: string;
  /** 台车类型名称 */
  catTypeName: string;
}

// ========== 接口函数 ==========

/**
 * 查询台车类型下拉选项（仅返回启用且未删除的类型，按类型编码升序）
 * @returns 台车类型选项列表，用于台车管理页面的台车类型下拉
 */
export async function getTrolleyTypeOptions() {
  return requestClient.get<TrolleyTypeOption[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/type/options`,
  );
}

/**
 * 分页查询台车类型列表
 * @param params 查询参数
 * @returns 分页结果（results 当前页数据、total 总记录数、count 当前页记录数）
 */
export async function listTrolleyTypes(params: TrolleyTypeListParams) {
  return requestClient.get<TrolleyTypeListResult>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/type/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询台车类型详情
 * @param id 台车类型主键ID
 * @returns 台车类型详情
 */
export async function getTrolleyTypeById(id: number) {
  return requestClient.get<TrolleyTypeItem>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/type/${id}`,
  );
}

/**
 * 新增台车类型（同编码的已删除记录会被恢复为正常记录）
 * @param params 台车类型信息
 * @returns 写操作无返回数据，成功后需重新调用查询接口
 */
export async function createTrolleyType(params: TrolleyTypeCreateParams) {
  return requestClient.post<null>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/type/create`,
    params,
  );
}

/**
 * 修改台车类型（编码必须与保存时一致）
 * @param params 台车类型信息，含主键ID
 * @returns 写操作无返回数据，成功后需重新调用查询接口
 */
export async function updateTrolleyType(params: TrolleyTypeUpdateParams) {
  return requestClient.post<null>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/type/update`,
    params,
  );
}

/**
 * 逻辑删除台车类型（仍被未删除台车引用时删除失败）
 * @param id 台车类型主键ID
 * @returns 写操作无返回数据，成功后需重新调用查询接口
 */
export async function deleteTrolleyType(id: number) {
  return requestClient.delete<null>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/type/${id}`,
  );
}
