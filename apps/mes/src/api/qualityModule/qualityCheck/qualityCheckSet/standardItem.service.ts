// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询质检标准列表
 * @param query 查询参数
 */
export function queryQualityCheckItemStandard(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcItem/getStandard?${qs.stringify(query)}`,
  );
}

/**
 * 删除质检标准
 * @param id 记录ID
 */
export function deleteQualityCheckStandard(id: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcStandard/delete/${id}`,
  );
}

/**
 * 新增质检标准
 * @param data 表单数据
 */
export function insertQualityCheckStandard(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcStandard/save`,
    data,
  );
}

/**
 * 根据ID查询质检标准详情
 * @param id 记录ID
 */
export function queryQualityCheckStandardById(id: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcStandard/detail/${id}`,
  );
}

/**
 * 更新质检标准
 * @param data 表单数据
 */
export function updateQualityCheckStandard(data: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcStandard/update`,
    data,
  );
}

/**
 * 导出质检项目列表
 * @param query 查询参数
 */
export function exportQualityCheckItem(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcItem/export?${qs.stringify(query)}`,
  );
}
