// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * BOM类别树
 */
export function getBomTypeTree() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/bomtype/getTree`,
  );
}

/**
 * BOM类别查询
 */
export function getBomTypeList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/bomtype/queryList?${qs.stringify(params)}`,
  );
}
