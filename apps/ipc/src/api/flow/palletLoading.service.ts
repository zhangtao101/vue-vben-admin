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
