/**
 * [INPUT]: 依赖 requestClient、qs、repairRequest.service、notification.service API
 * [OUTPUT]: 对外提供维修任务相关 API 函数和类型定义
 * [POS]: 设备管理模块 的维修任务服务层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-15 12:37:00
 */

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 响应类型定义 ==========

/** 维修任务列表项 */
export interface RepairTaskListItem {
  id: number;
  repairNo: string;
  requestNo: string;
  equipmentCode: string;
  equipmentName: string;
  reportBy?: string;
  repairBy?: string;
  repairType: string;
  urgentLevel: string;
  status: string;
  reportTime: string;
}

/** 维修任务分页列表响应 */
export interface RepairTaskPageResponse {
  results: RepairTaskListItem[];
  total?: number;
  count?: number;
}

/** 维修任务详情 */
export interface RepairTaskDetail {
  id: number;
  repairNo: string;
  requestNo: string;
  equipmentCode: string;
  equipmentName: string;
  reportBy?: string;
  repairBy?: string;
  repairType?: string;
  urgentLevel: string;
  status: string;
  faultName?: string;
  faultCode?: string;
  repairContent?: string;
  repairStartTime?: string;
  repairEndTime?: string;
  repairResult?: string;
  repairParts?: string;
  faultRootCause?: string;
  repairMeasureCode?: string;
  repairMeasureName?: string;
  hasReplacedParts?: boolean;
  responseDuration?: number;
  repairDuration?: number;
  pauseDuration?: number;
  requestId?: number;
}

/** 可领取任务项 */
export interface AssignableTaskItem {
  id: number;
  requestNo: string;
  equipmentCode: string;
  equipmentName: string;
  repairType: string;
  urgentLevel: string;
  repairContent: string;
}

/** 报修关联维修任务项 */
export interface TaskByRequestItem {
  id: number;
  repairNo: string;
  repairBy?: string;
  status: string;
  repairResult?: string;
  repairStartTime?: string;
  repairEndTime?: string;
}

/** 维修过程记录项 */
export interface ProcessRecordItem {
  id: number;
  actionType: string;
  operator: string;
  actionTime: string;
  remark?: string;
  beforeStatus: string;
  afterStatus: string;
}

/** 过程记录详情 - 转派明细 */
export interface TransferDetailData {
  fromUser?: string;
  toUser?: string;
  transferReason?: string;
  transferRemark?: string;
}

/** 过程记录详情 - 维修填报明细 */
export interface ReportDetailData {
  repairResult?: string;
  hasReplacedParts?: boolean;
  rootCauseCategory?: string;
  rootCauseDetail?: string;
  repairMethod?: string;
  repairContent?: string;
  replacedParts?: string;
}

/** 过程记录详情 */
export interface ProcessRecordDetail {
  id: number;
  actionType: string;
  operator: string;
  actionTime: string;
  remark?: string;
  beforeStatus: string;
  afterStatus: string;
  detailData?: ReportDetailData | TransferDetailData;
}

/** 维修任务列表查询参数 */
export interface RepairTaskListParams {
  equipmentCode?: string;
  status?: string;
  pageNum: number;
  pageSize: number;
}

/** 我的维修任务查询参数 */
export interface MyTaskParams {
  status?: string;
  equipmentCode?: string;
  requestNo?: string;
  pageNum: number;
  pageSize: number;
}

/** 暂停维修请求参数 */
export interface PauseTaskParams {
  taskId: number;
  pauseReason: string;
  expectedResumeTime?: string;
  remark?: string;
}

/** 转交维修请求参数 */
export interface TransferTaskParams {
  taskId: number;
  transferTo: string;
  transferReason: string;
  remark?: string;
}

/** 维修填报请求参数 */
export interface ReportTaskParams {
  taskId: number;
  repairResult: string;
  hasReplacedParts?: boolean;
  replacedParts?: string;
  rootCauseCategory?: string;
  rootCauseDetail?: string;
  repairMethod?: string;
  repairContent: string;
  repairStartTime?: string;
  repairEndTime?: string;
}

