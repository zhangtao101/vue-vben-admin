// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 物料获取
 */
export async function getMaterialCodeByJjcl() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/getMaterialCodeByJjcl`,
  );
}

/**
 * 物料获取
 */
export async function smkFeedCheck(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedCheck`,
    params,
  );
}
/**
 * 物料获取
 */
export async function pushAuditRecord(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/pushAuditRecord`,
    params,
  );
}

/**
 * 获取当前单号的最新信息
 */
export async function getAuditByRecord(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/getAuditByRecord?${qs.stringify(params)}`,
  );
}

/**
 * 加料内容获取(粉料新增)
 * @param materialCode 参数
 */
export async function getWarehouseByMaterialCode(materialCode: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/getWarehouseByMaterialCode?materialCode=${materialCode}`,
  );
}

/**
 * 加料内容获取(粉料新增)
 * @param equipCode 参数
 * @param worksheetCode 参数
 */
export async function getZFBomMaterialListByCode(
  equipCode: string,
  worksheetCode: string,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/getZFBomMaterialListByCode?equipCode=${equipCode}&worksheetCode=${worksheetCode}`,
  );
}

/**
 * 加料内容获取(粉料新增)
 * @param equipCode 参数
 * @param worksheetCode 参数
 */
export async function getBomMaterialListByCode(
  equipCode: string,
  worksheetCode: string,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/getBomMaterialListByCode?equipCode=${equipCode}&worksheetCode=${worksheetCode}`,
  );
}
