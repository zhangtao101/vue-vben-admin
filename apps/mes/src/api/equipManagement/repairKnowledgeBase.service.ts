// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 维修知识库相关 ==========

/**
 * 维修知识库接口参数
 */
export interface RepairKnowledgeParams {
  pmCode?: string;
  title?: string;
  equipmentGroup?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 维修知识库实体
 */
export interface RepairKnowledge {
  id?: number;
  pmCode?: string;
  title?: string;
  source?: string;
  tags?: string;
  content?: string;
  equipmentGroup?: string;
  status?: string;
  createdBy?: string;
  createdTime?: string;
  updatedTime?: string;
}

/**
 * 分页查询知识库列表
 */
export async function getRepairKnowledgePage(params: RepairKnowledgeParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 查询知识详情
 */
export async function getRepairKnowledgeById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/${id}`,
  );
}

/**
 * 查询知识库列表（不分页）
 */
export async function getRepairKnowledgeList(params?: {
  equipmentGroup?: string;
  pmCode?: string;
  status?: string;
  title?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 按设备组查询知识
 */
export async function getRepairKnowledgeByEquipmentGroup(equipmentGroup: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/by-equipment-group/${equipmentGroup}`,
  );
}

/**
 * 搜索知识
 */
export async function searchRepairKnowledge(keyword: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/search?keyword=${encodeURIComponent(keyword)}`,
  );
}

/**
 * 新建知识
 */
export async function createRepairKnowledge(params: {
  content?: string;
  equipmentGroup?: string;
  source?: string;
  tags?: string;
  title: string;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/create`,
    params,
  );
}

/**
 * 更新知识
 */
export async function updateRepairKnowledge(params: RepairKnowledge) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/update`,
    params,
  );
}

/**
 * 删除知识
 */
export async function deleteRepairKnowledge(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/${id}`,
  );
}

/**
 * 启用知识
 */
export async function enableRepairKnowledge(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/enable/${id}`,
  );
}

/**
 * 禁用知识
 */
export async function disableRepairKnowledge(id: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge/disable/${id}`,
  );
}
