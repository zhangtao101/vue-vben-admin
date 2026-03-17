// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 类别表格加载
 */
export function queryMaterialTypeList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialType/list/search?${qs.stringify(params)}`,
  );
}
