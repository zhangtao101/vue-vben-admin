/**
 * [INPUT]: 依赖 #/api/request 的 requestClient 客户端，qs 参数序列化工具
 * [OUTPUT]: 对外提供 工时分配（分配对象分页查询、工单序列加载、按占比分配、确认/取消确认/重新推送 SAP、修改分配值、导出）接口函数
 * [POS]: 属于 productionReport 生产报表模块的 API 服务，供工时分配页面调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-13 00:00:00
 */
// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 工时分配对象列表查询参数。
 * areaGroup 对应工作区（产线组）；workAreaCode/workAreaName 对应子产线编码/子产线名称。
 */
export interface PersonTimeAssignParams {
  /** 分配日期，如 2026-08-10 */
  assignDate?: string;
  /** 区分代码：TP01 设备工时，TP02 人员工时 */
  distCode?: string;
  /** 产线编码；选择产线后用于筛选分配对象 */
  produceLineCode?: string;
  /** 子产线编码 */
  subProduceLineCode?: string;
  /** 班组编码 */
  shiftCode?: string;
  /** 产线组/工作区编码 */
  areaGroup?: string;
  /** 确认状态：0 未确认，1 已确认 */
  status?: number;
  /** 传送状态：0 待传送，1 已传送 */
  transferFlag?: number;
  /** 错误状态：0 无错误，1 有错误 */
  errorFlag?: number;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 工时分配对象实体。
 * 其中 id 为分配对象 ID，前端选择分配对象后传给后续接口。
 */
export interface PersonTimeAssign {
  /** 分配对象 ID，选择上方分配对象后传给后续接口 */
  id?: number;
  /** 分配编号 */
  assignNo?: string;
  /** 区分代码：TP01 设备工时，TP02 人员工时 */
  distCode?: string;
  /** 区分名称 */
  distName?: string;
  /** 分配序号 */
  assignSeq?: string;
  /** 分配日期 */
  assignDate?: string;
  /** 确认状态：0 未确认，1 已确认 */
  status?: number;
  /** 产线组/工作区编码 */
  areaGroup?: string;
  /** 子产线编码 */
  subProduceLineCode?: string;
  /** 子产线名称 */
  subProduceLineName?: string;
  /** 产线编码 */
  produceLineCode?: string;
  /** 产线名称 */
  produceLineName?: string;
  /** 班组编码 */
  shiftCode?: string;
  /** 班组名称 */
  shiftName?: string;
  /** 分配对象值；TP01 为设备工时，TP02 为人员工时 */
  assignTargetValue?: number;
  /** SAP 传送状态：0 待传送，1 已传送 */
  transferFlag?: number;
  /** 传送时间，未传送时为空 */
  transferTime?: string;
  /** 错误状态：0 无错误，1 有错误 */
  errorFlag?: number;
  /** 错误信息，无错误时为空 */
  errorMsg?: string;
  /** 确认人，未确认时为空 */
  confirmUser?: string;
  /** 确认时间，未确认时为空 */
  confirmTime?: string;
}

/**
 * 工单序列（生产指示）实体。
 * 按报工完成数量占比分配，allocationRatio 为后端计算的占比，assignedQty 为分配量。
 */
export interface PersonTimeAssignInstruction {
  /** 工单主键 ID */
  id?: number;
  /** 分配明细 ID；执行分配后生成，修改分配量时使用 */
  detailId?: number;
  /** 当前单条分配对象 ID；尚未分配时为空 */
  assignId?: number;
  /** 作业指示/工单编号 */
  instructionNo?: string;
  /** 产线编码 */
  produceLineCode?: string;
  /** 产线名称 */
  produceLineName?: string;
  /** 产品编码 */
  productCode?: string;
  /** 产品名称 */
  productName?: string;
  /** 工单报工完成数量；分配比例的计算基数 */
  finishQty?: number;
  /** 分配占比，由后端按本次所选工单的报工完成数量占比计算；例如 0.25 表示 25% */
  allocationRatio?: number;
  /** 分配量；单条明细调整时只允许修改此字段 */
  assignedQty?: number;
  /** 生产日期 */
  produceDate?: string;
}

// ========== 分配对象查询 ==========

/**
 * 分页查询分配对象列表。
 * @param params - 查询参数，包含分配日期、区分代码、产线/子产线/班组/工作区及状态与分页信息。
 * @returns 返回 { results, total, count } 结构的分配对象分页数据。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function getPersonTimeAssignList(params: PersonTimeAssignParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-distribution/list?${qs.stringify(params)}`,
  );
}

/**
 * 加载单条分配对象对应的工单序列（须先在上方列表单选一条分配对象，将其 id 作为 assignId 传入）。
 * @param assignId - 分配对象 ID，必须先在上方列表单选一条记录。
 * @returns 返回工单序列数组，元素包含工单编号、产品、报工完成数量、分配占比、分配量等字段。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function getAssignProductionInstructions(assignId: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-distribution/production-instructions?${qs.stringify({ assignId })}`,
  );
}

// ========== 分配操作 ==========

/**
 * 按报工完成数量占比分配（前端只传分配对象 ID 和勾选的生产指示 ID 列表，占比及分配量均由后端计算）。
 * @param params - 请求体，包含分配对象 ID assignId 与参与分配的生产指示 ID 数组 instructionIds。
 * @returns 返回分配后的明细数组，其中 allocationRatio 为计算后的占比，assignedQty 为分配量。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function distributePersonTimeAssign(params: {
  assignId: number;
  instructionIds: number[];
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-distribution/distribute`,
    params,
  );
}

/**
 * 确认分配结果（保存分配明细后单条确认，并触发 SAP 内容推送）。
 * @param id - 单条分配对象 ID。
 * @returns 返回处理后的单条分配对象，字段与列表行一致。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function confirmPersonTimeAssign(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-distribution/confirm`,
    { id },
  );
}

/**
 * 取消确认（仅 transferFlag=1 已传送的单条记录允许取消，触发 SAP 消息撤回）。
 * @param id - 单条分配对象 ID。
 * @returns 返回处理后的单条分配对象，字段与列表行一致。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function cancelConfirmPersonTimeAssign(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-distribution/cancel-confirm`,
    { id },
  );
}

/**
 * 重新推送 SAP（仅 errorFlag=1 推送失败的单条记录允许重新推送）。
 * @param id - 单条分配对象 ID。
 * @returns 返回处理后的单条分配对象，字段与列表行一致。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function retransferPersonTimeAssign(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-distribution/retransfer`,
    { id },
  );
}

/**
 * 修改生产指示分配值（修改已经生成的单条分配明细，未执行分配、detailId 为空时不能修改）。
 * @param params - 请求体，包含修改后的分配值 assignedValue 与分配明细 ID detailId。
 * @returns 返回修改后的工单明细数据。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function updatePersonTimeAssignValue(params: {
  assignedValue: number;
  detailId: number;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-distribution/assigned-value/update`,
    params,
  );
}

// ========== 导出功能 ==========

/**
 * 导出分配对象 Excel（按查询条件生成，返回动态生成的完整下载 URL）。
 * @param params - 导出条件参数，与查询列表一致。
 * @returns 返回导出文件的完整下载 URL，可直接通过浏览器访问下载。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function exportPersonTimeAssign(params: PersonTimeAssignParams) {
  return requestClient.get<string>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-distribution/export?${qs.stringify(params)}`,
  );
}

/**
 * 导出单条分配对象的工单分配明细 Excel（返回动态生成的完整下载 URL）。
 * @param assignId - 单条分配对象 ID。
 * @returns 返回导出文件的完整下载 URL，可直接通过浏览器访问下载。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function exportAssignProductionInstructions(assignId: number) {
  return requestClient.get<string>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-distribution/production-instructions/export?${qs.stringify({ assignId })}`,
  );
}
