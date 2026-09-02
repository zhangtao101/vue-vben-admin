// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分页查询不良品记录
 * @param params 查询参数
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @param params.startTime 开始时间（yyyy-MM-dd）
 * @param params.endTime 结束时间（yyyy-MM-dd）
 * @param params.isTransfer 是否传输：1已完成 2未完成，不传为全部
 * @param params.palletLabel 托盘号
 * @returns 分页不良品记录列表
 * @since 2026-09-02
 */
export function queryDefectRecord(params: {
  endTime?: string;
  isTransfer?: number;
  pageNum?: number;
  pageSize?: number;
  palletLabel?: string;
  startTime?: string;
}) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/defect/record/search?${qs.stringify(params)}`,
  );
}

/**
 * 增加不良品记录
 * @param data 提交数据
 * @param data.custName 客户名称
 * @param data.custType 客户类型
 * @param data.isTransfer 是否传输：1传输 2没有
 * @param data.lotCode 生产指示批次
 * @param data.palletLabel 托盘号
 * @param data.produceDate 生产日期
 * @param data.reworkQty 返工数量
 * @param data.scrapQty 废弃数量
 * @param data.stackQty 码垛数量
 * @param data.type 清真类型
 * @param data.validDate 有效期
 * @param data.workSheetCode 工单号
 * @returns 操作结果
 * @since 2026-09-02
 */
export function saveDefectRecord(data: {
  custName: string;
  custType: string;
  isTransfer: number;
  lotCode: string;
  palletLabel: string;
  produceDate: string;
  reworkQty: number;
  scrapQty: number;
  stackQty: number;
  type: string;
  validDate: string;
  workSheetCode: string;
}) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/defect/record/add`,
    data,
  );
}

/**
 * 根据托盘号查询不良品信息
 * @param pallet 托盘号
 * @returns 托盘对应的不良品信息对象
 * @since 2026-09-02
 */
export function selectDefectByPallet(pallet: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/defect/record/selectByPallet/${encodeURIComponent(pallet)}`,
  );
}

/**
 * 批量传输不良品记录（更新传输状态）
 * @param data 提交数据
 * @param data.ids 记录 id 数组
 * @param data.state 目标状态：1 传输
 * @returns 操作结果
 * @since 2026-09-02
 */
export function transferDefectRecords(data: { ids: (number | string)[]; state: number }) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/defect/record/updateState`,
    data,
  );
}
