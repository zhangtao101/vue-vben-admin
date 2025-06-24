// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询产品计划
 */
export async function producePlanSearch(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/producePlan/search?${qs.stringify(params)}`,
  );
}
/**
 * 导出产品计划
 */
export async function producePlanExport(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/producePlan/export?${qs.stringify(params)}`,
  );
}
/**
 * 下载产品计划导入模板
 */
export async function downloadTemplateProducePlan() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/producePlan/downloadTemplate`,
  );
}
/**
 * 删除产品计划
 */
export async function producePlanDelete(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/producePlan/delete/${params}`,
  );
}

/**
 * 修改产品计划
 */
export async function producePlanUpdate(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/producePlan/update`,
    params,
  );
}
