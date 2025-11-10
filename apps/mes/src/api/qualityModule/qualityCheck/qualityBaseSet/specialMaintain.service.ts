// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询特殊特性设置
 */
export async function querySpecialCharacter(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/specialCharacter/query?${qs.stringify(params)}`,
  );
}

/**
 * 删除特殊特性设置
 * @param params
 */
export function deleteSpecialCharacter(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/specialCharacter/delete/${params}`,
  );
}
/**
 * 根据ID查询不良代码设置
 * @param params
 */
export function querySpecialCharacterById(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/specialCharacter/detail/${params}`,
  );
}

/**
 * 新增特殊特性设置
 * @param params
 */
export function insertSpecialCharacter(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/specialCharacter/save`,
    params,
  );
}

/**
 * 更新特殊特性设置
 * @param params
 */
export function updateSpecialCharacter(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/specialCharacter/update`,
    params,
  );
}
