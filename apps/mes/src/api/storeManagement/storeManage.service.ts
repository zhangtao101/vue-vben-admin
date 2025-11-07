// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询逻辑仓库
 * @param params
 */
export function queryLogicalWarehouse(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/logicalWarehouse/search?${qs.stringify(params)}`,
  );
}
