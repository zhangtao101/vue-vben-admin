// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 调试单 ==========

/**
 * 新建调试单
 * @param params approvalStatus 审核状态, attachmentFiles 附件, creator 创建人, equipmentCode 设备编号, orderNo 调试单号, sourceCode 来源采购单号
 */
export async function insertCommOrder(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/commissioningOrder/insert`,
    params,
  );
}

/**
 * 调试单据列表查询
 * @param params pageNum, pageSize, equipmentCode 设备编号, orderNo 调试单号, sourceCode 采购单号
 */
export async function selectCommOrderPage(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/commissioningOrder/selectPageByParams?${qs.stringify(params)}`,
  );
}

/**
 * 修改调试单
 * @param params id 编号, approvalStatus, attachmentFiles, creator, equipmentCode, orderNo, sourceCode
 */
export async function updateCommOrder(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/commissioningOrder/updateById`,
    params,
  );
}

/**
 * 删除调试单
 * @param params id 编号
 */
export async function deleteCommOrder(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/commissioningOrder/deleteById?${qs.stringify(params)}`,
  );
}

/**
 * 审核调试单
 * @param params id 编号, approvalStatus 审核状态
 */
export async function approveCommOrder(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/commissioningOrder/approve`,
    params,
  );
}

// ========== 调试任务 ==========

/**
 * 新增调试任务
 * @param params debugOrderNo 调试单号, debugOrderType 调试单类别, fileName 文件名称, orderId 调试单ID, remark 备注, taskEndTime 结束时间, taskExecutor 调试人员, taskFile 文件ID, taskResult 调试结果, taskStartTime 开始时间
 */
export async function insertCommTask(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/commissioningTask/insert`,
    params,
  );
}

/**
 * 获取调试任务列表
 * @param params orderId 调试工单ID
 */
export async function selectCommTaskByOrderId(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/commissioningTask/selectByOrderId?${qs.stringify(params)}`,
  );
}

/**
 * 修改调试任务
 * @param params id 任务ID, debugOrderNo, debugOrderType, fileName, orderId, remark, taskEndTime, taskExecutor, taskFile, taskResult, taskStartTime
 */
export async function updateCommTask(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/commissioningTask/updateById`,
    params,
  );
}

/**
 * 删除调试任务
 * @param params id 编号
 */
export async function deleteCommTask(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/commissioningTask/deleteById?${qs.stringify(params)}`,
  );
}
