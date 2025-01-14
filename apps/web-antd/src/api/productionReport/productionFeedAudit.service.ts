// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 待审核列表查询
 */
export async function listWaitAudit(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/listWaitAudit?${qs.stringify(params)}`,
  );
}
/**
 * 审核投料校验异常
 */
export async function auditMaterilCheck(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/auditMaterilCheck`,
    params,
  );
}
