// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获获取用能警告
 */
export async function getAnEnergyWarning(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/equipment/warning/selectEquipmentWaring?${qs.stringify(params)}`,
  );
}
/**
 * 用能警告配置
 */
export async function useTheEnergyWarningConfiguration(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/equipment/warning/editEquipmentWaring`,
    params,
  );
}

/**
 * 仪表类型查询
 */
export async function meterTypeQuery() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/equipment/warning/selectEquipmentType`,
  );
}
