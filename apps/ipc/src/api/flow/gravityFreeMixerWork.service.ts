// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 根据子产线名称获取工单号
 * @param sublineCode 子产线名称
 * @returns 工单列表（id 工单id、workSheetCode 工单号）
 * @since 2026-09-01
 */
export function getPlanWorkSheet(sublineCode: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/getPlanWorkSheet/${sublineCode}`,
  );
}

/**
 * 根据工单 id 获取工单
 * @param workSheetId 工单 id
 * @returns 工单列表（含产线、子产线、产品信息）
 * @since 2026-09-01
 */
export function selectLineByWorkSheetId(workSheetId: number | string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/selectLineByWorkSheetId/${workSheetId}`,
  );
}

/**
 * 查看工单详情
 * @param lotId LOT id
 * @returns 工单详情列表（含指示数量、单位）
 * @since 2026-09-01
 */
export function getWorkSheetLot(lotId: number | string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/getWorkSheetLot/${lotId}`,
  );
}

/**
 * 获取 BOM
 * @param params 查询参数
 * @param params.lotId LOT id
 * @returns BOM 物料列表
 * @since 2026-09-01
 */
export function selectBom(params: { lotId: number }) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/selectBom?${qs.stringify(params)}`,
  );
}

/**
 * 扫码得到物料
 * @param label 扫描标签
 * @returns 物料信息（scanLabel 扫进来的标签、materialName 物料名称、materialCode 物料编号）
 * @since 2026-09-01
 */
export function selectPalletLabel(label: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/selectPalletLabel?label=${encodeURIComponent(label)}`,
  );
}

/**
 * 批量保存（称重标签）
 * @param data 提交数据列表
 * @param data[].actualWt 加载数量
 * @param data[].lotId 最开始获取的那个 id
 * @param data[].materialCode 材料编号
 * @param data[].materialName 材料名称
 * @param data[].scanLabel 标签
 * @param data[].unit 单位名称
 * @param data[].palletLabel 设备编号
 * @returns 操作结果
 * @since 2026-09-01
 */
export function addLabelBatch(
  data: Array<{
    actualWt: number;
    lotId: number;
    materialCode: string;
    materialName: string;
    palletLabel: string;
    scanLabel: string;
    unit: string;
  }>,
) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/addBatch`,
    data,
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
 * @since 2026-09-01
 */
export function addDefectRecord(data: {
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
 * 展示所有数据（不良品记录查询）
 * @param params 查询参数
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @param params.startTime 开始时间（yyyy-MM-dd）
 * @param params.endTime 结束时间（yyyy-MM-dd）
 * @param params.isTransfer 是否传输：1已完成 2未完成，不传为全部
 * @param params.palletLabel 托盘号
 * @returns 分页不良品记录列表
 * @since 2026-09-01
 */
export function searchDefectRecord(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/defect/record/search?${qs.stringify(params)}`,
  );
}

/**
 * 查询完成记录
 * @param params 查询参数
 * @param params.workSheetCode 工单号
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页完成记录列表
 * @since 2026-09-01
 */
export function searchFinishRecord(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/finish/record/search?${qs.stringify(params)}`,
  );
}

/**
 * 删除完成记录
 * @param id 记录 id
 * @returns 操作结果
 * @since 2026-09-01
 */
export function deleteFinishRecord(id: number) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/finish/record/delete/${id}`,
  );
}
