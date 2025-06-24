// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询产品计划
 */
export async function worksheetSearch(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/search?${qs.stringify(params)}`,
  );
}
