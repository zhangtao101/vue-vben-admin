// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 获取未完成或者待执行的出入库单据列表
 * @param params 参数
 */
export function listTodoFormEnout(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/enout/optask/listTodoForm?${qs.stringify(params)}`,
  );
}

/**
 * 获取单据作业情况列表（查看详情）
 * @param params 参数
 */
export function getDetailByCodeEnout(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/enout/optask/getDetailByCode?${qs.stringify(params)}`,
  );
}

/**
 * 单据作业开始
 * @param params 参数
 */
export function formStartEnout(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/enout/optask/formStart`,
    params,
  );
}

/**
 * 获取允许入库的储位列表
 * @param params 参数
 */
export function getDetailInAreaCodeEnout(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/enout/optask/getDetailInAreaCode?${qs.stringify(params)}`,
  );
}
/**
 * 获取允许出库的储位列表
 * @param params 参数
 */
export function getDetailOutTaskEnout(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/enout/optask/getDetailOutTask?${qs.stringify(params)}`,
  );
}

/**
 * 出库单明细出库作业
 * @param params 参数
 */
export function detailOutTaskEnout(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/enout/optask/detailOutTask`,
    params,
  );
}
/**
 * 入库单明细入库作业
 * @param params 参数
 */
export function detailInTaskEnout(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/enout/optask/detailInTask`,
    params,
  );
}

/**
 * 出入库单据作业完成
 * @param params 参数
 */
export function formFinishEnout(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/enout/optask/formFinish`,
    params,
  );
}