// ========== 接口定义 ==========

/**
 * 分页查询维修任务列表
 * @param params 查询参数
 * @returns 维修任务分页列表
 */
export async function getRepairTaskPageList(params: RepairTaskListParams) {
  return requestClient.get<RepairTaskPageResponse>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 查询可领取/可指派任务
 * @returns 可领取任务列表
 */
export async function getAssignableTasks() {
  return requestClient.get<AssignableTaskItem[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/assignable`,
  );
}

/**
 * 领取维修任务
 * @param taskId 维修任务ID
 */
export async function claimRepairTask(taskId: number) {
  return requestClient.post<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/claim?${qs.stringify({ taskId })}`,
  );
}

/**
 * 指派维修任务
 * @param taskId 维修任务ID
 * @param assignedTo 指派维修人
 */
export async function assignRepairTask(taskId: number, assignedTo: string) {
  return requestClient.post<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/assign?${qs.stringify(
      {
        taskId,
        assignedTo,
      },
    )}`,
  );
}

/**
 * 暂停维修任务
 * @param params 暂停维修请求参数
 */
export async function pauseRepairTask(params: PauseTaskParams) {
  return requestClient.post<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/pause`,
    params,
  );
}

/**
 * 恢复维修任务
 * @param taskId 维修任务ID
 * @param resumeRemark 恢复说明
 */
export async function resumeRepairTask(taskId: number, resumeRemark?: string) {
  return requestClient.post<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/resume?${qs.stringify(
      {
        taskId,
        resumeRemark,
      },
    )}`,
  );
}

/**
 * 转交维修任务
 * @param params 转交维修请求参数
 */
export async function transferRepairTask(params: TransferTaskParams) {
  return requestClient.post<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/transfer`,
    params,
  );
}

/**
 * 提交维修填报
 * @param params 维修填报请求参数
 */
export async function reportRepairTask(params: ReportTaskParams) {
  return requestClient.post<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/report`,
    params,
  );
}

/**
 * 获取维修任务详情
 * @param id 维修任务ID
 * @returns 维修任务详情
 */
export async function getRepairTaskById(id: number) {
  return requestClient.get<RepairTaskDetail>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/${id}`,
  );
}

/**
 * 查询我的维修任务
 * @param params 查询参数
 * @returns 维修任务分页列表
 */
export async function getMyRepairTasks(params: MyTaskParams) {
  return requestClient.get<RepairTaskPageResponse>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/my-tasks?${qs.stringify(params)}`,
  );
}

/**
 * 按报修单查询维修任务
 * @param requestId 报修单ID
 * @returns 维修任务列表
 */
export async function getRepairTasksByRequest(requestId: number) {
  return requestClient.get<TaskByRequestItem[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/by-request/${requestId}`,
  );
}

/**
 * 按维修任务查询过程记录
 * @param taskId 维修任务ID
 * @returns 过程记录列表
 */
export async function getProcessRecordsByTask(taskId: number) {
  return requestClient.get<ProcessRecordItem[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/process-record/by-task/${taskId}`,
  );
}

/**
 * 查询过程记录详情
 * @param id 过程记录ID
 * @returns 过程记录详情
 */
export async function getProcessRecordById(id: number) {
  return requestClient.get<ProcessRecordDetail>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/process-record/${id}`,
  );
}

// ========== 可指派用户相关 ==========

/** 可指派/转派用户项 */
export interface AssignableUserItem {
  value: string;
  label: string;
}

/**
 * 获取可指派/转派的维修人员列表
 * @param taskId 维修任务ID
 * @param excludeSelf 是否排除当前登录用户（指派时不传或传false，转派时传true）
 * @returns 可指派/转派的维修人员列表
 */
export async function getAssignableUsers(
  taskId: number,
  excludeSelf?: boolean,
) {
  const params =
    excludeSelf === undefined ? '' : `?${qs.stringify({ excludeSelf })}`;
  return requestClient.get<AssignableUserItem[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/task/assignable-users/${taskId}?${params}`,
  );
}
