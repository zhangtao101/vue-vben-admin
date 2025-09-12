// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 用能损耗
 */
export async function dayEnergyLossList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/dayEnergyLossList?${qs.stringify(params)}`,
  );
}
