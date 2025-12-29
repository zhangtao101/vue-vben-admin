// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询单个产品能耗
 */
export async function queryTheEnergyConsumptionOfASingleProduct(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/consumption/list?${qs.stringify(params)}`,
  );
}
