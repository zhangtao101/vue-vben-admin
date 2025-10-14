// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询设备
 */
export async function queryEquipment(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/repair/queryList?${qs.stringify(params)}`,
  );
}

/**
 * 设备编号模糊查询
 * @param params
 */
export async function fuzzyQueryOfEquipmentNumber(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/fuzzyQueryByequipmentCode?${qs.stringify(params)}`,
  );
}
