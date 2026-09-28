// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 制面产线与包装产线关系查询参数 */
export interface SubLineRelSearchParams {
  /** 制面机编号 */
  noodleSubLineCode?: string;
  /** 制面机名称 */
  noodleSubLineName?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 关联的包装子产线 */
export interface PackageSubLineItem {
  /** 包装子产线 id */
  id: number;
  /** 包装子产线编号 */
  subLineCode: string;
  /** 包装子产线名称 */
  subLineName: string;
}

/** 制面产线与包装产线关系记录 */
export interface SubLineRelItem {
  /** 制面子产线 id */
  noodleSubLineId: number;
  /** 制面子产线编号 */
  noodleSubLineCode: string;
  /** 制面子产线名称 */
  noodleSubLineName: string;
  /** 已关联的包装子产线列表 */
  packageList: PackageSubLineItem[];
}

/** 分页查询结果 */
export interface SubLineRelListResult {
  /** 当前页数据 */
  list: SubLineRelItem[];
  /** 总条数 */
  total: number;
}

/** 新增/修改制面产线与包装产线关系参数 */
export interface SubLineRelSaveParams {
  /** 制面子产线 id */
  noodleSubLineId: number;
  /** 包装子产线 id 列表 */
  packageSubLineIds: number[];
}

// ========== 接口函数 ==========

/**
 * 分页查询制面产线与包装产线关系
 * @param params 查询参数（制面机编号/名称）
 * @returns 分页结果
 * @since 2026-09-28
 */
export async function searchSubLineRel(params: SubLineRelSearchParams) {
  return requestClient.get<SubLineRelListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLineRel/search?${qs.stringify(params)}`,
  );
}

/**
 * 新增制面产线与包装产线关系
 * @param params 制面子产线 id 与包装子产线 id 列表
 * @returns 新增结果
 * @since 2026-09-28
 */
export async function addSubLineRel(params: SubLineRelSaveParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLineRel/add`,
    params,
  );
}

/**
 * 修改制面产线与包装产线关系
 * @param params 制面子产线 id 与包装子产线 id 列表
 * @returns 修改结果
 * @since 2026-09-28
 */
export async function updateSubLineRel(params: SubLineRelSaveParams) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLineRel/update`,
    params,
  );
}

/**
 * 删除制面产线与包装产线关系
 * @param noodleSubLineId 制面子产线 id
 * @returns 删除结果
 * @since 2026-09-28
 */
export async function deleteSubLineRel(noodleSubLineId: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLineRel/delete/${noodleSubLineId}`,
  );
}
