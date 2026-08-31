// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 落面记录新增
 * @param data 提交数据
 * @param data.areaCode 区域编号
 * @param data.areaName 区域名称
 * @param data.gradeCode 等级编号
 * @param data.gradeName 等级名称
 * @param data.lineCode 产线编号
 * @param data.lineName 产线名称
 * @param data.productionDate 生产日期
 * @param data.quantity 数量
 * @param data.remark 备注
 * @param data.unit 单位
 * @param data.shift 班别
 * @param data.userCode 用户编号
 * @param data.userName 用户名称
 * @returns 操作结果
 * @since 2026-08-29
 */
export function addNoodleSpillRecord(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/noodle/spill/record/add`,
    data,
  );
}

/**
 * 展示所有落面记录（分页查询）
 * @param params 查询参数
 * @param params.startTime 开始时间
 * @param params.endTime 结束时间
 * @param params.lineCode 产线编号
 * @param params.areaCode 区域编号
 * @param params.gradeCode 等级编号
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页数据 { total, list }
 * @since 2026-08-29
 */
export function searchNoodleSpillRecord(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/noodle/spill/record/search?${qs.stringify(params)}`,
  );
}

/**
 * 删除落面记录
 * @param id 记录 id
 * @returns 操作结果
 * @since 2026-08-29
 */
export function deleteNoodleSpillRecord(id: number | string) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/noodle/spill/record/delete/${id}`,
  );
}

/**
 * 落面记录修改
 * @param data 提交数据
 * @param data.id id
 * @param data.areaCode 区域编号
 * @param data.areaName 区域名称
 * @param data.gradeCode 等级编号
 * @param data.gradeName 等级名称
 * @param data.lineCode 产线编号
 * @param data.lineName 产线名称
 * @param data.productionDate 生产日期
 * @param data.quantity 数量
 * @param data.remark 备注
 * @param data.unit 单位
 * @returns 操作结果
 * @since 2026-08-29
 */
export function updatePlanQueue(data: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/noodle/spill/record/update`,
    data,
  );
}

/**
 * 增加面机使用明细登记
 * @param data 提交数据
 * @param data.equipCode 面机代码
 * @param data.lineCode 产线编号
 * @param data.lineName 产线名称
 * @param data.productionDate 生产日期
 * @param data.remark 备注
 * @param data.type 设备种类
 * @param data.usageHours 使用时间
 * @returns 操作结果
 * @since 2026-08-29
 */
export function addNoodleMachineUsage(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/noodle/machine/usage/add`,
    data,
  );
}

/**
 * 修改面机使用明细登记
 * @param data 提交数据
 * @param data.id id
 * @param data.equipCode 面机编号
 * @param data.lineCode 产线编号
 * @param data.lineName 产线名称
 * @param data.productionDate 生产日期
 * @param data.remark 备注
 * @param data.type 类型
 * @param data.usageHours 使用时长
 * @returns 操作结果
 * @since 2026-08-29
 */
export function updateNoodleMachineUsage(data: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/noodle/machine/usage/update`,
    data,
  );
}

/**
 * 查询面机使用明细（分页查询）
 * @param params 查询参数
 * @param params.startTime 开始时间
 * @param params.endTime 结束时间
 * @param params.type 面机类型
 * @param params.equipCode 面机代码
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页数据 { total, list }
 * @since 2026-08-29
 */
export function searchNoodleMachineUsage(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/noodle/machine/usage/search?${qs.stringify(params)}`,
  );
}

/**
 * 删除面机使用明细
 * @param id 记录 id
 * @returns 操作结果
 * @since 2026-08-29
 */
export function deleteNoodleMachineUsage(id: number | string) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/noodle/machine/usage/delete/${id}`,
  );
}
