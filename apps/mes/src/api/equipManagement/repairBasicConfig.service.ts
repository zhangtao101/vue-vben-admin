/**
 * [INPUT]: 依赖 qs、#/api/request 的 requestClient，调用维修基础配置管理接口
 * [OUTPUT]: 对外提供维修基础配置 CRUD 与批量操作的 API 函数
 * [POS]: 设备管理-维修维护模块 的 API 层，被 repairBasicConfig.vue 等页面引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-16 09:53:00
 */

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 维修基础配置相关 ==========

/**
 * 按类型查询基础配置列表。
 * @param {Object} params - 查询参数。
 * @param {string} params.configType - 配置类型编码（如 REPAIR_TYPE、FAULT_LEVEL 等）。
 * @param {string} [params.status] - 可选，状态筛选。
 * @returns {Promise<any>} 返回包含配置列表和分页信息的响应对象。
 * @throws {Error} 网络异常或服务端错误时 Promise 被拒绝。
 * @since 2026-04-20 15:13:00
 */
export async function getRepairBasicConfigList(params: {
  configType: string;
  status?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询基础配置详情。
 * @param {any} id - 基础配置项 ID。
 * @returns {Promise<any>} 返回配置详情数据。
 * @throws {Error} 记录不存在或网络异常时 Promise 被拒绝。
 * @since 2026-04-20 15:13:00
 */
export async function getRepairBasicConfigById(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/${id}`,
  );
}

/**
 * 创建基础配置项。
 * @param {Object} params - 创建参数。
 * @param {string} params.configCode - 配置编码。
 * @param {string} params.configName - 配置名称。
 * @param {string} params.configType - 配置类型编码。
 * @param {string} [params.parentCode] - 可选，父级编码。
 * @param {string} [params.remark] - 可选，备注。
 * @param {string} [params.repairGroupCode] - 可选，维修组编码。
 * @param {number} [params.sortOrder] - 可选，排序序号。
 * @returns {Promise<any>} 返回创建结果，code 200 表示成功。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-04-20 15:13:00
 */
export async function createRepairBasicConfig(params: {
  configCode: string;
  configName: string;
  configType: string;
  parentCode?: string;
  remark?: string;
  repairGroupCode?: string;
  sortOrder?: number;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/create`,
    params,
  );
}

/**
 * 更新基础配置项。
 * @param {Object} params - 更新参数。
 * @param {string} params.configCode - 配置编码。
 * @param {string} params.configName - 配置名称。
 * @param {string} params.configType - 配置类型编码。
 * @param {number} params.id - 配置项 ID。
 * @param {string} [params.parentCode] - 可选，父级编码。
 * @param {string} [params.remark] - 可选，备注。
 * @param {string} [params.repairGroupCode] - 可选，维修组编码。
 * @param {number} [params.sortOrder] - 可选，排序序号。
 * @returns {Promise<any>} 返回更新结果，code 200 表示成功。
 * @throws {Error} 记录不存在或网络异常时 Promise 被拒绝。
 * @since 2026-04-20 15:13:00
 */
export async function updateRepairBasicConfig(params: {
  configCode: string;
  configName: string;
  configType: string;
  id: number;
  parentCode?: string;
  remark?: string;
  repairGroupCode?: string;
  sortOrder?: number;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/update`,
    params,
  );
}

/**
 * 删除单个基础配置项。
 * @param {any} id - 要删除的配置项 ID。
 * @returns {Promise<any>} 返回删除结果，code 200 表示成功。
 * @throws {Error} 记录不存在或网络异常时 Promise 被拒绝。
 * @since 2026-04-20 15:13:00
 */
export async function deleteRepairBasicConfig(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/${id}`,
  );
}

/**
 * 启用基础配置项。
 * @param {any} id - 要启用的配置项 ID。
 * @returns {Promise<any>} 返回启用结果，code 200 表示成功。
 * @throws {Error} 记录不存在或网络异常时 Promise 被拒绝。
 * @since 2026-04-20 15:13:00
 */
export async function enableRepairBasicConfig(id: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/enable/${id}`,
  );
}

/**
 * 禁用基础配置项。
 * @param {any} id - 要禁用的配置项 ID。
 * @returns {Promise<any>} 返回禁用结果，code 200 表示成功。
 * @throws {Error} 记录不存在或网络异常时 Promise 被拒绝。
 * @since 2026-04-20 15:13:00
 */
export async function disableRepairBasicConfig(id: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/disable/${id}`,
  );
}

/**
 * 批量删除基础配置项，传入 ID 数组一次性删除。
 * @param {number[]} ids - 待删除的配置项 ID 数组，不能为空。
 * @returns {Promise<any>} 返回批量删除结果，code 200 表示成功，402 表示失败。
 * @throws {Error} ID 列表为空或网络异常时 Promise 被拒绝。
 * @since 2026-06-16 09:47:00
 */
export async function batchDeleteRepairBasicConfig(ids: number[]) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/base-config/batch-delete`,
    ids,
  );
}
