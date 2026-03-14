// import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询打印模板
 */
export function getAllPrintTemplate() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/getAllPrintTemplate`,
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
