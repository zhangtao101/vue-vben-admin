// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 根据工序获取子产线列表
 * @param processCode 工序编码（如 SCBZ）
 * @returns 子产线列表（id 子产线ID、lineId 产线ID、subLineCode 子产线编码、subLineName 子产线名称）
 * @since 2026-09-03
 */
export function searchSubLineByProcessCode(processCode: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/searchByProcessCode?${qs.stringify({ processCode })}`,
  );
}

/**
 * 条件查询工单列表
 * @param params 查询参数
 * @param params.lineId 子产线ID
 * @param params.isAsc 排序：1 正序、-1 倒序
 * @param params.pageNum 页码
 * @param params.pageSize 每页展示条数
 * @param params.planDateStart 指示日期开始时间
 * @param params.planDateEnd 指示日期结束时间
 * @param params.workSheetCode 工单号
 * @param params.status 状态：1进行中、2已完成
 * @returns 分页工单列表（results 工单数组、total 总数、count 页数）
 * @since 2026-09-03
 */
export function searchWorkSheetList(params: {
  isAsc: number;
  lineId?: number;
  pageNum: number;
  pageSize: number;
  planDateEnd?: string;
  planDateStart?: string;
  status?: number;
  workSheetCode?: string;
}) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/search?${qs.stringify(params)}`,
  );
}

/**
 * 蔬菜包装工步-工单信息查询
 * @param workSheetCode 工单号
 * @returns 工单信息（workSheetCode 工单号、lineName 产线名称、productCode 产品编号、productName 产品名称、remark 备注、planNumber 指示数量、finishNumber 生产数量、cartCount 推车数量、measureCount 测量总条数）
 * @since 2026-09-03
 */
export function queryWorkSheetInfo(workSheetCode: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/queryWorkSheetInfo?workSheetCode=${workSheetCode}`,
  );
}

/**
 * 根据工单获取生产物料清单（蔬菜包装）
 * @param workSheetCode 工单号
 * @returns 生产物料清单（materialCode 料号、materialName 物料名称、bomUseQuantity BOM用量、standardQuantity 生产标准用量、alreadyInputQuantity 已投入数量）
 * @since 2026-09-03
 */
export function getProductionBomList(workSheetCode: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/getProductionBomList?workSheetCode=${workSheetCode}`,
  );
}

/**
 * 大车批次绑定记录查询
 * @param workSheetCode 工单号
 * @returns 大车批次绑定记录列表（cartCode 大车编号、cartBindWorkSheetTime 大车投入工单时间、state 状态：1 wait 待机、2 proc 生产）
 * @since 2026-09-03
 */
export function getLoadingLotList(workSheetCode: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/getLoadingLotList?workSheetCode=${workSheetCode}`,
  );
}

/**
 * 大车删除
 * @param data 提交数据
 * @param data.cartCode 大车编码
 * @param data.workSheetCode 工单号（可选，按接口实际要求决定是否携带）
 * @returns 操作结果
 * @since 2026-09-03
 */
export function cancelCartInput(data: {
  cartCode: string;
  workSheetCode?: string;
}) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/cartInputCancel`,
    data,
  );
}

/**
 * 大车业绩注册
 * @param data 提交数据
 * @param data.cartCode 大车编码
 * @param data.quantity 数量
 * @param data.workSheetCode 当前工单号
 * @returns 操作结果
 * @since 2026-09-03
 */
export function registerPerformance(data: {
  cartCode: string;
  quantity: number;
  workSheetCode: string;
}) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/performanceRegister`,
    data,
  );
}

/**
 * 大车业绩取消
 * @param data 提交数据
 * @param data.cartCode 大车编码
 * @param data.lotId 批次 LOT ID
 * @returns 操作结果
 * @since 2026-09-03
 */
export function cancelPerformance(data: { cartCode: string; lotId: string }) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/performanceCancel`,
    data,
  );
}

/**
 * 工单开始/结束
 * @param data 提交数据
 * @param data.workSheetCode 工单号
 * @param data.status 操作码：1开始、2结束
 * @returns 操作结果
 * @since 2026-09-03
 */
export function startOrEndWork(data: {
  status: number;
  workSheetCode: string;
}) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/startOrEndWork`,
    data,
  );
}

/**
 * 校验条码
 * @param params 查询参数
 * @param params.tagCode 标签ID
 * @param params.productionBomId 选择的投料清单的 id
 * @returns 标签详情（labelCode 标签条码、materialCode 料号、materialName 物料名称、unit 单位、packageNumber 标签数量、produceDate 制造日期、validDate 有效期、batchCode 批次号）
 * @since 2026-09-03
 */
export function checkTagCode(params: {
  productionBomId: number;
  tagCode: string;
}) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/checkTagCode?${qs.stringify(params)}`,
  );
}

/**
 * 材料装载
 * @param data 提交数据
 * @param data.tagId 标签ID
 * @param data.workSheetCode 工单号
 * @returns 操作结果
 * @since 2026-09-03
 */
export function loadMaterial(data: { tagId: string; workSheetCode: string }) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/materialLoading`,
    data,
  );
}

/**
 * 材料卸载
 * @param data 提交数据
 * @param data.tagId 标签ID
 * @param data.workSheetCode 工单号
 * @returns 操作结果
 * @since 2026-09-03
 */
export function unloadMaterial(data: { tagId: string; workSheetCode: string }) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/materialUnloading`,
    data,
  );
}

/**
 * 根据物料清单获取材料加载列表
 * @param params 查询参数
 * @param params.workSheetCode 工单号
 * @param params.materialCode 料号
 * @returns 材料加载列表（labelCode 标签、materialCode 料号、materialName 物料名称、feedNumber 投入数量、feedTime 投入时间）
 * @since 2026-09-03
 */
export function listFeedBySheet(params: {
  materialCode?: string;
  workSheetCode?: string;
}) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/listFeedBySheet?${qs.stringify(params)}`,
  );
}

/**
 * 测量记录列表查询（重量测量列表）
 * @param params 查询参数
 * @param params.pageNum 页码
 * @param params.pageSize 每页展示条数
 * @param params.startTime 开始时间
 * @param params.endTime 结束时间
 * @param params.workSheetCode 工单号
 * @param params.produceLine 子产线编码
 * @param params.weight 重量
 * @returns 分页测量记录（results 记录数组、total 总数；记录含 id 测量记录ID、worksheetCode 工单号、lineCode 子产线编码、lineName 子产线名称、productName 产品名称、measureValue 测量值、measureTime 测量时间、unit 单位、handleDate 处理日期）
 * @since 2026-09-04
 */
export function queryMeasureRecordList(params: {
  endTime?: string;
  pageNum: number;
  pageSize: number;
  produceLine?: string;
  startTime?: string;
  weight?: number;
  workSheetCode?: string;
}) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/queryMeasureRecordList?${qs.stringify(params)}`,
  );
}
