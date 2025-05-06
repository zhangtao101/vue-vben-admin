// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询设备
 */
export async function queryEquipList(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/getEquipmentLedgerDTOByParams?${qs.stringify(params)}`,
    {
      assets: '',
    },
  );
}
