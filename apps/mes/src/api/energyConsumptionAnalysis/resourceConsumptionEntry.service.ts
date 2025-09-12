import { requestClient } from '#/api/request';

/**
 * 用水/气录入
 */
export async function energyInsert(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/EnergyInsert/insert`,
    params,
  );
}
