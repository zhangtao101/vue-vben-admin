// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 面机设备列表查询参数 */
export interface SurfaceMachineListParams {
  /** 类型 */
  type?: string;
  /** 设备编号，支持模糊查询 */
  equipCode?: string;
  /** 删除标记：不传展示未删除，2 表示已删除 */
  isDelete?: number;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 面机设备记录 */
export interface SurfaceMachineItem {
  /** 主键 */
  id: number;
  /** 管理号码 */
  equipCode: string;
  /** 管理名称 */
  equipName: string;
  /** 类型 */
  type: string;
  /** 购买时间 */
  purchaseDate: string;
  /** 最后一次使用时间 */
  useDate: string;
  /** 更换周期（小时） */
  replaceCycleHours: number;
  /** 实际使用时间（小时） */
  actualUsageHours: number;
  /** 删除标记：1 未删除 2 已删除 */
  isDelete: number;
}

/** 分页查询结果 */
export interface SurfaceMachineListResult {
  /** 当前页数据 */
  list: SurfaceMachineItem[];
  /** 总条数 */
  total: number;
}

/** 新增面机设备参数 */
export interface SurfaceMachineCreateParams {
  /** 设备编号，必填 */
  equipCode: string;
  /** 设备名称，必填 */
  equipName: string;
  /** 购买日期，必填 */
  purchaseDate: string;
  /** 更换周期（小时），必填 */
  replaceCycleHours: number;
  /** 类型，必填 */
  type: string;
}

/** 修改面机参数 */
export interface SurfaceMachineUpdateParams {
  /** 主键，必填 */
  id: number;
  /** 管理号码，必填 */
  equipCode: string;
  /** 管理名称，必填 */
  equipName: string;
  /** 购买日期，必填 */
  purchaseDate: string;
  /** 更换周期（小时），必填 */
  replaceCycleHours: number;
  /** 类型，必填 */
  type: string;
}

// ========== 接口函数 ==========

/**
 * 分页查询面机设备列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listSurfaceMachines(params: SurfaceMachineListParams) {
  return requestClient.get<SurfaceMachineListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/noodle/search?${qs.stringify(params)}`,
  );
}

/**
 * 保存面机设备
 * @param params 面机设备信息
 * @returns 保存结果
 */
export async function addSurfaceMachine(params: SurfaceMachineCreateParams) {
  return requestClient.post<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/noodle/add`,
    params,
  );
}

/**
 * 修改面机
 * @param params 面机设备信息
 * @returns 修改结果
 */
export async function updateSurfaceMachine(params: SurfaceMachineUpdateParams) {
  return requestClient.put<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/noodle/update`,
    params,
  );
}

/**
 * 删除面机
 * @param id 主键
 * @returns 删除结果
 */
export async function deleteSurfaceMachine(id: number) {
  return requestClient.delete<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/noodle/delete/${id}`,
  );
}
