// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询度量方法列表
 * @param query 查询参数
 */
export function queryMeasureMethod(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/measuremethod/queryList?${qs.stringify(query)}`,
  );
}

/**
 * 删除度量方法
 * @param id 记录ID
 */
export function deleteMeasureMethod(id: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/measuremethod/delete/${id}`,
  );
}

/**
 * 新增度量方法
 * @param data 表单数据
 */
export function insertMeasureMethod(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/measuremethod/save`,
    data,
  );
}

/**
 * 根据ID查询度量方法详情
 * @param id 记录ID
 */
export function queryMeasureMethodById(id: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/measuremethod/detail/${id}`,
  );
}

/**
 * 更新度量方法
 * @param data 表单数据
 */
export function updateMeasureMethod(data: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/measuremethod/update`,
    data,
  );
}
