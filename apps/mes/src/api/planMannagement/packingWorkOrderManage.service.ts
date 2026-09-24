/**
 * @description 包装工单管理模块 API 服务
 * 提供 SAP 计划列表查询、工单生成、工单列表查询、工单保存/确认/删除、
 * 下层工单生成、工单合并、工单导出以及喷码模板查询与预览等接口。
 * @module apps/mes/src/api/planMannagement/packingWorkOrderManage.service
 * @since 2026-09-24
 */

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

const { VITE_GLOB_MES_EQUIP_OTHER, VITE_GLOB_MES_MAIN } = import.meta.env;

// ========== 类型定义 ==========

/** 分页查询基础参数 */
export interface PageParams {
  /** 当前页码 */
  pageNum?: number | string;
  /** 每页条数 */
  pageSize?: number | string;
}

/** SAP 计划列表查询参数 */
export interface SapWorkSheetQueryParams extends PageParams {
  /** 计划订单编号 */
  instructionSequenceCode?: string;
  /** 产线编号 */
  lineCode?: string;
  /** 生产指示流水号 */
  planCode?: string;
  /** 产品编号 */
  productCode?: string;
  /** 生产指示日期-结束 */
  produceDateEnd?: string;
  /** 生产指示日期-开始 */
  produceDateStart?: string;
  /** SAP 工单编号 */
  sapOrderCode?: string;
}

/** SAP 工单项次信息 */
export interface SapWorkSheetItem {
  /** 批次号 */
  batchNo?: string;
  /** 箱子日期码 */
  boxDateCode?: string;
  /** 交货日期 */
  deliverDate?: string;
  /** 交货处名称 */
  deliverPlaceName?: string;
  /** SAP 工单ID */
  id?: number;
  /** 生产指示日期 */
  instructionDate?: string;
  /** 生产指示数量 */
  instructionQty?: number;
  /** 生产指示序列号（SAP计划单号） */
  instructionSequenceCode?: string;
  /** 产线编号 */
  lineCode?: string;
  /** 产线名称 */
  lineName?: null | string;
  /** 多包日期码 */
  multiPackDateCode?: string;
  /** 多包墨水颜色 */
  multiPackInkColor?: null | string;
  /** 生产指示流水号（SAP工单项次） */
  planCode?: string;
  /** 产品编号 */
  productCode?: string;
  /** 产品名称 */
  productName?: string;
  /** 销售PO单号（订单号） */
  salesPoNo?: string;
  /** 单包日期码 */
  singlePackDateCode?: string;
  /** 单包墨水颜色 */
  singlePackInkColor?: null | string;
  /** SAP 工单号 */
  sapOrderCode?: string;
  /** 单位 */
  unit?: string;
}

/** SAP 计划列表查询结果 */
export interface SapWorkSheetResult {
  /** 记录数 */
  count?: number;
  /** 列表数据 */
  results?: SapWorkSheetItem[];
  /** 总条数 */
  total?: number;
}

/** 父级子产线查询参数 */
export interface ParentSubLineQueryParams extends PageParams {
  /** 产线名称 */
  lineName?: string;
  /** 单别（包装工单4、搅拌工单2、混合水工单1、蔬菜包装工单5、无重力搅拌工单6） */
  processType?: number | string;
}

/** 父级子产线信息 */
export interface ParentSubLineItem {
  /** 子产线ID */
  id?: number;
  /** 总产线ID */
  lineId?: number;
  /** 总产线名称 */
  lineName?: string;
  /** 子产线编号（显示） */
  subLineCode?: string;
  /** 子产线名称（显示） */
  subLineName?: string;
}

/** 父级子产线查询结果 */
export interface ParentSubLineResult {
  /** 列表数据 */
  list?: ParentSubLineItem[];
  /** 总条数 */
  total?: number;
  /** 其他分页信息 */
  [key: string]: any;
}

/** 堆垛机（设备）列表查询参数 */
export interface EquipListQueryParams extends PageParams {
  /** 下拉选择的子产线列表编号 */
  parentSubLineCode?: string;
}

