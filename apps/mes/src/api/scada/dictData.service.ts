// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询字典数据分页列表
 * @param query 查询参数
 */
export function queryScadaDictDataList(query: any) {
  return requestClient.get(`/system/dict/data/list?${qs.stringify(query)}`);
}

/**
 * 根据 dictCode 查询字典数据详情
 * @param dictCode 字典编码
 */
export function queryScadaDictDataById(dictCode: any) {
  return requestClient.get(`/system/dict/data/${dictCode}`);
}

/**
 * 根据字典类型查询字典数据集合
 * @param dictType 字典类型
 */
export function queryScadaDictsByType(dictType: any) {
  return requestClient.get(`/system/dict/data/type/${dictType}`);
}

/**
 * 新增字典数据
 * @param data 字典数据
 */
export function insertScadaDictData(data: any) {
  return requestClient.post('/system/dict/data', data);
}

/**
 * 更新字典数据
 * @param data 字典数据
 */
export function updateScadaDictData(data: any) {
  return requestClient.put('/system/dict/data', data);
}

/**
 * 删除字典数据
 * @param dictCode 字典编码
 */
export function deleteScadaDictData(dictCode: any) {
  return requestClient.delete(`/system/dict/data/${dictCode}`);
}
