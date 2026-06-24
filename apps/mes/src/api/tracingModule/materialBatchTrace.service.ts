// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 物料批次追溯 ==========

/**
 * 表格分页查询物料批次追溯列表
 * @param query 查询参数
 */
export async function getMaterialBatchDetailList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/trace/materialBatch/getDetailList?${qs.stringify(query)}`,
  );
}

// ========== 单条操作 ==========

/**
 * 根据ID查询送检详情
 * @param id 送检单ID
 */
export async function getMaterialBatchDetailById(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/detail/${id}`,
  );
}

// ========== 导出功能 ==========

/**
 * 导出物料批次追溯数据
 * @param query 查询参数
 */
export async function exportMaterialBatchList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/trace/materialBatch/exportPath?${qs.stringify(query)}`,
    { responseType: 'blob' },
  );
}
