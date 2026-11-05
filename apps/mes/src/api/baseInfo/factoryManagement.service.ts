// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 工厂列表查询参数 */
export interface FactoryListParams {
  /** 工厂编码，支持模糊查询；为空时不限制 */
  factoryCode?: string;
  /** 工厂名称，支持模糊查询；为空时不限制 */
  factoryName?: string;
  /** 状态：1=启用，0=停用；为空时查询全部状态 */
  status?: 0 | 1;
  /** 页码，从 1 开始 */
  pageNum?: number;
  /** 每页条数，默认 10，最大 200 */
  pageSize?: number;
}

/** 工厂记录 */
export interface FactoryItem {
  /** 工厂主键，编辑和删除时使用 */
  id: number;
  /** 工厂编码 */
  factoryCode: string;
  /** 工厂名称 */
  factoryName: string;
  /** 状态：1=启用，0=停用 */
  status: 0 | 1;
  /** 备注，可为空 */
  remark?: null | string;
}

/** 分页查询结果 */
export interface FactoryListResult {
  /** 当前页工厂数据 */
  results: FactoryItem[];
  /** 符合查询条件的总条数 */
  total: number;
  /** 当前页实际条数 */
  count: number;
}

/** 新增工厂参数 */
export interface FactoryCreateParams {
  /** 工厂编码，必填，全局唯一 */
  factoryCode: string;
  /** 工厂名称，必填 */
  factoryName: string;
  /** 状态：1=启用，0=停用；不传时后端默认 1 */
  status?: 0 | 1;
  /** 备注，可为空 */
  remark?: null | string;
}

/** 修改工厂参数（工厂编码保存后锁定，必须原值回传） */
export interface FactoryUpdateParams {
  /** 工厂主键，必填 */
  id: number;
  /** 工厂编码，必填，不可修改，原值回传 */
  factoryCode: string;
  /** 工厂名称，必填 */
  factoryName: string;
  /** 状态：1=启用，0=停用，必填 */
  status: 0 | 1;
  /** 备注，可为空 */
  remark?: null | string;
}

// ========== 接口函数 ==========

/**
 * 分页查询工厂列表
 * @param params 查询参数（编码、名称支持模糊查询）
 * @returns 分页结果
 */
export async function listFactories(params: FactoryListParams) {
  return requestClient.get<FactoryListResult>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/factory/list?${qs.stringify(params)}`,
  );
}

/**
 * 新增工厂
 * @param params 工厂信息（新增时不传 id，编码全局唯一）
 * @returns 新增结果（写操作不返回业务明细）
 */
export async function createFactory(params: FactoryCreateParams) {
  return requestClient.post<null>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/factory/create`,
    params,
  );
}

/**
 * 修改工厂
 * @param params 工厂信息（编码必须原值回传且不可编辑，名称修改后同步到未删除喷码模板）
 * @returns 修改结果（写操作不返回业务明细）
 */
export async function updateFactory(params: FactoryUpdateParams) {
  return requestClient.post<null>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/factory/update`,
    params,
  );
}

/**
 * 逻辑删除工厂（存在未删除喷码模板引用时拒绝删除）
 * @param id 工厂主键
 * @returns 删除结果（写操作不返回业务明细）
 */
export async function deleteFactory(id: number) {
  return requestClient.delete<null>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/factory/${id}`,
  );
}

/**
 * 查询启用工厂下拉选项（供喷码模板等页面选择工厂）
 * @param keyword 工厂编码或名称关键字，支持模糊查询；为空时返回全部启用选项
 * @returns 启用工厂下拉选项数组（factoryCode 工厂编码、factoryName 工厂名称）
 */
export async function listFactoryOptions(keyword?: string) {
  return requestClient.get<
    Array<{ factoryCode: string; factoryName: string }>
  >(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/factory/options?${qs.stringify({ keyword })}`,
  );
}
