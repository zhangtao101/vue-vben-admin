/**
 * [INPUT]: 依赖 qs、#/api/request 的 requestClient，调用接单大厅接口
 * [OUTPUT]: 对外提供任务数量查询、分页列表、详情查看、接单领取、分配、撤回等 API 函数
 * [POS]: 设备管理-接单大厅模块 的 API 层，被 orderHall.vue 等页面引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-04 09:00:00
 */

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

const PREFIX = `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/task-hall`;

// ========== 接单大厅相关 ==========

/**
 * 查询三类任务数量（报修/点巡检/保养）。
 * @param {Object} [params] - 查询参数。
 * @param {number} [params.status] - 任务页签状态：1进行中、2已完成；不传默认查询进行中。
 * @returns {Promise<any>} 返回包含 REPAIR、INSPECTION、MAINTENANCE 三类任务数量的响应对象。
 * @throws {Error} 网络异常或服务端错误时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function getOrderHallTaskCounts(params?: { status?: number }) {
  return requestClient.get<any>(
    `${PREFIX}/counts?${qs.stringify(params || {})}`,
  );
}

/**
 * 分页查询接单大厅任务列表。
 * @param {Object} params - 查询参数。
 * @param {string} [params.keyword] - 模糊搜索关键字，可匹配任务编号、名称、来源、设备编号和名称。
 * @param {number} [params.pageNum] - 当前页码，从1开始，默认1。
 * @param {number} [params.pageSize] - 每页记录数量，默认20。
 * @param {number} [params.status] - 任务页签状态：1进行中、2已完成；不传默认查询进行中。
 * @param {string} params.taskType - 任务分类：REPAIR报修、INSPECTION点巡检、MAINTENANCE保养。
 * @returns {Promise<any>} 返回包含 results、total、count 的分页响应对象。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function getOrderHallTaskList(params: {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
  status?: number;
  taskType: string;
}) {
  return requestClient.get<any>(
    `${PREFIX}/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 查询任务详情供当前页弹窗显示。
 * @param {Object} params - 查询参数。
 * @param {string} params.taskId - 列表接口返回的任务唯一标识，必须原样传入。
 * @param {string} params.taskType - 任务分类：REPAIR报修、INSPECTION点巡检、MAINTENANCE保养。
 * @returns {Promise<any>} 返回按 taskType 对应的报修、点巡检或保养详情数据。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function getOrderHallTaskDetail(params: {
  taskId: string;
  taskType: string;
}) {
  return requestClient.get<any>(
    `${PREFIX}/detail?${qs.stringify(params)}`,
  );
}

/**
 * 接单或领取任务。
 * 点巡检/保养领取时生成或更新执行记录并绑定当前人员。
 * @param {Object} params - 接单参数。
 * @param {string} params.taskId - 列表接口返回的任务唯一标识，必须原样传入。
 * @param {string} params.taskType - 任务分类：REPAIR执行报修接单，INSPECTION领取点巡检，MAINTENANCE领取保养。
 * @returns {Promise<any>} 返回接单或领取结果，code 200 表示成功。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function claimOrderHallTask(params: {
  taskId: string;
  taskType: string;
}) {
  return requestClient.post<any>(
    `${PREFIX}/claim`,
    params,
  );
}

/**
 * 分配报修任务给指定维修人员。
 * @param {Object} params - 分配参数。
 * @param {string} params.assignedTo - 被分配维修人员的工号。
 * @param {number} params.taskId - 报修维修任务数据库主键，不是报修单号。
 * @returns {Promise<any>} 返回分配结果，code 200 表示成功。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function assignOrderHallRepairTask(params: {
  assignedTo: string;
  taskId: number;
}) {
  return requestClient.post<any>(
    `${PREFIX}/repair/assign`,
    params,
  );
}

/**
 * 撤回报修任务，任务状态恢复为待处理。
 * @param {number} taskId - 需要撤回的报修维修任务数据库主键。
 * @returns {Promise<any>} 返回撤回结果，code 200 表示成功。
 * @throws {Error} 记录不存在或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function withdrawOrderHallRepairTask(taskId: number) {
  return requestClient.post<any>(
    `${PREFIX}/repair/withdraw`,
    { taskId },
  );
}
