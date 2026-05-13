// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 响应类型定义 ==========

/** 处理人选项 */
export interface HandlerOptions {
  handlerUsers: Array<{ label: string; value: string }>;
}

/** 超时规则 */
export interface TimeoutRule {
  id?: number;
  stepId?: number;
  timeoutMinutes: number;
  timeoutHandlerUser: string;
  canComplete: boolean;
}

/** 规则配置 */
export interface RuleConfig {
  /**
   * 处理人员，处理人员编码
   */
  handlerUsers: string;
  /**
   * 能否关闭，true-当前步骤可完成并关闭任务，false-处理完成后继续流转到下一步骤
   */
  allowClose: boolean;
  /**
   * 超时规则列表
   */
  timeoutRules?: TimeoutRule[];
}

/** 流程步骤 */
export interface FlowStep {
  id?: number;
  flowConfigId?: number;
  /**
   * 配置编码，步骤的配置编码，手动输入
   */
  configCode?: string;
  configName?: string;
  stepOrder: number;
  stepName: string;
  equipmentGroup?: string;
  /**
   * 步骤列表
   */
  steps?: RuleConfig[];
  createdTime?: string;
  updatedTime?: string;
}

/** 保存流程配置请求参数 */
export interface SaveFlowConfigParams {
  id?: null | number;
  configName: string;
  configCode: string;
  equipmentGroup?: string;
  status?: string;
  remark?: null | string;
  steps?: FlowStep[];
  repairType?: null | string;
}

/** 流程配置列表项 */
export interface FlowConfigListItem {
  id: number;
  configName: string;
  configCode: string;
  equipmentGroup: string;
  status: string;
  stepCount: number;
  noticeRuleCount?: number;
  remark?: null | string;
}

/** 流程配置详情 */
export interface FlowConfigDetail {
  id: number;
  configName: string;
  configCode: string;
  equipmentGroup: string;
  repairType?: null | string;
  status: string;
  remark?: null | string;
  auditBy?: null | string;
  auditTime?: null | string;
  createdBy?: null | string;
  createdTime?: string;
  updatedTime?: string;
  steps?: FlowStep[];
}

// ========== 接口定义 ==========

/**
 * 获取处理人下拉选项
 */
export async function getHandlerOptions() {
  return requestClient.get<HandlerOptions>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/flow-config/handler-options`,
  );
}

/**
 * 保存维修流程配置
 */
export async function saveFlowConfig(params: SaveFlowConfigParams) {
  return requestClient.post<FlowConfigDetail>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/flow-config/save`,
    params,
  );
}

/**
 * 启用流程配置
 */
export async function enableFlowConfig(id: number) {
  return requestClient.post<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/flow-config/enable/${id}`,
  );
}

/**
 * 停用流程配置
 */
export async function disableFlowConfig(id: number) {
  return requestClient.post<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/flow-config/disable/${id}`,
  );
}

/**
 * 获取流程配置详情
 */
export async function getFlowConfigById(id: number) {
  return requestClient.get<FlowConfigDetail>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/flow-config/${id}`,
  );
}

/**
 * 删除流程配置
 */
export async function deleteFlowConfig(id: number) {
  return requestClient.delete<{ code: number; msg: string }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/flow-config/${id}`,
  );
}

/**
 * 查询流程配置列表
 */
export async function getFlowConfigList(params: {
  configName?: string;
  equipmentGroup?: string;
  status?: string;
}) {
  return requestClient.get<FlowConfigListItem[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/flow-config/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询当前启用流程配置
 */
export async function getCurrentFlowConfig() {
  return requestClient.get<FlowConfigListItem[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/flow-config/current`,
  );
}
