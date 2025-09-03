// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 用能分区列表查询
 */
export async function getEnergyZoningList(queryParams: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/getEnergyZoningList?${qs.stringify(queryParams)}`,
  );
}
