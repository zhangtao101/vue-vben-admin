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
/**
 * 加料内容获取(粉料新增)
 * @param equipCode 参数
 * @param worksheetCode 参数
 */
export async function getBtlBomMaterialListByCode(
  equipCode: string,
  worksheetCode: string,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/getBtlBomMaterialListByCode?equipCode=${equipCode}&worksheetCode=${worksheetCode}`,
  );
}

/**
 * 投料-制浆
 */
export async function smkFeedSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedSave`,
    params,
  );
}

/**
 * 投料-制粉
 * @param params 参数
 */
export function smkFeedZFSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedZFSave`,
    params,
  );
}
/**
 * 投料-制色
 * @param params 参数
 */
export function smkFeedZSSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedZSSave`,
    params,
  );
}
/**
 * 投料-制釉
 * @param params 参数
 */
export function smkFeedZYSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedZYSave`,
    params,
  );
}
/**
 * 投料-复选
 * @param params 参数
 */
export function smkFeedFXSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedFXSave`,
    params,
  );
}
/**
 * 投料-成型
 * @param params 参数
 */
export function smkCXFeedSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkCXFeedSave`,
    params,
  );
}
/**
 * 投料-抛光
 * @param params 参数
 */
export function smkFeedPGSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedPGSave`,
    params,
  );
}
/**
 * 投料-施釉
 * @param params 参数
 */
export function smkFeedSYSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedSYSave`,
    params,
  );
}
/**
 * 投料-打包
 * @param params 参数
 */
export function smkFeedDBSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedDBSave`,
    params,
  );
}
/**
 * 杂收
 * @param params 参数
 */
export function smkFeedZs(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/feed/smkFeedZs`,
    params,
  );
}
