// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询工步属性类别列表（分页）
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页展示条数
 * @param {string} [params.functionAttributeType] - 属性类别编号
 * @param {string} [params.functionAttributeTypeName] - 属性类别名称
 * @param {number} [params.attributeFlag] - 属性标记 1业务填报 2数采关联 3外部引用 4逻辑计算
 * @returns {Promise<any>} 包含分页信息的属性类别列表
 */
export async function selectAttrTypeList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/attributeType/selectList?${qs.stringify(params)}`,
  );
}

/**
 * 工步属性类别添加
 * @param {Object} params - 新增参数
 * @param {number} params.attributeFlag - 属性标记 1业务填报 2数采关联 3外部引用 4逻辑计算
 * @param {string} params.functionAttributeType - 属性类别编号
 * @param {string} params.functionAttributeTypeName - 属性类别名称
 * @param {number} params.iseUse - 启停用，新增时默认-1
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function insertAttrType(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/attributeType/insert`,
    params,
  );
}

/**
 * 工步参数属性类别修改
 * @param {Object} params - 修改参数
 * @param {number} params.id - 类别ID
 * @param {number} params.attributeFlag - 属性标记 1业务填报 2数采关联 3外部引用 4逻辑计算
 * @param {string} params.functionAttributeType - 属性类别编号
 * @param {string} params.functionAttributeTypeName - 属性类别名称
 * @param {number} params.iseUse - 启停用 -1停用 1启用
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function updateAttrType(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/attributeType/update`,
    params,
  );
}

/**
 * 根据Id获取属性类别明细内容
 * @param {number} id - 类别ID
 * @returns {Promise<any>} 属性类别明细内容
 */
export async function selectAttrTypeById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/attributeType/selectById?${qs.stringify({ id })}`,
  );
}

/**
 * 根据ID删除属性类别
 * @param {number|string} id - 类别ID
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function deleteAttrType(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/attributeType/delete?${qs.stringify({ id })}`,
  );
}

/**
 * 获取已启用的参数属性类别列表
 * @param {Object} [params] - 查询参数
 * @param {string} [params.functionAttributeTypeName] - 参数属性类别名称
 * @returns {Promise<any>} 已启用的参数属性类别列表
 */
export async function listAllUseAttribute(params?: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/opfunction/attributeType/listAllUseAttribute?${qs.stringify(params)}`,
  );
}
