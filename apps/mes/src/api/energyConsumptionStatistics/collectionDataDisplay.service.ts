// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取原始采集数据
 */
export async function obtainRawAcquisitionData(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/sync/getALL?${qs.stringify(params)}`,
  );
}
