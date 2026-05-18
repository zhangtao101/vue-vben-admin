/**
 * [INPUT]: 依赖 requestClient、qs、import.meta.env
 * [OUTPUT]: 对外提供模具类别管理相关 API 函数
 * [POS]: 设备管理模块 的模具类别管理 API 服务
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-18 10:26:00
 */
// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/**
 * 模具类别保存参数
 */
export interface MoldCategoryMgmtSaveParams {
  /** 类别ID，编辑时传入，新增时不传 */
  id?: number;
  /** 类别编码，必填 */
  categoryCode: string;
  /** 类别名称，必填 */
  categoryName: string;
  /** 类别来源，必填。KG-客供(外购)，ZZ-自制 */
  categorySource: string;
  /** 适用设备组 */
  equipmentGroup?: string;
  /** 预警阈值(%)，必填 */
  warningThreshold: number;
  /** 拦截阈值(%)，必填 */
  blockThreshold: number;
  /** 恢复模式，必填。PERCENT-百分比恢复，FIXED-固定值恢复，MANUAL-手工恢复，NONE-不恢复 */
  recoveryMode: string;
  /** 恢复百分比(%)，恢复模式为 PERCENT 时必填 */
  recoveryPercent?: number;
  /** 恢复固定值，恢复模式为 FIXED 时必填 */
  recoveryFixed?: number;
  /** 提前预警天数 */
  advanceDays?: number;
}

/**
 * 模具类别实体
 */
export interface MoldCategoryMgmt {
  /** 类别ID */
  id: number;
  /** 类别编码 */
  categoryCode: string;
  /** 类别名称 */
  categoryName: string;
  /** 类别来源，KG-客供，ZZ-自制 */
  categorySource: string;
  /** 适用设备组 */
  equipmentGroup?: string;
  /** 预警阈值(%) */
  warningThreshold: number;
  /** 拦截阈值(%) */
  blockThreshold: number;
  /** 恢复模式 */
  recoveryMode: string;
  /** 恢复百分比(%) */
  recoveryPercent?: number;
  /** 恢复固定值 */
  recoveryFixed?: number;
  /** 提前预警天数 */
  advanceDays?: number;
  /** 状态，ACTIVE-启用，DISABLED-停用 */
  status: string;
}

/**
 * 模具类别分页查询参数
 */
export interface MoldCategoryMgmtPageParams {
  /** 状态筛选，ACTIVE-启用，DISABLED-停用；不传表示全部 */
  status?: string;
  /** 类别来源筛选 */
  categorySource?: string;
  /** 关键词搜索，匹配类别编码或类别名称 */
  keyword?: string;
  /** 页码，默认1 */
  pageNum?: number;
  /** 每页条数，默认10 */
  pageSize?: number;
}

/**
 * 模具类别下拉选项参数
 */
export interface MoldCategoryMgmtSelectParams {
  /** 状态筛选，传ACTIVE只返回启用的类别 */
  status?: string;
  /** 类别来源筛选 */
  categorySource?: string;
  /** 关键词搜索 */
  keyword?: string;
}

/**
 * 模具类别下拉选项（用于选择类别后自动带出字段）
 */
export interface MoldCategoryMgmtSelectOption {
  /** 类别ID，下拉框value */
  id: number;
  /** 类别名称，下拉框label */
  categoryName: string;
  /** 预警阈值(%)，选类别后自动带出 */
  warningThreshold: number;
  /** 拦截阈值(%) */
  blockThreshold: number;
  /** 恢复模式 */
  recoveryMode: string;
  /** 恢复百分比 */
  recoveryPercent?: number;
  /** 固定恢复值 */
  recoveryFixed?: number;
  /** 提前预警天数 */
  advanceDays?: number;
  /** 状态 */
  status: string;
}

// ========== 接口定义 ==========

/**
 * 分页查询模具类别列表
 * @description 类别列表页使用，分页返回类别数据
 */
export async function getMoldCategoryPageList(
  params: MoldCategoryMgmtPageParams,
) {
  return requestClient.get<{
    count: number;
    results: MoldCategoryMgmt[];
    total: number;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/category/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 查询类别全量列表（不分页）
 * @description 用于下拉选择，如模具档案新增/编辑页的「类别」下拉
 * @param params - 查询参数，status=ACTIVE 只查启用的类别
 */
export async function getMoldCategorySelectList(
  params?: MoldCategoryMgmtSelectParams,
) {
  return requestClient.get<MoldCategoryMgmtSelectOption[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/category/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 保存模具类别（新增/编辑）
 * @description 新增或编辑模具类别。有 id 为编辑，无 id 为新增。新增后默认状态为「停用」
 * @param params - 类别信息
 */
export async function saveMoldCategory(params: MoldCategoryMgmtSaveParams) {
  return requestClient.post<MoldCategoryMgmt>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/category`,
    params,
  );
}

/**
 * 启用模具类别
 * @description 将类别状态改为启用(ACTIVE)
 * @param id - 类别ID
 */
export async function enableMoldCategoryById(id: number) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/category/enable/${id}`,
  );
}

/**
 * 停用模具类别
 * @description 将类别状态改为停用(DISABLED)
 * @param id - 类别ID
 */
export async function disableMoldCategoryById(id: number) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/category/disable/${id}`,
  );
}

/**
 * 删除模具类别
 * @description 按ID删除类别
 * @param id - 类别ID
 */
export async function deleteMoldCategoryById(id: number) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/category/${id}`,
  );
}
