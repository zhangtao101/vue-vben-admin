// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 备件出入库管理相关 ==========

/**
 * 单据类型
 */
export type OrderType = 'IN' | 'OUT';

/**
 * 审核状态
 */
export type OrderStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

/**
 * 出入库单据查询参数
 */
export interface SpareOrderParams {
  orderNo?: string;
  orderType?: OrderType;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 出入库单据明细
 */
export interface SpareOrderDetail {
  spareCode?: string;
  spareName?: string;
  spareModel?: string;
  equipmentGroup?: string;
  quantity?: number;
}

/**
 * 出入库单据
 */
export interface SpareOrder {
  id?: number;
  orderNo?: string;
  orderName?: string;
  orderType?: OrderType;
  orderDate?: string;
  recipient?: string;
  status?: OrderStatus;
  details?: SpareOrderDetail[];
}

/**
 * 创建出入库单据参数
 */
export interface CreateSpareOrderParams {
  orderName: string;
  orderType: OrderType;
  orderDate: string;
  recipient?: string;
  details: Array<{
    quantity: number;
    spareCode: string;
  }>;
}

/**
 * 更新出入库单据参数
 */
export interface UpdateSpareOrderParams {
  id: number;
  orderName?: string;
  orderType?: OrderType;
  orderDate?: string;
  recipient?: string;
  details?: Array<{
    quantity: number;
    spareCode: string;
  }>;
}

// ========== 出入库单据操作 ==========

/**
 * 分页查询出入库单据
 */
export async function getSpareOrderPage(params: SpareOrderParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-order/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 根据ID查询单据详情
 */
export async function getSpareOrderById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-order/${id}`,
  );
}

/**
 * 创建出入库单据
 */
export async function createSpareOrder(params: CreateSpareOrderParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-order/create`,
    params,
  );
}

/**
 * 更新出入库单据
 */
export async function updateSpareOrder(params: UpdateSpareOrderParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-order/update`,
    params,
  );
}

/**
 * 删除出入库单据
 */
export async function deleteSpareOrder(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-order/${id}`,
  );
}

/**
 * 批量审核通过
 */
export async function batchApproveSpareOrder(ids: number[]) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-order/batch-approve`,
    ids,
  );
}

/**
 * 批量审核不通过
 */
export async function batchRejectSpareOrder(ids: number[]) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-order/batch-reject`,
    ids,
  );
}
