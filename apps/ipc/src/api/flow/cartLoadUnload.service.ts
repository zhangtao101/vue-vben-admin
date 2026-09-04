// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 大车装载
 * @param data 提交数据
 * @param data.cartCode 大车编号
 * @param data.lotId 批次 LotId
 * @param data.worksheetCode 工单单号
 * @param data.number 数量
 * @returns 操作结果
 * @since 2026-09-04
 */
export function cartLoad(data: {
  cartCode: string;
  lotId: string;
  number: number;
  worksheetCode: string;
}) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/cartLoading`,
    data,
  );
}

/**
 * 获取批次 LotId 详情
 * @param params 查询参数
 * @param params.lotId 工单产出 LOTId
 * @param params.cartCode 台车编码（可选）
 * @returns 批次详情数据
 * @returns data.workSheetCode 工单号
 * @returns data.lineCode 子产线编号
 * @returns data.lineName 子产线名称
 * @returns data.productCode 产品编号
 * @returns data.productName 产品名称
 * @returns data.lotId 批次 Lot Id
 * @returns data.lotCreateTime 制造时间
 * @returns data.validDate 有效日期
 * @returns data.sapSeq SAP 序列号
 * @returns data.number 数量
 * @returns data.equipCode 装载机
 * @returns data.opUser 操作人
 * @since 2026-09-04
 */
export function queryLotDetail(params: { cartCode?: string; lotId?: string }) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/queryLotDetail?${qs.stringify(params)}`,
  );
}

/**
 * 大车卸货
 * @param data 提交数据
 * @param data.cartCode 大车编号
 * @returns 操作结果
 * @since 2026-09-04
 */
export function cartUnload(data: { cartCode: string }) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/cartUnloading`,
    data,
  );
}
