// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 台车分页查询参数 */
export interface TrolleyListParams {
  /** 台车编码，支持模糊查询 */
  trolleyCode?: string;
  /** 台车名称，支持模糊查询 */
  trolleyName?: string;
  /** 状态：0=停用，1=启用 */
  status?: number;
  /** 页码，从1开始 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 台车实体 */
export interface TrolleyItem {
  /** 主键ID */
  id: number;
  /** 台车编码 */
  trolleyCode: string;
  /** 台车名称 */
  trolleyName: string;
  /** 可装托盘数量，必须为大于0的整数 */
  palletCapacity: number;
  /** 状态：0=停用，1=启用 */
  status: number;
  /** 备注 */
  remark?: string;
}

/** 分页查询结果 */
export interface TrolleyListResult {
  /** 当前页数据 */
  results: TrolleyItem[];
  /** 总记录数 */
  total: number;
  /** 当前页记录数 */
  count: number;
}

/** 新增台车参数 */
export interface TrolleyCreateParams {
  /** 台车编码，必填 */
  trolleyCode: string;
  /** 台车名称，必填 */
  trolleyName: string;
  /** 可装托盘数量，必填且大于0 */
  palletCapacity: number;
  /** 状态：0=停用，1=启用 */
  status: number;
  /** 备注，选填 */
  remark?: string;
}

/** 修改台车参数 */
export interface TrolleyUpdateParams {
  /** 主键ID，必填 */
  id: number;
  /** 台车编码，必填 */
  trolleyCode: string;
  /** 台车名称，必填 */
  trolleyName: string;
  /** 可装托盘数量，必填且大于0 */
  palletCapacity: number;
  /** 状态：0=停用，1=启用 */
  status: number;
  /** 备注，选填 */
  remark?: string;
}

// ========== 接口函数 ==========

/**
 * 分页查询台车列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listTrolleys(params: TrolleyListParams) {
  return requestClient.get<TrolleyListResult>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询台车详情
 * @param id 台车主键ID
 * @returns 台车详情
 */
export async function getTrolleyById(id: number) {
  return requestClient.get<TrolleyItem>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/${id}`,
  );
}

/**
 * 新增台车
 * @param params 台车信息
 * @returns 新增后的台车
 */
export async function createTrolley(params: TrolleyCreateParams) {
  return requestClient.post<TrolleyItem>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/create`,
    params,
  );
}

/**
 * 修改台车
 * @param params 台车信息
 * @returns 修改后的台车
 */
export async function updateTrolley(params: TrolleyUpdateParams) {
  return requestClient.post<TrolleyItem>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/update`,
    params,
  );
}

/**
 * 逻辑删除台车
 * @param id 台车主键ID
 * @returns 被删除的台车记录ID
 */
export async function deleteTrolley(id: number) {
  return requestClient.delete<number>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/trolley/${id}`,
  );
}
