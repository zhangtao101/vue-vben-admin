// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询打印模板
 * @param printCode 打印模板编号，可选，模糊查询
 * @param printState 打印状态，可选，精确查询
 */
export function getAllPrintTemplate(printCode?: string, printState?: number) {
  const params: Record<string, number | string> = {};
  // 模板编号模糊查询（空值不传）
  if (printCode) {
    params.printCode = printCode;
  }
  // 打印状态精确查询（未选择不传）
  if (printState !== undefined && printState !== null) {
    params.printState = printState;
  }
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/getAllPrintTemplate?${qs.stringify(params)}`,
  );
}
/**
 * 保存打印模板
 */
export function savePrintTemplate(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/printTemplateSave`,
    params,
  );
}
/**
 * 查询打印模板详细
 */
export function queryPrintTemplateDetails(printCode: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/getPrintTemplate?printCode=${printCode}`,
  );
}
