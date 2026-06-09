// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/**
 * 维修措施查询参数
 */
export interface FaultManualListParams {
  manualCode?: string;
  manualName?: string;
  faultTreeName?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 维修措施记录
 */
export interface FaultManualRecord {
  id?: number;
  manualCode?: string;
  manualName?: string;
  faultTreeName?: string;
  manualContent?: string;
  remark?: string;
}

/**
 * 维修措施创建参数
 */
export interface CreateFaultManualParams {
  manualCode: string;
  manualName: string;
  faultTreeName: string;
  manualContent: string;
  remark?: string;
}

/**
 * 维修措施更新参数
 */
export interface UpdateFaultManualParams extends CreateFaultManualParams {
  id: number;
}

/**
 * 导入结果
 */
export interface ImportResult {
  total: number;
  successCount: number;
  failCount: number;
  errors: string[];
}

// ========== 导入 ==========

/**
 * 设备维修措施导入（Excel）
 */
export async function importEquipRepairMeasure(formData: FormData) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/import/repair-measure`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
}

// ========== 列表查询 ==========

/**
 * 分页查询设备维修措施列表
 */
export async function listEquipFaultManualPage(params: FaultManualListParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-manual/list-page?${qs.stringify(params)}`,
  );
}

// ========== 单条操作 ==========

/**
 * 查询设备维修措施详情
 */
export async function getEquipFaultManualById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-manual/${id}`,
  );
}

/**
 * 创建维修措施
 */
export async function createEquipFaultManual(params: CreateFaultManualParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-manual/create`,
    params,
  );
}

/**
 * 更新维修措施
 */
export async function updateEquipFaultManual(params: UpdateFaultManualParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-manual/update`,
    params,
  );
}

/**
 * 删除维修措施
 */
export async function deleteEquipFaultManual(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-manual/${id}`,
  );
}
