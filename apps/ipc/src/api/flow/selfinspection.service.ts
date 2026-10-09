// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取不良缺陷列表
 * @param params 查询参数（defectCode 缺陷编码、defectName 缺陷名称、pageSize 每页条数、pageNum 页码）
 * @returns 不良缺陷分页数据
 * @since 2026-10-09 10:00:00
 */
export function getProductDefectList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/productdefect/query?${qs.stringify(params)}`,
  );
}

/**
 * 获取不良位置列表
 * @param params 查询参数（worksheetCode 工单编号、locationCode 位置编号）
 * @returns 不良位置列表
 * @since 2026-10-09 10:00:00
 */
export function getDefectLocationList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/planLocation/getLocationByWorksheetCode?${qs.stringify(params)}`,
  );
}

/**
 * 保存不良明细记录
 * @param data 不良记录数据（含 detailList 不良明细标记）
 * @returns 保存结果
 * @since 2026-10-09 10:00:00
 */
export function saveDiscoveryDefect(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/discoveryDefect/save`,
    data,
  );
}

/**
 * 根据工单获取不良列表记录
 * @param workSheetCode 工单号
 * @returns 不良列表记录
 * @since 2026-10-09 10:00:00
 */
export function getDiscoveryDefectListByWorksheetCode(workSheetCode: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/discoveryDefect/getListByWorkSheetCode/${workSheetCode}`,
  );
}

/**
 * 自检工步内容查询
 * @param params 查询参数（workstationCode 工作站编号、worksheetCode 工单号、bindingId 工作站绑定工序ID、functionId 工步ID）
 * @returns 自检工步内容（工单、产品、计划数、良品数、不良品数等）
 * @since 2026-10-09 10:00:00
 */
export function getSelfInspectionStepInfo(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listByDefect?${qs.stringify(params)}`,
  );
}
