// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 工单获取列表
 * @param params 参数
 */
export function searchProduceWorkSheetList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/searchProduceWorkSheetList?${qs.stringify(params)}`,
  );
}

/**
 * 查询所有线别
 * @param params 参数
 */
export function getAllLine(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/list/all?${qs.stringify(params)}`,
  );
}

/**
 * 工单拆单
 * @param params 参数
 */
export function splitWorkSheet(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/splitWorkSheet`,
    params,
  );
}

/**
 * 工单合单
 * @param params 参数
 */
export function mergeWorkSheet(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/mergeWorkSheet`,
    params,
  );
}

/**
 * 获取产线维度产能核算信息
 * @param params 参数
 */
export function getLineProductCheck(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/getLineProductCheck?${qs.stringify(params)}`,
  );
}

/**
 * 2、获取工作中心已经派发未完工工单（即获取工作站已经派发未完工工单列表）
 * @param params 参数
 */
export function getWorksheetListByWorkstationCode(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/getWorksheetListByWorkstationCode?${qs.stringify(params)}`,
  );
}

/**
 * 作业站多选派发接口
 * @param params 参数
 */
export function sendListProduct(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/sendListProduct`,
    params,
  );
}

/**
 * 1、根据工作站获取设备列表
 * @param params 参数
 */
export function getAllEquipList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getAllEquipList?${qs.stringify(params)}`,
  );
}

/**
 * 派工校验
 * @param params 参数
 */
export function sendProduceCheck(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/sendProduceCheck?${qs.stringify(params)}`,
  );
}

/**
 * 派工
 * @param params 参数
 */
export function sendProduct(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/sendProduct`,
    params,
  );
}
/**
 * 获取入库工单查询
 * @param params 参数
 */
export function getWorksheetWarehouseList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/getWorksheetWarehouseList?${qs.stringify(params)}`,
  );
}
/**
 * 工单入库补录接口
 * @param params 参数
 */
export function finishWorksheetInOut(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/finishWorksheetInOut`,
    params,
  );
}
