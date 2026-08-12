/**
 * [INPUT]: 依赖 #/api/request 的 requestClient 客户端，qs 参数序列化工具
 * [OUTPUT]: 对外提供 生产 BOM 的物料查询、分页列表、批量新增、批量修改、批量删除 接口函数
 * [POS]: 属于 productionReport 生产报表模块的 API 服务，供生产 BOM 页面调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-12 00:00:00
 */
// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 展示所有生产 BOM（分页查询）。
 * @param {any} params - 分页参数，包含 pageNum 与 pageSize。
 * @returns {Promise<any>} 返回 { total, list } 结构的 BOM 分页数据。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-12 00:00:00
 */
export function getProductBomPageList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/list?${qs.stringify(params)}`,
  );
}

/**
 * 批量增加生产 BOM。
 * @param {any[]} data - BOM 数据数组，元素包含 code、planCode、parentCode、materialCode 等字段。
 * @returns {Promise<any>} 返回批量新增结果。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-12 00:00:00
 */
export function insertProductBom(data: any[]) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/insert`,
    data,
  );
}

/**
 * 批量修改生产 BOM。
 * @param {any[]} data - BOM 数据数组，元素必须包含 id，其余字段为可修改内容。
 * @returns {Promise<any>} 返回批量修改结果。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-12 00:00:00
 */
export function updateProductBom(data: any[]) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/update`,
    data,
  );
}

/**
 * 批量删除生产 BOM。
 * @param {(number | string)[]} ids - 主键 id 数组，如 [1, 2, 3]。
 * @returns {Promise<any>} 返回批量删除结果。
 * @throws {Error} 请求失败时抛出异常。
 * @since 2026-08-12 00:00:00
 */
export function deleteProductBom(ids: (number | string)[]) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/delete?${qs.stringify({ ids: ids.join(',') })}`,
  );
}
