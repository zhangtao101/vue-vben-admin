/**
 * [INPUT]: 依赖 #/api/request 的 requestClient 客户端，qs 参数序列化工具
 * [OUTPUT]: 对外提供 物料投入数量（按 lot/工单分页查询投料数据、已完成工单下拉、按物料编码查询已分配数据、修改差值、修改物料投入量、发送、SAP可用性检查）接口函数
 * [POS]: 属于 productionReport 生产报表模块的 API 服务，供物料投入数量页面调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-11-11 00:00:00
 */
// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 物料投入数量列表查询参数（根据工单id展示所有数据） */
export interface MesInputQuantityParams {
  /** 工单id */
  workSheetId?: number;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 物料投入数量明细行 */
export interface MesInputQuantityItem {
  /** 生产日期，如 20261031 */
  orddat: string;
  /** 中心，如 CW01 */
  wareky: string;
  /** 投料料号 */
  skukey: string;
  /** 投料量 */
  qtyord: number;
  /** 单位，如 KG */
  uomkey: string;
  /** SAP工厂编号，如 CN01 */
  swerks: string;
  /** SAP仓库 */
  slgort: null | string;
  /** 出库仓库 */
  gift: null | string;
  /** 产线编号 */
  orderCs: null | string;
  /** 投料托盘编号 */
  trnuid: string;
  /** 原材料投入对象 */
  matnr: string;
  /** 预估差值 */
  allocQty: null | number;
  /** 行 id（ifseq），修改差值/投入量/发送时使用 */
  ifseq?: number;
  /** 接口返回的附加字段 */
  [key: string]: any;
}

/** 物料投入数量分页结果 */
export interface MesInputQuantityPage<T = MesInputQuantityItem> {
  /** 总条数 */
  total: number;
  /** 当前页明细 */
  list: T[];
  /** 页码 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
  /** 是否最后一页 */
  isLastPage?: boolean;
  /** 是否还有下一页 */
  hasNextPage?: boolean;
}

/** 已完成工单项 */
export interface EndWorkSheetItem {
  /** 工单ID */
  id: number;
  /** 工单编号 */
  workSheetCode: string;
}

/** 已完成工单查询参数 */
export interface EndWorkSheetParams {
  /** 指示时间，格式 yyyy-MM-dd */
  planDateStart?: string;
  /** 工序 */
  processType?: number;
  /** 产品编号 */
  productCode?: string;
}

/** 按周查询工单参数 */
export interface WeekWorkSheetParams {
  /** 产线名称 */
  lineName?: string;
  /** 工序：混合水 1，无重力搅拌 6 */
  processType?: number;
  /** 指示日期，格式 yyyy-MM-dd */
  planDateStart?: string;
  /** 开始时间，格式 yyyy-MM-dd */
  startTime?: string;
  /** 结束时间，格式 yyyy-MM-dd */
  endTime?: string;
  /** 产品编号 */
  productCode?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 按周查询工单明细行 */
export interface WeekWorkSheetItem {
  /** 工单 id */
  id?: number;
  /** 工单号 */
  workSheetCode?: string;
  /** 产品名称 */
  productName?: string;
  /** 产品编号 */
  productCode?: string;
  /** 指示日期 */
  planDateStart?: string;
  /** 产线名称 */
  lineName?: string;
  /** 产线编号 */
  lineCode?: string;
  /** 工序（不展示） */
  processType?: number;
  /** 优先级 */
  priority?: null;
  /** 指示批次 */
  indicateBatch?: number;
  /** 生产批次 */
  produceBatch?: number;
  /** 剩余批次 */
  remainBatch?: number;
  /** 单位 */
  unit?: null;
  /** 接口返回的附加字段 */
  [key: string]: any;
}

/** 已分配数据查询参数（trnuid 为物料编码） */
export interface AllocatedParams {
  /** 物料编码 */
  trnuid?: string;
  /** 工单id */
  workSheetId?: number;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 已分配数据明细行 */
export interface AllocatedItem {
  /** 行 id（ifseq），修改时使用 */
  ifseq: number;
  /** 来源系统 */
  system: string;
  /** 类型，直接写生产投入 */
  ordtyp: string;
  /** SAP指示单号 */
  ordnum: null | string;
  /** SAP指示单号项号 */
  orditm: string;
  /** 生产日期 */
  orddat: string;
  /** 中心 */
  wareky: string;
  /** 投料料号 */
  skukey: string;
  /** 投料量 */
  qtyord: number;
  /** 单位 */
  uomkey: string;
  /** SAP工厂编号 */
  swerks: string;
  /** SAP仓库 */
  slgort: null | string;
  /** 出库仓库 */
  gift: null | string;
  /** 产线编号 */
  orderCs: null | string;
  /** 投料托盘编号 */
  trnuid: string;
  /** 材料投入对象 */
  matnr: string;
  /** 物料可用性 */
  sflag: string;
  /** 信息 */
  message: string;
  /** 发送状态 */
  ifProcessFlag: string;
  /** 发送信息 */
  ifErrorMsg: string;
}

/** 修改差值参数项 */
export interface UpdateAllocQtyItem {
  /** 行 id（ifseq） */
  ifseq: number;
  /** 预估差值 */
  allocQty: number;
}

/** 修改物料投入量参数项 */
export interface UpdateQtyItem {
  /** 行 id（ifseq） */
  ifseq: number;
  /** 物料投入量 */
  qtyord: number;
}

// ========== 列表查询 ==========

/**
 * 根据工单id展示所有数据（分页）
 */
export async function getMesInputQuantityList(
  params: MesInputQuantityParams,
): Promise<MesInputQuantityPage> {
  return requestClient.get<MesInputQuantityPage>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/ifmes113Sum/select?${qs.stringify(params)}`,
  );
}

/**
 * 获取已完成工单（下拉用）
 */
export async function getEndWorkSheets(
  params?: EndWorkSheetParams,
): Promise<EndWorkSheetItem[]> {
  return requestClient.get<EndWorkSheetItem[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/output/selectEndWorkSheet?${qs.stringify(params)}`,
  );
}

/**
 * 根据物料编码找到对应数据（分页）
 */
export async function getAllocatedList(
  params: AllocatedParams,
): Promise<AllocatedItem[]> {
  return requestClient.get<AllocatedItem[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/ifmes113Sum/selectAllocated?${qs.stringify(params)}`,
  );
}

/**
 * 展示所有工单（按周查询，分页）
 */
export async function getWeekWorkSheets(
  params: WeekWorkSheetParams,
): Promise<MesInputQuantityPage<WeekWorkSheetItem>> {
  return requestClient.get<MesInputQuantityPage<WeekWorkSheetItem>>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workSheet/lot/selectWeek?${qs.stringify(params)}`,
  );
}

// ========== 单据操作 ==========

/**
 * 修改差值（批量）
 */
export async function updateAllocQty(items: UpdateAllocQtyItem[]) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/ifmes113Sum/updateAllocQty`,
    items,
  );
}

/**
 * 修改物料投入量（批量）
 */
export async function updateIfwms113Qty(items: UpdateQtyItem[]) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/ifmes113Sum/updateIfwms113Qty`,
    items,
  );
}

/**
 * 发送（按行 id 批量）
 */
export async function sendMesInputQuantity(ids: number[]) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/ifmes113Sum/send`,
    ids,
  );
}

// ========== SAP 操作 ==========

/**
 * SAP可用性检查
 */
export async function pushIwipConDat(workSheetId: number) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iwipConDat/push?${qs.stringify({ workSheetId })}`,
  );
}
