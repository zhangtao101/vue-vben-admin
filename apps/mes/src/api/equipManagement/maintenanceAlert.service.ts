/**
 * [INPUT]: 依赖 requestClient、qs API
 * [OUTPUT]: 对外提供模具保养预警相关 API 函数和类型定义
 * [POS]: 设备管理模块 的模具保养预警服务层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-21 10:15:00
 */

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 预警类型枚举 */
export type AlertType =
  | 'ADVANCE'
  | 'BLOCK'
  | 'MAINTENANCE_DUE'
  | 'USAGE_COUNT'
  | 'USAGE_TIME';

/** 处理方式枚举 */
export type HandleResult = 'IGNORE' | 'MAINTENANCE';

/** 保养预警记录（列表/详情） */
export interface MaintenanceAlertRecord {
  /** 提醒ID */
  id: number;
  /** 模具ID */
  moldId: number;
  /** 模具编码 */
  moldCode: string;
  /** 模具名称 */
  moldName: string;
  /** 预警类型编码 */
  alertType: string;
  /** 预警类型名称 */
  alertTypeName?: string;
  /** 预警原因 */
  alertReason: string;
  /** 预警时间 */
  alertTime: string;
  /** 是否已处理，0-未处理，1-已处理 */
  isHandled: number;
  /** 处理方式 */
  handleResult: null | string;
  /** 处理说明 */
  handleRemark: null | string;
  /** 处理人 */
  handledBy: null | string;
  /** 处理时间 */
  handledTime: null | string;
  /** 处理状态名称 */
  handleStatusName: string;
}

/** 保养预警查询参数 */
export interface MaintenanceAlertParams {
  /** 预警类型筛选，推荐传 WARNING 或 BLOCK；不传表示全部 */
  alertType?: string;
  /** 处理状态，0-未处理，1-已处理；不传表示全部 */
  isHandled?: number;
  /** 关键字，匹配模具编码或模具名称 */
  keyword?: string;
}

/** 保养预警分页查询参数 */
export interface MaintenanceAlertPageParams extends MaintenanceAlertParams {
  /** 模具编码/名称，模糊匹配 */
  keyword?: string;
  /** 预警类型编码 */
  alertType?: string;
  /** 预警时间开始，格式 yyyy-MM-dd */
  startTime?: string;
  /** 预警时间结束，格式 yyyy-MM-dd */
  endTime?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 保养预警处理请求参数 */
export interface MaintenanceAlertHandleParams {
  /** 提醒ID */
  id: number;
  /** 处理方式，推荐传 MAINTENANCE 或 IGNORE */
  handleResult: HandleResult;
  /** 处理说明 */
  handleRemark?: string;
  /** 处理人 */
  handledBy?: string;
}

/** 保养预警分页响应 */
export interface MaintenanceAlertPageResult {
  results: MaintenanceAlertRecord[];
}

// ========== 接口定义 ==========

/**
 * 查询保养预警列表（不分页）
 * @param params - 查询参数，包含预警类型、处理状态、关键字等筛选条件
 * @returns 保养预警列表数据
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function getMaintenanceAlertList(params?: MaintenanceAlertParams) {
  return requestClient.get<{
    code: number;
    data: MaintenanceAlertRecord[];
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/alert/list?${qs.stringify(
      params || {},
    )}`,
  );
}

/**
 * 分页查询模具保养预警列表
 * @param params - 分页查询参数，包含分页信息、筛选条件等
 * @returns 保养预警分页列表，包含结果集和总数
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function getMaintenanceAlertPage(
  params: MaintenanceAlertPageParams,
) {
  return requestClient.get<{
    code: number;
    data: MaintenanceAlertPageResult;
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/alert/list-page?${qs.stringify(
      params,
    )}`,
  );
}

/**
 * 查询保养预警详情
 * @param id - 提醒ID，用于获取指定预警的完整信息
 * @returns 保养预警详情数据
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function getMaintenanceAlertDetail(id: number) {
  return requestClient.get<{
    code: number;
    data: MaintenanceAlertRecord;
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/alert/detail?${qs.stringify(
      { id },
    )}`,
  );
}

/**
 * 处理保养预警
 * @param params - 处理参数，包含预警ID、处理方式和说明
 * @returns 处理后的保养预警记录
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function handleMaintenanceAlert(
  params: MaintenanceAlertHandleParams,
) {
  return requestClient.post<{
    code: number;
    data: MaintenanceAlertRecord;
    msg: string;
  }>(`${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/alert/handle`, params);
}
