// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询工序树
 */
export async function getProcessTree() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/tree`,
  );
}

/**
 * 查询工序列表
 */
export async function queryProcessTable(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/search?${qs.stringify(params)}`,
  );
}
