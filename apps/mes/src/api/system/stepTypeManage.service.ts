// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 工步类型 ==========

/**
 * 获取工步类型列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页展示条数
 * @param {string} [params.functionType] - 工步类型编号
 * @param {string} [params.functionTypeName] - 工步类型名称
 * @param {string} [params.functionFlag] - 工步类型标记 1开始工步 2完结工步 3执行工步 4判断工步 5监听工步
 * @returns {Promise<any>} 包含分页信息的工步类型列表
 */
export async function selectTypeList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/typeInfo/selectList?${qs.stringify(params)}`,
  );
}

/**
 * 新增工步类型
 * @param {Object} params - 新增参数
 * @param {number} params.functionFlag - 工步类型标记 1开始工步 2完结工步 3执行工步 4判断工步 5监听工步
 * @param {string} params.functionType - 工步类型编号
 * @param {string} params.functionTypeName - 工步类型名称
 * @returns {Promise<any>} 保存后的ID
 */
export async function insertType(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/typeInfo/insert`,
    params,
  );
}

/**
 * 修改工步类型
 * @param {Object} params - 修改参数
 * @param {number} params.id - 编号ID
 * @param {number} params.functionFlag - 工步类型标记 1开始工步 2完结工步 3执行工步 4判断工步 5监听工步
 * @param {string} params.functionType - 工步类型编号
 * @param {string} params.functionTypeName - 工步类型名称
 * @param {number} [params.isUse] - 启停用 -1停用 1启用，仅在启停用按钮调用时传入
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function updateType(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/typeInfo/update`,
    params,
  );
}

/**
 * 根据ID查询工步类型
 * @param {number} id - 工步类型ID
 * @returns {Promise<any>} 工步类型明细内容
 */
export async function selectTypeById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/typeInfo/selectById?${qs.stringify({ id })}`,
  );
}

/**
 * 删除工步类型
 * @param {number|string} id - 工步类型ID
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function deleteType(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/typeInfo/delete?${qs.stringify({ id })}`,
  );
}

// ========== 工步参数 ==========

/**
 * 根据条件查询工步参数列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页展示条数
 * @param {string} [params.functionType] - 工步类型编号
 * @param {string} [params.paramCode] - 参数编号
 * @param {string} [params.paramName] - 参数名称
 * @returns {Promise<any>} 包含分页信息的工步参数列表
 */
export async function selectParamList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/paramDetail/selectList?${qs.stringify(params)}`,
  );
}

/**
 * 工步类型添加参数
 * @param {Object} params - 新增参数
 * @param {string} params.functionType - 工步类型编号
 * @param {string} params.paramAttribute - 工步参数属性编号，下拉列表选择时传入的属性类别编号
 * @param {string} params.paramBinding - 参数关联点位，下拉列表选择时传入的点位编码
 * @param {string} params.paramCode - 参数编号
 * @param {string} params.paramCron - 参数表达式
 * @param {number} params.paramFlag - 参数标记 1传入参数 2输出参数
 * @param {string} params.paramName - 参数名称
 * @param {number} params.paramType - 参数类型 1整数 2浮点数 3字符串 4json
 * @param {any} [params.paramUseId] - 引用参数ID，下拉列表选择时传入的参数ID
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function insertParam(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/paramDetail/insert`,
    params,
  );
}

/**
 * 修改工步参数明细
 * @param {Object} params - 修改参数
 * @param {number} params.id - 编号ID
 * @param {string} params.functionType - 工步类型编号
 * @param {string} params.paramCode - 参数编号
 * @param {string} params.paramName - 参数名称
 * @param {number} params.paramType - 参数类型 1整数 2浮点数 3字符串 4json
 * @param {string} params.paramAttribute - 工步参数属性编号
 * @param {string} params.paramCron - 参数表达式
 * @param {string} params.paramBinding - 参数关联点位
 * @param {any} [params.paramUseId] - 引用参数ID
 * @param {number} params.paramFlag - 参数标记 1传入参数 2输出参数
 * @param {number} params.isUse - 启停用 -1停用 1启用
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function updateParam(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/paramDetail/update`,
    params,
  );
}

/**
 * 删除工步类型参数明细
 * @param {number|string} id - 参数明细ID
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function deleteParam(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/paramDetail/delete?${qs.stringify({ id })}`,
  );
}
