// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 等级列表查询参数 */
export interface LevelListParams {
  /** 等级编号，支持模糊查询 */
  gradeCode?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 等级记录 */
export interface LevelItem {
  /** 主键 */
  id: number;
  /** 等级编号 */
  gradeCode: string;
  /** 等级名称 */
  gradeName: string;
}

/** 分页查询结果 */
export interface LevelListResult {
  /** 当前页数据 */
  list: LevelItem[];
  /** 总条数 */
  total: number;
}

/** 新增等级参数 */
export interface LevelCreateParams {
  /** 等级编号，必填 */
  gradeCode: string;
  /** 等级名称，必填 */
  gradeName: string;
}

/** 修改等级参数 */
export interface LevelUpdateParams {
  /** 主键，编辑时必填 */
  id?: number;
  /** 等级编号，必填 */
  gradeCode: string;
  /** 等级名称，必填 */
  gradeName: string;
}

// ========== 接口函数 ==========

/**
 * 分页查询等级列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listLevels(params: LevelListParams) {
  return requestClient.get<LevelListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/grade/search?${qs.stringify(params)}`,
  );
}

/**
 * 添加等级
 * @param params 等级信息
 * @returns 保存结果
 */
export async function addLevel(params: LevelCreateParams) {
  return requestClient.post<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/grade/add`,
    params,
  );
}

/**
 * 修改等级
 * @param params 等级信息
 * @returns 修改结果
 */
export async function updateLevel(params: LevelUpdateParams) {
  return requestClient.put<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/grade/update`,
    params,
  );
}

/**
 * 删除等级
 * @param id 主键
 * @returns 删除结果
 */
export async function deleteLevel(id: number) {
  return requestClient.delete<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/grade/delete/${id}`,
  );
}
