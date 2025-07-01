// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// 查询类型
export type queryWorksheetStateType = {
  // 结束时间
  endTime?: string;
  // 页码
  pageNum: number;
  // 每页展示条数
  pageSize: number;
  // 产品编号
  productCode?: string;
  // 产品名称
  productName?: string;
  // 开始时间
  startTime?: string;
  // 工单号
  worksheetCode?: string;
  /**
   *  类型
   *  1（制浆制粉制色）
   *  2成型
   *  3窑炉（卧干、烧成）
   *  4制釉
   *  5施釉
   *  6抛光（抛光、打包、复选）
   */
  workstationType: number;
};

/**
 *查询工单列表
 */
export async function queryWorksheetState(params: queryWorksheetStateType) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/listWorksheetState?${qs.stringify(params)}`,
  );
}

/**
 *查询工单列表
 */
export async function listByParam(params: queryWorksheetStateType) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/log/listByParam?${qs.stringify(params)}`,
  );
}

/**
 * 解除锁定
 */
export async function unLockByWorksheetCode(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/log/unLockByWorksheetCode`,
    params,
  );
}
