// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 报修单相关 ==========

/**
 * 查询报修单列表
 */
export async function getRepairRequestList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/list?${qs.stringify(params)}`,
  );
}

/**
 * 分页查询报修单列表
 */
export async function getRepairRequestPageList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 扩展查询报修单列表（支持更多筛选条件）
 */
export async function getRepairRequestListWithFilter(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/list-filter?${qs.stringify(params)}`,
  );
}

/**
 * 查询报修单详情
 */
export async function getRepairRequestById(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/${id}`,
  );
}

/**
 * 提交报修单
 */
export async function submitRepairRequest(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/submit`,
    params,
  );
}

/**
 * 取消报修单
 */
export async function cancelRepairRequest(requestId: any, params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/cancel?${qs.stringify({ requestId, ...params })}`,
  );
}

/**
 * 指派报修单给维修人员
 */
export async function assignRepairRequest(requestId: any, assignedTo: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/assign?${qs.stringify({ requestId, assignedTo })}`,
  );
}

/**
 * 维修人员自己领取任务（抢单模式）
 */
export async function selfAssignRepairRequest(requestId: any, repairBy: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/self-assign?${qs.stringify({ requestId, repairBy })}`,
  );
}

/**
 * 开始维修任务
 */
export async function startRepair(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/start`,
    params,
  );
}

/**
 * 完成维修任务
 */
export async function completeRepair(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/complete`,
    params,
  );
}

/**
 * 评价报修单
 */
export async function rateRepairRequest(
  id: any,
  rating: any,
  ratingContent?: any,
) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/rate/${id}?${qs.stringify({ rating, ratingContent })}`,
  );
}

// ========== 任务查询 ==========

/**
 * 查询我的任务列表
 */
export async function getMyRepairTasks(assignedTo: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/my-tasks?${qs.stringify({ assignedTo })}`,
  );
}

/**
 * 查询待执行任务列表
 */
export async function getPendingRepairTasks() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/pending`,
  );
}

/**
 * 查询可领取的任务列表
 */
export async function getAssignableRepairTasks() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/assignable`,
  );
}

/**
 * 按报修类型统计数量（接单大厅顶部统计）
 */
export async function getRepairStatisticsByType(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/statistics?${qs.stringify(params)}`,
  );
}

/**
 * 维修看板统计
 */
export async function getRepairDashboard() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/dashboard`,
  );
}

// ========== 维修记录 ==========

/**
 * 查询维修记录列表
 */
export async function getRepairRecordList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/record/list?${qs.stringify(params)}`,
  );
}

/**
 * 分页查询维修记录列表
 */
export async function getRepairRecordPageList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/record/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 查询维修记录详情
 */
export async function getRepairRecordById(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/record/${id}`,
  );
}

/**
 * 根据报修单ID查询维修记录
 */
export async function getRepairRecordByRequestId(requestId: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/record/by-request/${requestId}`,
  );
}

// ========== 停机相关 ==========

/**
 * 设置停机状态
 */
export async function setEquipmentDowntime(id: any, isDowntime: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/downtime/${id}?${qs.stringify({ isDowntime })}`,
  );
}

/**
 * 停机统计
 */
export async function getDowntimeStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/downtime/statistics?${qs.stringify(params)}`,
  );
}

/**
 * 评价统计
 */
export async function getRatingStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/rate/statistics?${qs.stringify(params)}`,
  );
}

/**
 * 查询报修单通知记录
 */
export async function getRepairNotifications(requestId: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/notification/${requestId}`,
  );
}

// ========== 流程配置 ==========

/**
 * 查询流程配置列表
 */
export async function getRepairConfigList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/config/list`,
  );
}

/**
 * 查询流程配置详情
 */
export async function getRepairConfigById(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/config/${id}`,
  );
}

/**
 * 查询当前启用的流程配置
 */
export async function getCurrentRepairConfig() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/config/current`,
  );
}

/**
 * 保存流程配置
 */
export async function saveRepairConfig(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/config/save`,
    params,
  );
}

/**
 * 启用流程配置
 */
export async function enableRepairConfig(id: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/config/enable/${id}`,
  );
}

/**
 * 审核流程配置
 */
export async function auditRepairConfig(id: any, auditBy: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/config/audit/${id}?${qs.stringify({ auditBy })}`,
  );
}

// ========== 通知配置 ==========

/**
 * 查询通知配置列表
 */
export async function getNotifyConfigList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/notify-config/list`,
  );
}

/**
 * 查询通知配置详情
 */
export async function getNotifyConfigById(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/notify-config/${id}`,
  );
}

/**
 * 查询当前启用的通知配置
 */
export async function getCurrentNotifyConfig() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/notify-config/current`,
  );
}

/**
 * 保存通知配置
 */
export async function saveNotifyConfig(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/notify-config/save`,
    params,
  );
}

/**
 * 启用通知配置
 */
export async function enableNotifyConfig(id: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/notify-config/enable/${id}`,
  );
}

/**
 * 审核通知配置
 */
export async function auditNotifyConfig(id: any, auditBy: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/notify-config/audit/${id}?${qs.stringify({ auditBy })}`,
  );
}
