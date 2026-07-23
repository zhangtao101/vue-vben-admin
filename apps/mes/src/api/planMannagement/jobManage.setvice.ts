// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * JOB单据列表获取（分页）
 * @param {object} params - 查询参数
 * @param {number} [params.pageNum] - 页码
 * @param {number} [params.pageSize] - 每页展示条数
 * @param {string} [params.productCode] - 产品编号
 * @param {string} [params.productName] - 产品名称
 * @param {string} [params.JobCode] - JOB单号
 * @since 2026-07-23
 */
export async function planJobInfoPage(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/planJobInfo/page?${qs.stringify(params)}`,
  );
}

/**
 * 查看Job绑定的PO-SO单据清单
 * @param {object} params - 查询参数
 * @param {string} [params.jobCode] - JOB单单号
 * @since 2026-07-23
 */
export async function planJobInfoDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/planJobInfo/detail?${qs.stringify(params)}`,
  );
}

/**
 * JOB单拆分生成WorkSheet工单
 * @param {object} params - 参数
 * @param {string} [params.jobCode] - JOB单单号
 * @since 2026-07-23
 */
export async function planJobInfoSplit(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/planJobInfo/split?${qs.stringify(params)}`,
  );
}

/**
 * 查询工单列表（冲切、折弯、焊铆）
 * @param {object} params - 查询参数
 * @param {number} params.processType - 冲切99 / 折弯98 / 焊铆97
 * @param {string} [params.workSheetCode] - 工单号
 * @param {string} [params.planDateStart] - 计划开始日期 (yyyy-MM-dd)
 * @param {string} [params.planDateEnd] - 计划结束日期 (yyyy-MM-dd)
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {number} [params.isAsc] - 1默认倒叙排列
 * @since 2026-07-23
 */
export async function planWorksheetSearch(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/search?${qs.stringify(params)}`,
  );
}

/**
 * 工单解绑
 * @param {object} params - 参数
 * @param {string} [params.worksheetCode] - 工单号
 * @since 2026-07-23
 */
export async function mergeWorksheetUnbinding(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/merge/worksheet/unbinding?${qs.stringify(params)}`,
  );
}

/**
 * 根据工单列表获取对应的明细清单（PO/SO）
 * @param {object} params - 参数
 * @param {string[]} params.worksheetCodes - 工单号列表
 * @since 2026-07-23
 */
export async function mergeWorksheetListPoOrderByWorksheetCode(params: any) {
  const query = {
    ...params,
    worksheetCodes: Array.isArray(params.worksheetCodes)
      ? params.worksheetCodes.join(',')
      : params.worksheetCodes,
  };
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/merge/worksheet/listPoOrderByWorksheetCode?${qs.stringify(query)}`,
  );
}

/**
 * 拆单重组保存
 * @param {object[]} params - 参数（数组，每项含 choseDetails 与 processType）
 * @since 2026-07-23
 */
export async function mergeWorkSheet(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/merge/worksheet/mergeWorkSheet`,
    params,
  );
}
