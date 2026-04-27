// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 模治具类别相关 ==========

/**
 * 模治具类别查询参数
 */
export interface MoldCategoryParams {
  keyword?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 模治具类别实体
 */
export interface MoldCategory {
  id?: number;
  categoryCode?: string;
  categoryName?: string;
  warningThreshold?: number;
  blockThreshold?: number;
}

/**
 * 模治具类别分页结果
 */
export interface MoldCategoryPageResult {
  records: MoldCategory[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

// ========== 模治具类别查询 ==========

/**
 * 查询类别列表
 */
export async function getMoldCategoryList(params?: {
  keyword?: string;
  status?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/category/list?${qs.stringify(params || {})}`,
  );
}

// ========== 模具基础信息相关 ==========

/**
 * 模具基础信息查询参数
 */
export interface MoldBaseParams {
  categoryId?: number;
  status?: string;
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 模具基础信息实体
 */
export interface MoldBase {
  id?: number;
  moldCode?: string;
  moldName?: string;
  moldGroupCode?: string;
  moldGroupName?: string;
  status?: string;
}

/**
 * 模具基础信息分页结果
 */
export interface MoldBasePageResult {
  records: MoldBase[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

/**
 * 分页查询模具列表
 */
export async function getMoldBaseListPage(params: MoldBaseParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/base/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 按模具编号查询模具详情
 */
export async function getMoldBaseByCode(moldCode: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/base/byCode?${qs.stringify({ moldCode })}`,
  );
}

/**
 * 分页查询类别列表
 */
export async function getMoldCategoryPage(params: MoldCategoryParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/category/list-page?${qs.stringify(params)}`,
  );
}
