// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 托盘分页查询参数 */
export interface TrayListParams {
  /** 托盘编码，支持模糊查询 */
  palletCode?: string;
  /** 托盘名称，支持模糊查询 */
  palletName?: string;
  /** 状态：0=停用，1=启用 */
  status?: number;
  /** 页码，从1开始 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 托盘实体 */
export interface TrayItem {
  /** 主键ID */
  id: number;
  /** 托盘编码 */
  palletCode: string;
  /** 托盘名称 */
  palletName: string;
  /** 额定承载量，必须大于0，单位由现场统一 */
  loadCapacity: number;
  /** 状态：0=停用，1=启用 */
  status: number;
  /** 备注 */
  remark?: string;
}

/** 分页查询结果 */
export interface TrayListResult {
  /** 当前页数据 */
  results: TrayItem[];
  /** 总记录数 */
  total: number;
  /** 当前页记录数 */
  count: number;
}

/** 新增托盘参数 */
export interface TrayCreateParams {
  /** 托盘编码，必填 */
  palletCode: string;
  /** 托盘名称，必填 */
  palletName: string;
  /** 额定承载量，必填且大于0 */
  loadCapacity: number;
  /** 状态：0=停用，1=启用 */
  status: number;
  /** 备注，选填 */
  remark?: string;
}

/** 修改托盘参数 */
export interface TrayUpdateParams {
  /** 主键ID，必填 */
  id: number;
  /** 托盘编码，必填 */
  palletCode: string;
  /** 托盘名称，必填 */
  palletName: string;
  /** 额定承载量，必填且大于0 */
  loadCapacity: number;
  /** 状态：0=停用，1=启用 */
  status: number;
  /** 备注，选填 */
  remark?: string;
}

// ========== 接口函数 ==========

/**
 * 分页查询托盘列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listTrays(params: TrayListParams) {
  return requestClient.get<TrayListResult>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/pallet/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询托盘详情
 * @param id 托盘主键ID
 * @returns 托盘详情
 */
export async function getTrayById(id: number) {
  return requestClient.get<TrayItem>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/pallet/${id}`,
  );
}

/**
 * 新增托盘
 * @param params 托盘信息
 * @returns 新增后的托盘
 */
export async function createTray(params: TrayCreateParams) {
  return requestClient.post<TrayItem>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/pallet/create`,
    params,
  );
}

/**
 * 修改托盘
 * @param params 托盘信息
 * @returns 修改后的托盘
 */
export async function updateTray(params: TrayUpdateParams) {
  return requestClient.post<TrayItem>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/pallet/update`,
    params,
  );
}

/**
 * 逻辑删除托盘
 * @param id 托盘主键ID
 * @returns 被删除的托盘记录ID
 */
export async function deleteTray(id: number) {
  return requestClient.delete<number>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/pallet/${id}`,
  );
}
