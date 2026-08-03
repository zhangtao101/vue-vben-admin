/** notifyChannel.service.ts - 通知渠道管理 API 服务
 *  提供通知渠道的查询、新增、编辑、删除功能
 *  @since 2026-08-03
 */
// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 列表查询 ==========

/**
 * 查询通知渠道列表
 * @param params 查询参数 { name?, channelType?, provider? }
 * @since 2026-08-03
 */
export function getNotifyChannelList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/notify/list?${qs.stringify(params)}`,
  );
}

// ========== 单条操作 ==========

/**
 * 新增通知渠道
 * @param params { name, channelType, provider, configContent }
 * @since 2026-08-03
 */
export function addNotifyChannel(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/notify/save`,
    params,
  );
}

/**
 * 编辑通知渠道
 * @param params { id, name, channelType, provider, configContent }
 * @since 2026-08-03
 */
export function updateNotifyChannel(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/notify/update`,
    params,
  );
}

/**
 * 删除通知渠道
 * @param id 渠道ID
 * @since 2026-08-03
 */
export function deleteNotifyChannel(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/notify/delete/${id}`,
  );
}
