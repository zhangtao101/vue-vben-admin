/**
 * [INPUT]: 依赖 requestClient API
 * [OUTPUT]: 对外提供报修通知相关 API 函数和类型定义
 * [POS]: 设备管理模块 的通知服务层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-15 12:37:00
 */

import { requestClient } from '#/api/request';

// ========== 响应类型定义 ==========

/** 通知渠道选项 */
export interface NotifyChannelOption {
  label: string;
  value: string;
}

/** 通知记录项 */
export interface NotificationRecordItem {
  notifyType: string;
  notifyChannel: string;
  notifyUserNames: string;
  status: string;
  sendTime: string;
  failReason?: string;
}

// ========== 接口定义 ==========

/**
 * 获取通知渠道下拉选项
 * @returns 通知渠道选项列表
 */
export async function getNotifyChannels() {
  return requestClient.get<NotifyChannelOption[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/flow-config/notify-channels`,
  );
}

/**
 * 查询报修通知记录
 * @param requestId 报修单ID
 * @returns 通知记录列表
 */
export async function getNotificationRecords(requestId: number) {
  return requestClient.get<NotificationRecordItem[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/repair/notification/${requestId}`,
  );
}
