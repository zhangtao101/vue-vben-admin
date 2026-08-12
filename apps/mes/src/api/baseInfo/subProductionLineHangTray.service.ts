// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 子产线托盘绑定关系查询参数 */
export interface SubLineEquipSearchParams {
  /** 子产线编号 */
  subLineCode?: string;
  /** 子产线名称 */
  subLineName?: string;
  /** 产线编号 */
  lineCode?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 子产线托盘绑定关系记录 */
export interface SubLineEquipItem {
  /** 主键 */
  id: number;
  /** 子产线编号 */
  subLineCode: string;
  /** 子产线名称 */
  subLineName: string;
  /** 子产线ID */
  subLineId: string;
  /** 产线编号 */
  lineCode: string;
  /** 产线名称 */
  lineName: string;
  /** 挂载托盘ID */
  equipCode: null | string;
}

/** 分页查询结果 */
export interface SubLineEquipListResult {
  list: SubLineEquipItem[];
  total: number;
}

/** 批量修改绑定参数 */
export interface UpdateEquipParams {
  /** 主键 */
  id: number;
  /** 设备ID */
  equipId: number;
}

// ========== 接口函数 ==========

/**
 * 展示子产线与托盘绑定关系（分页查询）
 * @param params 查询参数
 * @returns 分页结果
 * @since 2026-08-11
 */
export async function searchSubLineEquip(params: SubLineEquipSearchParams) {
  return requestClient.get<SubLineEquipListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/equipSearch?${qs.stringify(params)}`,
  );
}

/**
 * 批量修改设备
 * @param params 更新参数列表
 * @returns 修改结果
 * @since 2026-08-11
 */
export async function updateSubLineEquip(params: UpdateEquipParams[]) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/updateEquip`,
    params,
  );
}

/**
 * 批量解除关系
 * @param ids 主键ID列表
 * @returns 删除结果
 * @since 2026-08-11
 */
export async function deleteSubLineEquip(ids: number[]) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/deleteEquip?${qs.stringify({ ids: ids.join(',') })}`,
  );
}

/**
 * 返回所有没有被绑定的设备
 * @returns 未绑定设备列表
 * @since 2026-08-11
 */
export async function getUnbindedEquip() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/search`,
  );
}