/** 堆垛机（设备）信息 */
export interface EquipItem {
  /** 设备编号（堆垛机编号） */
  equipCode?: null | string;
  /** 子产线ID */
  id?: number;
  /** 总产线编号 */
  lineCode?: string;
  /** 总产线名称 */
  lineName?: string;
  /** 子产线编号 */
  subLineCode?: string;
  /** 子产线名称 */
  subLineName?: string;
}

/** 堆垛机（设备）列表查询结果 */
export interface EquipListResult {
  /** 列表数据 */
  list?: EquipItem[];
  /** 总条数 */
  total?: number;
  /** 其他分页信息 */
  [key: string]: any;
}

/** 工单生成参数 */
export interface GenerateWorkSheetParams {
  /** 批次印字编号 */
  batchPrint?: string;
  /** 创建人 */
  createUser: string;
  /** 勾选的 SAP 工单项次ID列表 */
  ids: number[];
  /** 生产指示日期（工单开始时间） */
  instructionDate: string;
  /** 产线编号（下拉选择的 subLineCode） */
  lineCode: string;
  /** 产线ID（下拉选择的 id） */
  lineId: number;
  /** 产线名称（下拉选择的 subLineName） */
  lineName: string;
  /** 优先级 */
  priority: number;
  /** 单别（包装工单4、搅拌工单2、混合水工单1、蔬菜包装工单5、无重力搅拌工单6） */
  processType?: number;
  /** 堆垛机编号（ALL 或指定编号） */
  stackerId: string;
}

/** 工单列表查询参数 */
export interface WorkSheetQueryParams extends PageParams {
  /** 子产线编号 */
  lineCode?: string;
  /** 单别（包装工单4、搅拌工单2、混合水工单1、蔬菜包装工单5、无重力搅拌工单6） */
  processType?: number | string;
  /** 产品编号 */
  productCode?: string;
  /** 班别编号（页面筛选用，后端暂无该过滤条件时自动忽略） */
  shiftCode?: string;
  /** 工单状态（1-生成、2-确定、3-进行、4-完成、5-截止） */
  status?: number[];
  /** 作业结束日期 */
  workDateEnd?: string;
  /** 作业开始日期 */
  workDateStart?: string;
}

/** 工单信息 */
export interface WorkSheetItem {
  /** 不良批次数 */
  defectBatch?: number;
  /** 不良品数 */
  defectQty?: null | number;
  /** 良品批次数 */
  goodBatch?: number;
  /** 良品数 */
  goodQty?: null | number;
  /** 工单ID */
  id?: number;
  /** 指示批次数 */
  indicateBatch?: number;
  /** 子产线编号 */
  lineCode?: string;
  /** 子产线名称 */
  lineName?: string;
  /** 混合水工单生成标记 */
  mixGenerateFlag?: null | number | string;
  /** 每批次面块数量 */
  perBatchQty?: null | number;
  /** 计划数量 */
  planQty?: number;
  /** 优先级 */
  priority?: null | number;
  /** 产品编号 */
  productCode?: string;
  /** 产品名称 */
  productName?: string;
  /** 单别 */
  processType?: number;
  /** 备注 */
  remark?: null | string;
  /** 班别编号 */
  shiftCode?: null | string;
  /** 班别名称 */
  shiftName?: null | string;
  /** 搅拌工单生成标记 */
  stirGenerateFlag?: null | number | string;
  /** 状态 */
  status?: number;
  /** 状态说明 */
  statusDesc?: string;
  /** 单位 */
  unit?: string;
  /** 生产指示日期 */
  workDate?: string;
  /** 工单单号 */
  workSheetCode?: string;
}

/** 工单列表查询结果 */
export interface WorkSheetResult {
  /** 记录数 */
  count?: number;
  /** 列表数据 */
  results?: WorkSheetItem[];
  /** 总条数 */
  total?: number;
}

