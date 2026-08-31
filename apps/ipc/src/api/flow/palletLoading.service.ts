// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 工单展示（无重力搅拌托盘投入）
 * @param params 查询参数
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @param params.lineCode 产线名称
 * @param params.startTime 指示日期开始时间（yyyy-MM-dd）
 * @param params.processType 工序，无重力搅拌固定为 6
 * @param params.workSheetCode 工单号
 * @param params.state 工单状态：1确定 2进行 3完成
 * @returns 分页工单列表
 * @since 2026-08-25
 */
export function selectWorkSheet(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/selectWorkSheet?${qs.stringify(params)}`,
  );
}

/**
 * 根据工单展示所有批次 LOT
 * @param workSheetId 工单 id
 * @returns 批次 LOT 列表
 * @since 2026-08-25
 */
export function selectByWorkSheetId(workSheetId: number) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/selectByWorkSheetId/${workSheetId}`,
  );
}

/**
 * 装载和卸载
 * @param data 提交数据
 * @param data[].input 1装载 2卸载
 * @param data[].lotId LOT id
 * @param data[].packType 1纸袋 2散装
 * @param data[].palletLabel 托盘编号
 * @returns 操作结果
 * @since 2026-08-25
 */
export function palletLoading(
  data: Array<{
    input: number;
    lotId: number;
    packType: number;
    palletLabel: string;
  }>,
) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/loading`,
    data,
  );
}

/**
 * 扫描托盘展示信息
 * @param palletLabel 托盘编号
 * @returns 托盘信息
 * @since 2026-08-25
 */
export function selectPalletInfo(palletLabel: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/selectMaterial/${palletLabel}`,
  );
}

/**
 * 追加创建批次 LOT
 * @param data 提交数据
 * @param data.batch 批次数，小于 20
 * @param data.id 工单 id
 * @returns 操作结果
 * @since 2026-08-29
 */
export function addCreate(data: { batch: number; id: number }) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/addCreate`,
    data,
  );
}

/**
 * 删除 lot 批次
 * @param ids 选中的 id 列表
 * @returns 操作结果
 * @since 2026-08-29
 */
export function deleteLotBatch(ids: (number | string)[]) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/delete?ids=${ids.join(',')}`,
  );
}

/**
 * 查询可以进行托盘变更的 lot
 * @param params 查询参数
 * @param params.processType 工序（混合水为 1）
 * @param params.startTime 开始时间（yyyy-MM-dd）
 * @param params.endTime 结束时间（yyyy-MM-dd）
 * @param params.lineCode 产线编号
 * @param params.productCode 产品编号
 * @param params.workSheetCode 工单号
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页 lot 列表
 * @since 2026-08-29
 */
export function selectNoTranseLot(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/selectNoTranse?${qs.stringify(params)}`,
  );
}

/**
 * 根据托盘号展示托盘信息
 * @param palletLabel 托盘号
 * @returns 托盘信息
 * @since 2026-08-29
 */
export function selectPalletLabelInfo(palletLabel: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/selectPalletLabel/${palletLabel}`,
  );
}

/**
 * 托盘变更
 * @param data 提交数据
 * @param data.id 托盘信息返回的 id
 * @param data.lotId 选中的 lot 的 id
 * @param data.palletLabel 托盘编号
 * @returns 操作结果
 * @since 2026-08-29
 */
export function updatePallet(data: {
  id: number;
  lotId: number;
  palletLabel: string;
}) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/updatePallet`,
    data,
  );
}

/**
 * 保存工单队列
 * @param data 队列数据列表
 * @param data[].id 工单 id
 * @param data[].lineName 子产线名称
 * @param data[].lotCode lot编号
 * @param data[].lotId lot id
 * @param data[].processType 工序 1
 * @param data[].productCode 产品编号
 * @param data[].productName 产品名称
 * @param data[].seqNo 顺序
 * @returns 操作结果
 * @since 2026-08-29
 */
export function queueAddBatch(
  data: Array<{
    id: number;
    lineName: string;
    lotCode: string;
    lotId: number;
    processType: number;
    productCode: string;
    productName: string;
    seqNo: number;
  }>,
) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/queue/addBatch`,
    data,
  );
}

/**
 * 删除工单队列
 * @param ids 选中的 id 列表
 * @returns 操作结果
 * @since 2026-08-29
 */
export function queueDelete(ids: (number | string)[]) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/queue/delete?ids=${ids.join(',')}`,
  );
}

/**
 * 展示所有工单（队列查询）
 * @param params 查询参数
 * @param params.startTime 开始时间（yyyy-MM-dd）
 * @param params.endTime 结束时间（yyyy-MM-dd）
 * @param params.lineCode 产线编号
 * @param params.productCode 产品编号
 * @param params.workSheetCode 工单号
 * @param params.processType 工序
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页工单列表
 * @since 2026-08-29
 */
export function queueSearch(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/queue/search?${qs.stringify(params)}`,
  );
}

/**
 * 获取子产线名称
 * @param params 查询参数
 * @param params.processType 工序
 * @returns 子产线列表
 * @since 2026-08-29
 */
export function searchSubLine(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/search?${qs.stringify(params)}`,
  );
}
