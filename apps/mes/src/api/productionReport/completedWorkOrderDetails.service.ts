// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 完工工单明细查看
 */
export async function getDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getDetail?${qs.stringify(params)}`,
  );
}

/**
 * 能耗明细查看
 */
export async function getNHDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getNHDetail?${qs.stringify(params)}`,
  );
}
/**
 * 能耗明细导出
 */
export async function getExcelPathNHDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getExcelPathNHDetail?${qs.stringify(params)}`,
  );
}
/**
 * 报工明细查看
 */
export async function getReportDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getReportDetail?${qs.stringify(params)}`,
  );
}
/**
 * 报工明细导出
 */
export async function getExcelPathReportDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getExcelPathReportDetail?${qs.stringify(params)}`,
  );
}
/**
 * 投料明细查看
 */
export async function getKLDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getKLDetail?${qs.stringify(params)}`,
  );
}
/**
 * 投料明细导出
 */
export async function getExcelPathKLDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getExcelPathKLDetail?${qs.stringify(params)}`,
  );
}
/**
 * 入库明细查看
 */
export async function getInStorageDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getInStorageDetail?${qs.stringify(params)}`,
  );
}
/**
 * 入库明细导出
 */
export async function getExcelInStorageDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getExcelInStorageDetail?${qs.stringify(params)}`,
  );
}
/**
 * 154、参数明细查看
 */
export async function getParamDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getParamDetail?${qs.stringify(params)}`,
  );
}
/**
 * 153、参数明细导出
 */
export async function getExcelParamDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getExcelParamDetail?${qs.stringify(params)}`,
  );
}
/**
 * 155、压机设备设置明细查看
 */
export async function getYJDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getYJDetail?${qs.stringify(params)}`,
  );
}
/**
 * 压机设备设置明细导出
 */
export async function getExcelYJDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/CompletedWorkOrder/getExcelYJDetail?${qs.stringify(params)}`,
  );
}