/** 工单保存（修改）项 */
export interface WorkSheetSaveItem {
  /** 工单ID */
  id: number;
  /** 班别编号 */
  shiftCode: string;
  /** 班别名称 */
  shiftName: string;
  /** 作业指示日期 */
  workDate: string;
}

/** 工单导出参数 */
export interface WorkSheetExportParams {
  /** 产品编号 */
  productCode?: string;
  /** 单别（包装工单4、搅拌工单2、混合水工单1、蔬菜包装工单5、无重力搅拌工单6） */
  processType?: number | string;
  /** 班别编号 */
  shiftCode?: string;
  /** 工单状态（1-生成、2-确定、3-进行、4-完成、5-截止） */
  status?: number | string;
  /** 子产线编号 */
  lineCode?: string;
  /** 作业结束日期 */
  workDateEnd?: string;
  /** 作业开始日期 */
  workDateStart?: string;
}

/** 批量操作参数 */
export interface BatchIdsParams {
  /** 工单ID集合 */
  ids: number[];
}

/** 喷码模板查询参数 */
export interface PrintCodeTemplateQueryParams extends PageParams {
  /** 产品组编号 */
  productGroupCode?: string;
  /** 编号 */
  printCode?: string;
  /** 区分 */
  printName?: string;
  /** 销售类型：1=内销，2=出口 */
  salesType?: number;
}

/** 喷码模板信息 */
export interface PrintCodeTemplateListItem {
  /** 模板主键 */
  id?: number;
  /** 喷码号码 */
  printCode?: string;
  /** 喷码名称或说明 */
  printName?: string;
  /** 产品组编码 */
  productGroupCode?: string;
  /** 产品组名称 */
  productGroupName?: string;
  /** 销售类型：1=内销，2=出口 */
  salesType?: number;
}

/** 喷码模板查询结果 */
export interface PrintCodeTemplateResult {
  /** 记录数 */
  count?: number;
  /** 列表数据 */
  results?: PrintCodeTemplateListItem[];
  /** 总条数 */
  total?: number;
}

// ========== 接口函数 ==========

/**
 * 查询 SAP 计划列表（分页）
 * @param {SapWorkSheetQueryParams} params - 查询参数，包含生产指示日期、产品编号、产线编号等
 * @returns {Promise<SapWorkSheetResult>} SAP 计划分页数据
 * @since 2026-09-24
 */
export async function querySapWorkSheetList(params: SapWorkSheetQueryParams) {
  return requestClient.get<SapWorkSheetResult>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/querySapWorkSheetList?${qs.stringify(params)}`,
  );
}

/**
 * 根据单别查询父级子产线列表
 * @param {ParentSubLineQueryParams} params - 查询参数，包含产线名称与单别
 * @returns {Promise<ParentSubLineResult>} 父级子产线分页数据
 * @since 2026-09-24
 */
export async function searchParentSubLine(params: ParentSubLineQueryParams) {
  return requestClient.get<ParentSubLineResult>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/searchParentSubLine?${qs.stringify(params)}`,
  );
}

/**
 * 根据子产线编号查询堆垛机（设备）列表
 * @param {EquipListQueryParams} params - 查询参数，包含子产线编号
 * @returns {Promise<EquipListResult>} 堆垛机分页数据
 * @since 2026-09-24
 */
export async function equipListByParentSubLineCode(
  params: EquipListQueryParams,
) {
  return requestClient.get<EquipListResult>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/equipListByParentSubLineCode?${qs.stringify(params)}`,
  );
}

/**
 * 工单生成
 * @param {GenerateWorkSheetParams} data - 工单生成参数，包含勾选的 SAP 工单项次、产线、堆垛机等
 * @returns {Promise<any>} 接口返回结果
 * @since 2026-09-24
 */
export async function generateWorkSheet(data: GenerateWorkSheetParams) {
  return requestClient.post<any>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/generateWorkSheet`,
    data,
  );
}

/**
 * 查询工单列表（分页）
 * @param {WorkSheetQueryParams} params - 查询参数，包含单别、状态、产品编号、作业日期等
 * @returns {Promise<WorkSheetResult>} 工单分页数据
 * @since 2026-09-24
 */
