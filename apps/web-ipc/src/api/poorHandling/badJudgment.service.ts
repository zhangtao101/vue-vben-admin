// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 获取不良任务列表
 * @param params 参数
 */
export function getNotFinishDefectList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/defect/getNotFinishDefectList?${qs.stringify(params)}`,
  );
}
/**
 * 根据页签获取获取待确认不良任务列表
 * @param params 参数
 */
export function getDefectListByType(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/defect/getDefectListByType?${qs.stringify(params)}`,
  );
}

/**
 * 不良任务判定
 * @param params 参数
 */
export function judgement(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/defect/defectJudge`,
    params,
  );
}

/**
 * 不良确认提交
 * @param params 参数
 */
export function defectConfirm(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/defect/defectConfirm`,
    params,
  );
}
