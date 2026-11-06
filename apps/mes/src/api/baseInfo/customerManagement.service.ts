// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 客户管理列表查询参数 */
export interface CustomerListParams {
  /** 客户编码，支持模糊查询；为空时不限制 */
  customerCode?: string;
  /** 客户名称，支持模糊查询；为空时不限制 */
  customerName?: string;
  /** 页码，从 1 开始 */
  pageNum?: number;
  /** 每页数量，范围 1 到 200，默认 20 */
  pageSize?: number;
}

/** 客户记录 */
export interface CustomerItem {
  /** 客户主键ID，查看详情时使用 */
  id: number;
  /** 客户编码 */
  customerCode: string;
  /** 客户名称 */
  customerName: string;
  /** SAP工厂编码 */
  sapPlantCode?: null | string;
  /** 国家编码 */
  nationCode?: null | string;
  /** 是否有效：1有效，0无效 */
  isEffective: 0 | 1;
}

/** 客户分页查询结果 */
export interface CustomerListResult {
  /** 符合条件的总记录数 */
  total: number;
  /** 当前页记录数 */
  count: number;
  /** 当前页客户列表 */
  results: CustomerItem[];
}

// ========== 接口函数 ==========

/**
 * 客户管理条件分页查询（按客户编码、客户名称模糊查询，条件均不传时查询全部）
 * @param {CustomerListParams} params 查询参数，含客户编码/名称与分页参数
 * @returns {Promise<CustomerListResult>} 客户分页数据
 * @since 2026-11-06 00:00:00
 */
export async function listCustomers(params: CustomerListParams) {
  return requestClient.get<CustomerListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/customer/list?${qs.stringify(params)}`,
  );
}

/**
 * 查看客户详情
 * @param {number} id 客户主键ID，从列表接口的 id 字段取得
 * @returns {Promise<CustomerItem>} 客户详情，客户不存在时接口统一报错提示
 * @since 2026-11-06 00:00:00
 */
export async function getCustomerDetail(id: number) {
  return requestClient.get<CustomerItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/customer/detail/${id}`,
  );
}
