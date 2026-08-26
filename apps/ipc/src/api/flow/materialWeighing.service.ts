// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 展示所有 lot（搅拌机批次列表）
 * @param params 查询参数
 * @param params.processType 工序，直接传 6
 * @param params.lineName 产线名称
 * @param params.planDateStart 指示日期 yyyy-MM-dd
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页 lot 列表
 * @since 2026-08-24 10:00:00
 */
export function searchLot(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/search?${qs.stringify(params)}`,
  );
}

/**
 * 查询需要的材料和重量
 * @param params 查询参数
 * @param params.workSheetId 工单 id
 * @param params.productCode 产品编号
 * @param params.materialCode 物料编号
 * @param params.batch 批次数
 * @param params.weight 标准重量
 * @returns 材料及重量列表
 * @since 2026-08-24 10:00:00
 */
export function selectMaterialWeight(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/select?${qs.stringify(params)}`,
  );
}

/**
 * 展示称重记录
 * @param id 当前 lot 的 id
 * @returns 称重记录列表
 * @since 2026-08-24 10:00:00
 */
export function searchWeightRecord(id: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/search/${id}`,
  );
}

/**
 * 增加称重记录
 * @param data 提交数据
 * @param data.actualWt 称重重量
 * @param data.lotCode lot 编号
 * @param data.lotId lot 的 id
 * @param data.materialCode 物料编号
 * @param data.materialName 物料名称
 * @param data.packType 1纸袋 2散装
 * @param data.scanLabel 标签 ID
 * @param data.unit 产品单位
 * @returns 操作结果
 * @since 2026-08-24 10:00:00
 */
export function addWeightRecord(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/add`,
    data,
  );
}

/**
 * 发行
 * @param lotId 传入 id
 * @returns 操作结果
 * @since 2026-08-24 10:00:00
 */
export function issueWeightLabel(lotId: number) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/issue/${lotId}`,
  );
}

/**
 * 重新发行 - 第一个页面（查询已发行的托盘列表）
 * @param params 查询参数
 * @param params.startTime 指示日期开始 yyyy-MM-dd
 * @param params.endTime 指示日期结束 yyyy-MM-dd
 * @param params.lineCode 产线编号
 * @param params.productCode 产品编号
 * @param params.workSheetCode 工单号
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页托盘列表
 * @since 2026-08-24 10:00:00
 */
export function selectIssue(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/selectIssue?${qs.stringify(params)}`,
  );
}

/**
 * 重新发行 - 第二个页面（查询 lot 下对应托盘类型的材料）
 * @param params 查询参数
 * @param params.lotId lot 的 id
 * @param params.packType 1纸袋 2散装
 * @returns 材料列表
 * @since 2026-08-24 10:00:00
 */
export function selectMaterial(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/weight/label/selectMaterial?${qs.stringify(params)}`,
  );
}
