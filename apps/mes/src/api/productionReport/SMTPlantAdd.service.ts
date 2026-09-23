// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 本日计划与完成情况 表格加载
 */
export async function fetchList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/searchWorkSheetDayFinishSituation?${qs.stringify(params)}`,
  );
}

/**
 * 本日计划与完成情况 导出
 */
export async function exportList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/searchWorkSheetDayFinishSituationPath?${qs.stringify(params)}`,
  );
}

/**
 * 新增信息
 */
export async function createArticle(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/insertWorkReport`,
    data,
  );
}

/**
 * 读码报工的明细
 */
export async function fetParams(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/getQrcodeDetailsByWorkCode`,
    data,
  );
}

/**
 * 人工报工明细
 */
export async function fetchDetailByName(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/getDetailsByParams?${qs.stringify(params)}`,
  );
}

/**
 * 根据产品名称导出报工明细
 */
export async function exportDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/excelPathInPersonReport?${qs.stringify(params)}`,
  );
}

/**
 * 查询工单
 */
export async function fetchWorkorder(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/search/reportRecord?${qs.stringify(params)}`,
  );
}

/**
 * 查询车间下的工序
 */
export async function fetchProcessByWorkshop(workshop: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/list/line/${workshop}`,
  );
}

/**
 * 报表筛选使用的工作站下拉项
 */
export interface WorkstationDropdownItem {
  /** 审核状态 */
  auditState: number;
  /** 审核时间 */
  auditTime: null | string;
  /** 审核人 */
  auditUser: null | string;
  /** 审核状态名称 */
  auditStateName: null | string;
  /** 绑定明细 */
  bindingdtos: any | null;
  /** 创建时间 */
  createTime: string;
  /** 创建人 */
  createUser: string;
  /** 编号ID */
  id: number;
  /** 修改时间 */
  modifyTime: string;
  /** 修改人 */
  modifyUser: string;
  /** 状态 1启用 2停用 3废弃 */
  state: number;
  /** 工作站类型名称 */
  stationTypeName: null | string;
  /** 工作站编号 */
  workstationCode: string;
  /** 工作站IP地址 */
  workstationIp: null | string;
  /** 工作站名称 */
  workstationName: string;
  /** 工作站类型 1工段工作站 2工序工作站 */
  workstationType: number;
}

/**
 * 工作站下的工序下拉项
 */
export interface WorkstationProcessItem {
  /** 工序ID */
  bindingId: number;
  /** 成本中心 */
  costCenterCode: string;
  /** 明细 */
  details: any | null;
  /** 设备编码列表 */
  equipCodeList: any | null;
  /** 编号ID */
  id: number;
  /** 序号 */
  orderNo: number;
  /** 工序编号 */
  processCode: string;
  /** 工序名称 */
  processName: string;
  /** 工作站ID */
  workstationCode: string;
}

/**
 * 获取报表筛选使用的工作站下拉列表
 *
 * @returns 工作站下拉列表数据
 * @since 2026-09-20
 */
export async function fetchWorkstationDropdownList() {
  return requestClient.get<WorkstationDropdownItem[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/dropdownList`,
  );
}

/**
 * 根据工作站编号查询工序下拉列表
 *
 * @param workstationCode 工作站编号
 * @returns 工序下拉列表数据
 * @since 2026-09-20
 */
export async function fetchProcessByWorkstation(workstationCode: string) {
  return requestClient.get<WorkstationProcessItem[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/processList?${qs.stringify({ workstationCode })}`,
  );
}

/**
 * 查询工序下对应的产线
 */
export async function fetchLineById(processId: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/list/process/${processId}`,
  );
}
