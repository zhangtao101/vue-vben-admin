// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 供应商管理列表查询参数 */
export interface SupplierListParams {
  /** 供应商编码，支持模糊查询；为空时不限制 */
  manufacturerCode?: string;
  /** 供应商名称，支持模糊查询；为空时不限制 */
  manufacturerName?: string;
  /** 页码，从 1 开始 */
  pageNum?: number;
  /** 每页数量，范围 1 到 200，默认 20 */
  pageSize?: number;
}

/** 供应商记录 */
export interface SupplierItem {
  /** 供应商主键ID，查看详情时使用 */
  id: number;
  /** 供应商编码 */
  manufacturerCode: string;
  /** 供应商名称 */
  manufacturerName: string;
  /** SAP工厂编码 */
  sapPlantCode?: null | string;
  /** 国家编码 */
  nationCode?: null | string;
  /** 是否有效：1有效，0无效 */
  isEffective: 0 | 1;
}

/** 供应商分页查询结果 */
export interface SupplierListResult {
  /** 符合条件的总记录数 */
  total: number;
  /** 当前页记录数 */
  count: number;
  /** 当前页供应商列表 */
  results: SupplierItem[];
}

// ========== 接口函数 ==========

/**
 * 供应商管理条件分页查询（按供应商编码、供应商名称模糊查询，条件均不传时查询全部）
 * @param {SupplierListParams} params 查询参数，含供应商编码/名称与分页参数
 * @returns {Promise<SupplierListResult>} 供应商分页数据
 * @since 2026-11-07 00:00:00
 */
export async function listSuppliers(params: SupplierListParams) {
  return requestClient.get<SupplierListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/manufacturer/list?${qs.stringify(params)}`,
  );
}

/**
 * 查看供应商详情
 * @param {number} id 供应商主键ID，从列表接口的 id 字段取得
 * @returns {Promise<SupplierItem>} 供应商详情，供应商不存在时接口统一报错提示
 * @since 2026-11-07 00:00:00
 */
export async function getSupplierDetail(id: number) {
  return requestClient.get<SupplierItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/manufacturer/detail/${id}`,
  );
}
