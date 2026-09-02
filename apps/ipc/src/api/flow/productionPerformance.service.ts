// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询完工记录（分页）
 * @param params 查询参数
 * @param params.workSheetCode 工单号
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页完工记录列表（lotCode、quity 数量、unit 单位、createTime 创建时间、workSheetCode 工单号）
 * @since 2026-09-02
 */
export function queryFinishRecord(params: {
  pageNum?: number;
  pageSize?: number;
  workSheetCode?: string;
}) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/finish/record/search?${qs.stringify(params)}`,
  );
}

/**
 * 增加完工记录
 * @param data 提交数据
 * @param data.lotCode lot id
 * @param data.quity 数量
 * @param data.unit 单位
 * @param data.workSheetCode 工单号
 * @returns 操作结果
 * @since 2026-09-02
 */
export function addFinishRecord(data: {
  lotCode: string;
  quity: number;
  unit: string;
  workSheetCode: string;
}) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/finish/record/add`,
    data,
  );
}

/**
 * 批量删除完工记录
 * @param ids 记录 id 数组
 * @returns 操作结果
 * @since 2026-09-02
 */
export function removeFinishRecords(ids: (number | string)[]) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/finish/record/deleteBatch?ids=${ids.join(',')}`,
  );
}

/**
 * 根据工单展示子工单
 * @param workSheetCode 工单号
 * @returns 子工单列表（lotCode 生产指示序列号、productName 材料名称、productCode 材料编号、equipCode 堆垛机ID）
 * @since 2026-09-02
 */
export function getWorkLot(workSheetCode: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/finish/record/getWorkLot/${encodeURIComponent(workSheetCode)}`,
  );
}
