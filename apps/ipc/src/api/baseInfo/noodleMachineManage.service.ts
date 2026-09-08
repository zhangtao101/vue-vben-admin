// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分页查询面机设备列表
 * @param params 查询参数
 * @param params.equipCode 面机代码（支持模糊查询）
 * @param params.type 面机类型：rolling 压延机 / compound 复合机 / cutting 切断机 / frying 油炸机
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页结果 { list, total }
 * @since 2026-09-08
 */
export function searchNoodleMachineList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/noodle/search?${qs.stringify(params)}`,
  );
}
