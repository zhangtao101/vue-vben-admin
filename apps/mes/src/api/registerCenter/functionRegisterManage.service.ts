// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 功能登记信息 ==========

/**
 * 注册登记查询接口（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页展示条数
 * @param {string} [params.registerCode] - 注册编号
 * @param {string} [params.registerFunctionType] - 工步类型编号
 * @param {number} [params.registerType] - 登记类型 1API接口 2mqtt 3数据库 4url连接
 * @returns {Promise<any>} 包含分页信息的功能登记列表
 */
export async function selectRegisterRecordList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/registerRecord/selectList?${qs.stringify(params)}`,
  );
}

/**
 * 新增功能登记
 * @param {Object} params - 新增参数
 * @param {string} params.registerCode - 登记编号，唯一ID
 * @param {number} params.registerFlag - 权限标记 1无权限校验 2指定权限校验
 * @param {string} [params.registerTokenCode] - 权限校验编码，指定校验时字段不允许为空
 * @param {string} params.registerFunctionType - 登记工步
 * @param {number} params.registerTrigger - 触发方式 1主动调用 2实时监听 3轮询读取 4修改推送
 * @param {number} params.registerType - 登记类型 1API接口 2mqtt 3数据库 4url连接
 * @returns {Promise<any>} 保存后的ID
 */
export async function insertRegisterRecord(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/registerRecord/insert`,
    params,
  );
}

/**
 * 修改功能登记信息
 * @param {Object} params - 修改参数
 * @param {number} params.id - ID 编号
 * @param {string} params.registerCode - 登记编号
 * @param {number} params.registerFlag - 权限标记 1无权限校验 2指定权限校验
 * @param {string} [params.registerTokenCode] - 权限校验编码
 * @param {string} params.registerFunctionType - 登记工步
 * @param {number} params.registerTrigger - 触发方式 1主动调用 2实时监听 3轮询读取 4修改推送
 * @param {number} params.registerType - 登记类型 1API接口 2mqtt 3数据库 4url连接
 * @param {number} [params.isUse] - 启停用 -1停用 1启用
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function updateRegisterRecord(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/registerRecord/update`,
    params,
  );
}

/**
 * 删除功能登记明细
 * @param {number|string} id - ID 编号
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function deleteRegisterRecord(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/registerRecord/delete?${qs.stringify({ id })}`,
  );
}

// ========== 功能登记明细 ==========

/**
 * 根据登记信息ID获取明细详情列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页展示条数
 * @param {number} params.registerId - 登记信息ID
 * @returns {Promise<any>} 包含分页信息的登记明细列表
 */
export async function selectRegisterDetailList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/registerDetail/selectList?${qs.stringify(params)}`,
  );
}

/**
 * 功能注册明细添加
 * @param {Object} params - 新增参数
 * @param {string} params.registerDetailJson - 登记详情JSON，根据登记类型不同结构不同
 * @param {number} params.registerId - 登记信息ID
 * @returns {Promise<any>} 保存后的ID
 */
export async function insertRegisterDetail(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/registerDetail/insert`,
    params,
  );
}

/**
 * 功能注册明细修改
 * @param {Object} params - 修改参数
 * @param {number} params.id - ID 编号
 * @param {string} params.registerDetailJson - 登记详情JSON
 * @param {number} params.registerId - 登记信息ID
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function updateRegisterDetail(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/registerDetail/update`,
    params,
  );
}

/**
 * 删除登记记录的明细详情
 * @param {number|string} id - ID 编号
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function deleteRegisterDetail(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/registerDetail/delete?${qs.stringify({ id })}`,
  );
}
