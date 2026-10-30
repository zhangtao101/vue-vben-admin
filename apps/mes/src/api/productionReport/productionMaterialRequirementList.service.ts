/**
 * [INPUT]: 依赖 #/api/request 的 requestClient 客户端，qs 参数序列化工具
 * [OUTPUT]: 对外提供 生产物料需求清单 的查询、导出、保存、传送 接口函数
 * [POS]: 属于 productionReport 生产报表模块的 API 服务，供生产物料需求清单页面调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-10-29 00:00:00
 */
// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/** 生产物料需求清单记录 */
export interface MaterialRequirementRecord {
  /** 出库请求号码 */
  applyCode: string;
  /** 请求日期 */
  applyDate: string;
  /** 请求数量 */
  applyNumber: number;
  /** 编号ID */
  id: number;
  /** SAP 物料需求量 */
  itemQty: number;
  /** 物料代码 */
  materialCode: string;
  /** 物料名称 */
  materialName: string;
  /** SAP 工单序列 */
  poOderCode: string;
  /** 已出库数量 */
  receiveNumber: number;
  /** 状态：1 生成，2 完成 */
  status: number;
  /** 状态说明 */
  statusDesc: string;
  /** 库存数量 */
  stockQuality: number;
  /** 单位 */
  unit: string;
  /** 请求仓库（AUT 自动仓库） */
  warehouseCode: string;
  /** 请求仓库名称 */
  warehouseName: string;
  /** 工单号（作业指示号码） */
  worksheetCode: string;
  /** WMS 传输与否：-1 未传输，1 已传输 */
  wmsStatus: number;
  /** WMS 传输与否说明 */
  wmsStatusDesc: string;
}

/** 生产物料需求清单查询参数 */
export interface MaterialRequirementQueryParams {
  /** 请求日期结束 */
  endDate?: string;
  /** 物料代码（品号） */
  materialCode?: string;
  /** 页码 */
  pageNum: number;
  /** 每页展示条数 */
  pageSize: number;
  /** 请求日期开始 */
  startDate?: string;
  /** 请求仓库（AUT 自动仓库） */
  warehouseCode?: string;
  /** WMS 传输与否：-1 未传输，1 已传输 */
  wmsStatus?: number;
  /** 工单号（作业指示号码） */
  worksheetCode?: string;
}

/** 生产物料需求清单分页结果 */
export interface MaterialRequirementPageResult {
  /** 记录总数 */
  count: number;
  /** 记录列表 */
  results: MaterialRequirementRecord[];
  /** 分页总数 */
  total: number;
}

/**
 * 生产物料需求清单查询（分页）。
 * @param {MaterialRequirementQueryParams} params - 查询参数，包含必填的 pageNum、pageSize 与可选的请求日期、仓库、传输状态、工单号、品号。
 * @returns {Promise<MaterialRequirementPageResult>} 返回 { total, count, results } 结构的分页数据。
 * @throws {Error} 请求失败或业务状态码非 200 时抛出异常。
 * @since 2026-10-29 00:00:00
 */
export function queryMaterialRequirementList(
  params: MaterialRequirementQueryParams,
) {
  return requestClient.get<MaterialRequirementPageResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/worksheetApplyRecord/queryList?${qs.stringify(params)}`,
  );
}

/**
 * 生产物料需求清单导出。
 * @param {MaterialRequirementQueryParams} params - 导出参数，与查询参数一致。
 * @returns {Promise<string>} 返回导出文件的下载地址。
 * @throws {Error} 请求失败或业务状态码非 200 时抛出异常。
 * @since 2026-10-29 00:00:00
 */
export function exportMaterialRequirementExcel(
  params: MaterialRequirementQueryParams,
) {
  return requestClient.get<string>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/worksheetApplyRecord/exportExcel?${qs.stringify(params)}`,
  );
}

/**
 * 生产物料需求清单保存。
 * @param {MaterialRequirementRecord[]} records - 清单记录数组，id 为空表示新增。
 * @returns {Promise<null>} 保存成功返回 null。
 * @throws {Error} 请求失败或业务状态码非 200 时抛出异常。
 * @since 2026-10-29 00:00:00
 */
export function saveMaterialRequirement(records: MaterialRequirementRecord[]) {
  return requestClient.post<null>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/worksheetApplyRecord/save`,
    records,
  );
}

/**
 * 生产物料需求清单传送（按选中记录 id 批量传送给 WMS）。
 * @param {(number | string)[]} ids - 选中记录 id 数组，如 [1, 9]。
 * @returns {Promise<null>} 传送成功返回 null。
 * @throws {Error} 请求失败或业务状态码非 200 时抛出异常。
 * @since 2026-10-29 00:00:00
 */
export function transferMaterialRequirement(ids: (number | string)[]) {
  return requestClient.post<null>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/worksheetApplyRecord/transfer`,
    ids,
  );
}
