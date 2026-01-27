// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 查看当前箱码错误日志
 * @param params 参数
 */
export function logGetErrorDetail(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/api/robot/log/getErrorDetail?${qs.stringify(params)}`,
  );
}
/**
 * 任务号覆盖
 * @param params 参数
 */
export function logUpdateTaskCode(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/api/robot/log/updateTaskCode?${qs.stringify(params)}`,
  );
}

/**
 * 传输线清空复位
 * @param params 参数
 */
export function logClearCallBack(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/api/robot/log/clearCallBack?${qs.stringify(params)}`,
  );
}
