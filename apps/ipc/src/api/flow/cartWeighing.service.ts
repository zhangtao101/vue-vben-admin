// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 根据托盘展示所有信息
 * @param label 输入的标签（托盘号）
 * @returns 托盘及工单信息
 * @returns data.lineName 产线名称
 * @returns data.lineCode 产线代码
 * @returns data.workSheetCode 工单号
 * @returns data.createUser 操作员
 * @returns data.remark 备注
 * @returns data.productName 产品名称
 * @returns data.workSheetPlanNumber 指示重量
 * @returns data.workSheetFinishNumber 产品重量
 * @returns data.diffNum 剩余重量
 * @returns data.lotCode lot 编号
 * @returns data.palletLabel 托盘号
 * @returns data.weight 推车重量
 * @returns data.totalQty 总重量
 * @since 2026-08-25
 */
export function selectPalletAllInfo(label: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/car/select?${qs.stringify({ label })}`,
  );
}

/**
 * 展示推车称重信息
 * @param label 托盘编号
 * @returns 推车称重记录列表
 * @returns data[].id 记录 id
 * @returns data[].lotId lot 的 id
 * @returns data[].lotCode lot 编号
 * @returns data[].palletLabel 托盘号
 * @returns data[].cartCode 推车代码
 * @returns data[].qty 数量
 * @returns data[].unit 单位
 * @returns data[].createTime 处理时间
 * @since 2026-08-25
 */
export function searchCartWeight(label: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/car/searchCartWeight?${qs.stringify({ label })}`,
  );
}

/**
 * 添加小车称重信息
 * @param data 提交数据
 * @param data.cartCode 小推车编号
 * @param data.lotCode lot 编号
 * @param data.lotId lot 的 id
 * @param data.palletLabel 托盘号
 * @param data.qty 数量
 * @param data.unit 单位
 * @returns 操作结果
 * @since 2026-08-25
 */
export function addCartWeight(data: {
  cartCode: string;
  lotCode: string;
  lotId: number;
  palletLabel: string;
  qty: number;
  unit: string;
}) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/car/add`,
    data,
  );
}

/**
 * 删除小车称重信息
 * @param id 记录 id
 * @returns 操作结果
 * @since 2026-08-25
 */
export function deleteCartWeight(id: number) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/car/delete/${id}`,
  );
}

/**
 * 获取小车重量
 * @param cartCode 小车编号
 * @returns 小车重量，单位千克
 * @since 2026-08-25
 */
export function selectCartWeight(cartCode: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/car/selectWeight/${cartCode}`,
  );
}
