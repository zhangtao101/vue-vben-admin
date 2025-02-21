// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 查询生产日报
 */
export async function queryProductionDaily(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getReportDayStatistics?${qs.stringify(params)}`,
  );
}