export async function queryWorkSheetList(params: WorkSheetQueryParams) {
  return requestClient.get<WorkSheetResult>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/queryWorkSheetList?${qs.stringify(params)}`,
  );
}

/**
 * 工单保存（工单修改）
 * @param {WorkSheetSaveItem[]} data - 保存参数列表，每项包含工单ID、班别与作业指示日期
 * @returns {Promise<any>} 接口返回结果
 * @since 2026-09-24
 */
export async function saveWorkSheet(data: WorkSheetSaveItem[]) {
  return requestClient.put<any>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/save`,
    data,
  );
}

/**
 * 生成下层工单
 * @param {BatchIdsParams} data - 参数，包含选择的工单ID集合
 * @returns {Promise<any>} 接口返回结果
 * @since 2026-09-24
 */
export async function generateLowerWorkSheet(data: BatchIdsParams) {
  return requestClient.post<any>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/generateLowerWorkSheet`,
    data,
  );
}

/**
 * 删除工单（支持批量）
 * @param {number[]} ids - 勾选的工单ID列表
 * @returns {Promise<any>} 接口返回结果
 * @since 2026-09-24
 */
export async function deleteWorkSheet(ids: number[]) {
  return requestClient.delete<any>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/delete?${qs.stringify(
      { ids },
      { arrayFormat: 'repeat' },
    )}`,
  );
}

/**
 * 工单确认（支持批量）
 * @param {number[]} ids - 工单ID列表
 * @returns {Promise<any>} 接口返回结果
 * @since 2026-09-24
 */
export async function confirmWorkSheet(ids: number[]) {
  return requestClient.put<any>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/confirm`,
    { ids },
  );
}

/**
 * 工单取消确认（支持批量）
 * @param {number[]} ids - 工单ID列表
 * @returns {Promise<any>} 接口返回结果
 * @since 2026-09-24
 */
export async function cancelConfirmWorkSheet(ids: number[]) {
  return requestClient.put<any>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/cancelConfirm`,
    { ids },
  );
}

/**
 * 导出工单列表
 * @param {WorkSheetExportParams} params - 导出参数，包含单别等查询条件
 * @returns {Promise<string>} 导出文件下载地址
 * @since 2026-09-24
 */
export async function exportWorkSheetList(params: WorkSheetExportParams) {
  return requestClient.get<string>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/exportWorkSheetList?${qs.stringify(params)}`,
  );
}

/**
 * 工单指示合并
 * @description 后端接口为 GET 方式且使用 JSON 请求体，故通过 data 传递参数
 * @param {BatchIdsParams} params - 参数，包含合并的工单ID列表
 * @returns {Promise<any>} 接口返回结果
 * @since 2026-09-24
 */
export async function mergeWorkSheet(params: BatchIdsParams) {
  return requestClient.get<any>(
    `${VITE_GLOB_MES_MAIN}/plan/syPlanSheet/mergeWorkSheet`,
    { data: params },
  );
}

/**
 * 分页查询喷码模板列表
 * @param {PrintCodeTemplateQueryParams} params - 查询参数，包含产品组编号、喷码编号、区分、销售类型等
 * @returns {Promise<PrintCodeTemplateResult>} 喷码模板分页数据
 * @since 2026-09-24
 */
export async function getPrintCodeTemplateList(
  params: PrintCodeTemplateQueryParams,
) {
  return requestClient.get<PrintCodeTemplateResult>(
    `${VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/list?${qs.stringify(params)}`,
  );
}

/**
 * 根据喷码编号获取预览效果
 * @param {string} printCode - 喷码模板编号
 * @returns {Promise<string[]>} 喷码预览内容列表
 * @since 2026-09-24
 */
export async function previewByPrintCode(printCode: string) {
  return requestClient.get<string[]>(
    `${VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/previewByPrintCode?${qs.stringify({ printCode })}`,
  );
}
