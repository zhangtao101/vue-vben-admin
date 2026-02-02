// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 箱码库存明细查询
 * @param params 参数
 */
export function getStorageDetailByCode(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}//human/packing/getStorageDetailByCode?${qs.stringify(params)}`,
  );
}
