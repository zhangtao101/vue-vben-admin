// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分页查询产线列表（用于下拉数据源）
 * @param params 查询参数
 * @param params.groupId 生产区 id
 * @param params.lineName 产线名称
 * @param params.lineCode 产线编号
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页结果 { list, total }
 * @since 2026-08-29
 */
export function listProductionLines(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/searchLine?${qs.stringify(params)}`,
  );
}

/**
 * 查找所有区域（用于下拉数据源）
 * @param params 查询参数，areaCode 可选（不带也能查询）
 * @returns 区域列表 { list, total }
 * @since 2026-08-29
 */
export function searchAreas(params?: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/area/search?${qs.stringify(params ?? {})}`,
  );
}

/**
 * 获取等级（用于下拉数据源）
 * @param params 查询参数，gradeCode 可选（不带也能查询）
 * @returns 等级列表 { list, total }
 * @since 2026-08-29
 */
export function searchGrades(params?: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/grade/search?${qs.stringify(params ?? {})}`,
  );
}
