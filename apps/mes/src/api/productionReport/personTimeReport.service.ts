/**
 * [INPUT]: 依赖 #/api/request 的 requestClient 客户端，qs 参数序列化工具
 * [OUTPUT]: 对外提供 人时机时填报 的分页查询、批量保存、批量删除、批量复制、导出、级联选项 接口函数
 * [POS]: 属于 productionReport 生产报表模块的 API 服务，供人时机时填报页面调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-13 00:00:00
 */
// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 人时机时填报查询参数
 */
export interface PersonTimeReportParams {
  produceDate?: string;
  produceLineGroupCode?: string;
  produceLineCode?: string;
  subProduceLineCode?: string;
  workGroupCode?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 人时机时填报实体
 */
export interface PersonTimeReport {
  id?: number;
  produceDate?: string;
  produceLineGroupCode?: string;
  produceLineGroupName?: string;
  subProduceLineId?: number;
  subProduceLineCode?: string;
  subProduceLineName?: string;
  produceLineCode?: string;
  produceLineName?: string;
  workGroupCode?: string;
  workGroupName?: string;
  totalTimeMinutes?: number;
  totalPersons?: number;
  totalPersonTimeMinutes?: number;
  remark?: string;
}

/**
 * 组织架构下拉选项（工作区/产线/子产线/班组通用）。
 * id 为选项主键，用于查询下一级；code 为选项编码，保存填报时使用；name 为选项名称，只回显不可手工修改。
 */
export interface PersonTimeOrgOption {
  id?: number;
  code?: string;
  name?: string;
}

// ========== 人时机时填报查询 ==========

/**
 * 查询填报列表（分页）。
 * @param params - 查询参数，包含生产日期、工作区、产线、子产线、班组及分页信息。
 * @returns 返回 { results, total, count } 结构的填报分页数据。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function getPersonTimeReportPageList(params: PersonTimeReportParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-report/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询工作区下拉选项（页面加载工作区时调用，无请求参数）。
 * @returns 返回工作区选项数组，元素包含 id（选项主键，用于查询下一级）、code（选项编码，保存填报时使用）、name（选项名称）。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function getProduceLineGroups() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-report/organization/produce-line-groups`,
  );
}

/**
 * 根据工作区编码查询产线子级（选择工作区后调用）。
 * @param params - 查询参数，包含工作区编码 produceLineGroupCode。
 * @returns 返回产线选项数组，元素包含 id、code、name。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function getProduceLines(params: { produceLineGroupCode: string }) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-report/organization/produce-lines?${qs.stringify(params)}`,
  );
}

/**
 * 根据产线编码查询子产线子级（选择产线后调用）。
 * @param params - 查询参数，包含产线编码 produceLineCode。
 * @returns 返回子产线选项数组，元素包含 id、code、name。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function getSubProduceLines(params: { produceLineCode: string }) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-report/organization/sub-produce-lines?${qs.stringify(params)}`,
  );
}

/**
 * 根据子产线编码查询班组子级（选择子产线后调用，最后一级）。
 * @param params - 查询参数，包含子产线编码 subProduceLineCode。
 * @returns 返回班组选项数组，元素包含 id、code、name。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function getWorkGroups(params: { subProduceLineCode: string }) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-report/organization/work-groups?${qs.stringify(params)}`,
  );
}

// ========== 人时机时填报操作 ==========

/**
 * 批量保存填报（表格统一保存；id 为空表示新增，id 有值表示修改）。
 * @param data - 填报数据数组，元素需包含 produceDate、produceLineGroupCode、subProduceLineCode、produceLineCode、workGroupCode、totalTimeMinutes、totalPersons、subProduceLineId。
 * @returns 返回保存后的填报记录数组。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function savePersonTimeReport(data: any[]) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-report/save`,
    data,
  );
}

/**
 * 批量删除填报（勾选一行或多行，删除确认后调用）。
 * @param ids - 填报记录 ID 数组，如 [1, 2, 3]。
 * @returns 返回已删除 ID 数组。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function deletePersonTimeReport(ids: number[]) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-report/batch`,
    { data: ids },
  );
}

/**
 * 批量复制填报（支持单选或多选，将所选记录复制到目标日期）。
 * @param params - 源记录 ID 数组 sourceIds 与目标生产日期 targetDate。
 * @returns 返回复制后的填报记录数组。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function copyPersonTimeReport(params: {
  sourceIds: number[];
  targetDate: string;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-report/copy/batch`,
    params,
  );
}

// ========== 导出功能 ==========

/**
 * 导出人时机时填报 Excel（按当前页面查询条件导出）。
 * @param params - 导出条件参数，与查询列表一致。
 * @returns 返回导出文件的下载地址，如 http://xxx/a.excel，可直接通过浏览器访问下载。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-13 00:00:00
 */
export function exportPersonTimeReport(params: PersonTimeReportParams) {
  return requestClient.get<string>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/working-hour-report/export?${qs.stringify(params)}`,
  );
}
