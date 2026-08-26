// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 展示所有工单（搅拌机工单列表）
 * @param params 查询参数
 * @param params.lineName 产线名称
 * @param params.processType 工序（搅拌机固定为 6）
 * @param params.planDateStart 指示日期 yyyy-MM-dd
 */
export function selectWeekWorkSheet(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/selectWeek?${qs.stringify(params)}`,
  );
}

/**
 * 批量生成批次
 * @param params 参数
 * @param params.id 工单 id
 * @param params.batch 每次生成多少批
 */
export function addBatch(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/addBatch`,
    params,
  );
}

/**
 * 生成批次
 * @param params 参数
 * @param params.id 工单 id
 */
export function addLot(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/add`,
    params,
  );
}

/**
 * 工单开始/结束
 * @param ids 选中的 id 列表
 * @param state 状态 1确认 2进行中 3结束
 * @since 2026-08-26
 */
export function updateStae(ids: (number | string)[], state: number) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/updateStae`,
    { ids, state },
  );
}

/**
 * 删除工单
 * @param ids id 列表
 * @since 2026-08-26
 */
export function deleteLot(ids: (number | string)[]) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/delete?ids=${ids.join(',')}`,
  );
}
