// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * SMTwork 车间工单查询 - 表格列表接口
 */
export async function spWorkList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/searchWorkSheetFinishSituation?${qs.stringify(params)}`,
  );
}

/**
 * SMTwork 车间工单查询 - 表格导出
 */
export async function workLiExect(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/searchWorkSheetFinishSituationPath?${qs.stringify(params)}`,
  );
}

/**
 * 点击工单编号 - 人工报工明细
 */
export async function detail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/getDetailsByWorkCode?${qs.stringify(params)}`,
  );
}

/**
 * 报工明细导出
 */
export async function detailExect(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/excelPathInWriteBack?${qs.stringify(params)}`,
  );
}

/**
 * 生产日历接口
 */
export async function detaiCalender(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/factoryMonthEnactment/getFactoryMonth`,
    { params },
  );
}
