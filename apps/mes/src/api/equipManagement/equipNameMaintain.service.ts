// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分页查询设备名称维护列表
 * @param pageNum  当前页码
 * @param pageSize 每页条数
 * @param data     查询/筛选条件
 */
export function queryScadaEquipNamePage(
  pageNum: number,
  pageSize: number,
  data: any,
) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentName/getRoles?pageNum=${pageNum}&pageSize=${pageSize}`,
    data,
  );
}

/**
 * 删除设备名称记录
 * @param query 删除条件（需包含主键等）
 */
export function deleteScadaEquipName(query: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentName/delete?${qs.stringify(query)}`,
  );
}

/**
 * 新增设备名称
 * @param data 设备名称数据
 */
export function insertScadaEquipName(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentName/add`,
    data,
  );
}

/**
 * 根据主键查询设备名称详情
 * @param query 需包含主键字段
 */
export function queryScadaEquipNameById(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentName/selectByPrimaryKey?${qs.stringify(query)}`,
  );
}

/**
 * 更新设备名称
 * @param data 设备名称数据
 */
export function updateScadaEquipName(data: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentName/up`,
    data,
  );
}

/**
 * 判断设备编号是否被引用
 * @param query 需包含设备编号字段
 */
export function queryScadaEquipNameCodeQuote(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentName/codeIsQuote?${qs.stringify(query)}`,
  );
}
