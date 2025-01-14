// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询人员
 */
export async function listSysPerson(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/person/listSysPerson?${qs.stringify(params)}`,
  );
}
/**
 * 删除人员
 */
export async function delSysPerson(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/person/sysPerson/${id}`,
  );
}
/**
 * 新增人员
 */
export async function addSysPerson(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/person/sysPerson`,
    params,
  );
}
/**
 * 修改人员
 */
export async function updateSysPerson(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/person/sysPerson`,
    params,
  );
}

/**
 * 查看详情
 */
export async function querySysPersonDetails(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/person/sysPerson/${id}`,
  );
}
/**
 * 工号查重
 */
export async function workNumberCheck(workNumber: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/person/${workNumber}`,
  );
}
