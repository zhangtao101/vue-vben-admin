// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 设备批次追溯 ==========

/**
 * 表格分页查询设备批次追溯列表
 * @param query 查询参数
 */
export async function getEquipBatchDetailList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/trace/equipBatch/getDetailList?${qs.stringify(query)}`,
  );
}

// ========== 导出功能 ==========

/**
 * 导出设备批次追溯数据
 * @param query 查询参数
 */
export async function exportEquipBatchList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/trace/equipBatch/exportPath?${qs.stringify(query)}`,
    { responseType: 'blob' },
  );
}

// ========== 下拉选项 ==========

/**
 * 根据车间获取对应工序列表（测控点设置中维护的设备名称与编码）
 * @param workshop 车间代码
 */
export async function getProcessCodeAndName(workshop: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/checkPoint/getProcessCodeAndName/${workshop}`,
  );
}

/**
 * 根据工序编码获取设备名称列表（测控点设置中维护的设备）
 * @param code 工序编码
 */
export async function getEquipNameAndCode(code: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/checkPoint/getEquipNameAndCode/${code}`,
  );
}
