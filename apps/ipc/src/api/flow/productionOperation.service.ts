// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 工作站列表获取
 */
export function workstationListAcquisition() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getAllWorkstations`,
  );
}
/**
 * 获取工序设备列表
 * @param params 参数
 */
export function obtainTheListOfProcessEquipment(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getAllEquipList?${qs.stringify(params)}`,
  );
}
/**
 * 获取用户列表
 * @param params 参数
 */
export function getUserList() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/listUserByWorkNumber?workNumber=`,
  );
}

/**
 * 用户上工
 * @param params 参数
 */
export function userUp(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/userUp`,
    params,
  );
}

/**
 * 用户下工
 * @param params 参数
 */
export function userDown(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/userDown`,
    params,
  );
}

/**
 * 一键下工
 * @param params 参数
 */
export function allClientUserDown(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/allClientUserDown`,
    params,
  );
}

/**
 * 工单操作
 * @param params 参数
 */
export function sheetWorking(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/sheetWorking`,
    params,
  );
}
/**
 * 人员上下工查看（获取当前设备在工人员上工记录）
 * @param params 参数
 */
export function listUserUpInfo(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/listUserUpInfo?${qs.stringify(params)}`,
  );
}
/**
 * 8、获取工作中心工艺路线
 * @param params 参数
 */
export function getSheetProces(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getSheetProces?${qs.stringify(params)}`,
  );
}
/**
 * 获取操作事项对应的明细内容
 * @param params 参数
 */
export function getOpFunctions(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getOpFunctions?${qs.stringify(params)}`,
  );
}
/**
 * 资源检核状态查询
 * @param params 参数
 */
export function queryOfResourceVerificationStatus(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listCheckInfo?${qs.stringify(params)}`,
  );
}
/**
 * 设备监控查询
 * @param params 参数
 */
export function equipmentMonitoringQuery(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listParam?${qs.stringify(params)}`,
  );
}

/**
 * 设备清洗信息
 * @param params 参数
 */
export function equipmentCleaningInformation(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listEquipClean?${qs.stringify(params)}`,
  );
}

/**
 * 工序进站信息查询
 * @param params 参数
 */
export function processEntryInformationQuery(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listProcessIn?${qs.stringify(params)}`,
  );
}

/**
 * 配方下发信息查询
 * @param params 参数
 */
export function queryOfFormulaDistributionInformation(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listParamSend?${qs.stringify(params)}`,
  );
}
/**
 * 配方下发
 * @param params 参数
 */
export function theFormulaHasBeenIssued(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/paramTempSend`,
    params,
  );
}
/**
 * 2、投料结束
 * @param params 参数
 */
export function endOfFeeding(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/finishFeed`,
    params,
  );
}
/**
 * 物料投料信息查询-分切
 * @param params 参数
 */
export function materialFeedingInformationQuerySlitting(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listFeed?${qs.stringify(params)}`,
  );
}
/**
 * 设备清空信息查询
 * @param params 参数
 */
export function deviceClearanceInformationQuery(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listEquipClear?${qs.stringify(params)}`,
  );
}
/**
 * 设备手动清空
 * @param params 参数
 */
export function manualClearanceOfTheEquipment(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/equipClear`,
    params,
  );
}
/**
 * 设备手动结束作业
 * @param params 参数
 */
export function theEquipmentManuallyFinishesTheOperation(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/equipClearFinish`,
    params,
  );
}

/**
 * 1、工序出站信息查询
 * @param params 参数
 */
export function processExitInformationQuery(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listProcessOut?${qs.stringify(params)}`,
  );
}

/**
 * 工序报工信息查询
 * @param params 参数
 */
export function processReportingInformationQuery(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listReport?${qs.stringify(params)}`,
  );
}
/**
 * 工序报工
 * @param params 参数
 */
export function processReporting(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/report`,
    params,
  );
}

/**
 * 设备手动清洁
 * @param params 参数
 */
export function manualCleaningOfTheEquipment(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/equipClean`,
    params,
  );
}
/**
 * 设备手动结束清洁
 * @param params 参数
 */
export function manuallyFinishTheCleaning(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/equipCleanFinish`,
    params,
  );
}
/**
 * 2、投料
 * @param params 参数
 */
export function feedingMaterials(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/feed`,
    params,
  );
}
/**
 * 3、单个物料投料完成
 * @param params 参数
 */
export function feedingComplete(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/feedClear`,
    params,
  );
}
/**
 * 人工绑码
 * @param params 参数
 */
export function snCodeBinding(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/snCodeBinding`,
    params,
  );
}
/**
 * 人工解绑条码
 * @param params 参数
 */
export function snCodeBindingCallBack(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/snCodeBindingCallBack`,
    params,
  );
}
/**
 * 扫码页面查询
 * @param params 参数
 */
export function listByCodeScan(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listByCodeScan?${qs.stringify(params)}`,
  );
}
/**
 * 绑码条码校验
 * @param params 参数
 */
export function checkCodeBinding(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/checkCodeBinding?${qs.stringify(params)}`,
  );
}
