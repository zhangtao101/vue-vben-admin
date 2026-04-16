// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 备件管理相关 ==========

/**
 * 备件管理接口参数
 */
export interface SparePartParams {
  spareCode?: string;
  spareName?: string;
  spareType?: string;
  equipmentGroup?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 备件消耗记录参数
 */
export interface ConsumptionParams {
  spareCode?: string;
  spareName?: string;
  equipmentCode?: string;
  workOrderNo?: string;
  workOrderType?: string;
  applicant?: string;
  status?: string;
  startTime?: number;
  endTime?: number;
}

/**
 * 备件实体
 */
export interface SparePart {
  id?: number;
  spareCode?: string;
  spareName?: string;
  spareModel?: string;
  spareType?: string;
  equipmentGroup?: string;
  unit?: string;
  price?: number;
  safetyStock?: number;
  currentStock?: number;
  storageLocation?: string;
  supplier?: string;
  status?: string;
  remark?: string;
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
}

/**
 * 备件消耗记录
 */
export interface Consumption {
  id?: number;
  consumptionNo?: string;
  spareCode?: string;
  spareName?: string;
  spareModel?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  equipmentCode?: string;
  equipmentName?: string;
  workOrderNo?: string;
  workOrderType?: string;
  applicant?: string;
  applyTime?: string;
  status?: string;
  approver?: string;
  approveTime?: string;
  remark?: string;
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
}

// ========== 备件基础操作 ==========

/**
 * 分页查询备件列表
 */
export async function getSparePartPage(params: SparePartParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 查询备件列表（不分页）
 */
export async function getSparePartList(params?: {
  equipmentGroup?: string;
  spareCode?: string;
  spareName?: string;
  spareType?: string;
  status?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 查询备件详情
 */
export async function getSparePartById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/${id}`,
  );
}

/**
 * 根据编码查询备件
 */
export async function getSparePartByCode(spareCode: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/code/${spareCode}`,
  );
}

/**
 * 根据设备组查询备件
 */
export async function getSparePartByEquipmentGroup(equipmentGroup: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/by-equipment-group/${equipmentGroup}`,
  );
}

/**
 * 根据类型查询备件
 */
export async function getSparePartByType(spareType: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/by-type/${spareType}`,
  );
}

/**
 * 获取所有备件类型
 */
export async function getSparePartTypes() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/types`,
  );
}

/**
 * 获取所有设备组
 */
export async function getSparePartEquipmentGroups() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/equipment-groups`,
  );
}

// ========== 备件 CRUD 操作 ==========

/**
 * 创建备件
 */
export async function createSparePart(params: {
  equipmentGroup?: string;
  spareCode: string;
  spareModel?: string;
  spareName: string;
  spareType?: string;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/create`,
    params,
  );
}

/**
 * 更新备件
 */
export async function updateSparePart(params: {
  equipmentGroup?: string;
  id: number;
  spareModel?: string;
  spareName?: string;
  spareType?: string;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/update`,
    params,
  );
}

/**
 * 删除备件
 */
export async function deleteSparePart(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/${id}`,
  );
}

/**
 * 报废备件
 */
export async function scrapSparePart(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/scrap/${id}`,
  );
}

/**
 * 调整库存（正数为增加，负数为减少）
 */
export async function adjustSparePartStock(id: number, quantity: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/adjust-stock?id=${id}&quantity=${quantity}`,
  );
}

// ========== 备件消耗管理 ==========

/**
 * 查询备件消耗记录列表
 */
export async function getConsumptionList(params?: ConsumptionParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/consumption/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 查询备件消耗记录详情
 */
export async function getConsumptionById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/consumption/${id}`,
  );
}

/**
 * 创建备件消耗记录
 */
export async function createConsumption(params: {
  applicant?: string;
  applyTime?: string;
  equipmentCode?: string;
  equipmentName?: string;
  quantity: number;
  remark?: string;
  spareCode: string;
  spareName?: string;
  workOrderNo?: string;
  workOrderType?: string;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/consumption/create`,
    params,
  );
}

/**
 * 更新备件消耗记录
 */
export async function updateConsumption(params: Consumption) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/consumption/update`,
    params,
  );
}

/**
 * 删除备件消耗记录
 */
export async function deleteConsumption(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/consumption/${id}`,
  );
}

/**
 * 审核通过备件消耗记录
 */
export async function approveConsumption(id: number, approver?: string) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/consumption/approve/${id}?${qs.stringify({ approver })}`,
  );
}

/**
 * 拒绝备件消耗记录
 */
export async function rejectConsumption(id: number, approver?: string) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/consumption/reject/${id}?${qs.stringify({ approver })}`,
  );
}

/**
 * 备件消耗统计
 */
export async function getConsumptionStatistics(params?: {
  endTime?: number;
  startTime?: number;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/consumption/statistics?${qs.stringify(params || {})}`,
  );
}

/**
 * 备件消耗报表
 */
export async function getConsumptionReport(params?: {
  applicant?: string;
  endTime?: number;
  equipmentCode?: string;
  spareType?: string;
  startTime?: number;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-part/consumption/report?${qs.stringify(params || {})}`,
  );
}
