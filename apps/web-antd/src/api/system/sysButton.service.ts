// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取页面按钮
 */
export async function listButton(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/button/listButton?${qs.stringify(params)}`,
  );
}
/**
 * 新增页面按钮
 */
export async function insertWord(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/button/insertWord`,
    params,
  );
}
/**
 * 删除页面按钮
 */
export async function deleteButton(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/button/deleteButton`,
    {
      data: params,
    },
  );
}
/**
 * 编辑页面按钮
 */
export async function updateButton(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/button/updateButton`,
    params,
  );
}
