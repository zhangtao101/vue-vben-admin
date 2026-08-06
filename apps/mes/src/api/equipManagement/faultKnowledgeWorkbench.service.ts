/**
 * 故障知识工作台 API 服务
 * @description 提供标准内容管理、故障知识导入等接口
 * @since 2026-08-05
 */
import { requestClient } from '#/api/request';

// ========== 标准内容管理 ==========

/**
 * 新增标准内容
 * @param params - 标准内容参数
 * @param params.faultTreeId - 所属故障节点ID
 * @param params.standardCode - 标准编码
 * @param params.standardName - 标准名称
 * @param params.standardContent - 标准内容
 * @param params.status - 状态：1-启用，2-停用
 * @returns Promise<any> 新创建的标准内容
 * @since 2026-08-05
 */
export function createFaultStandard(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-standard/create`,
    params,
  );
}

/**
 * 修改标准内容
 * @param params - 标准内容参数
 * @param params.id - 标准ID
 * @param params.faultTreeId - 所属故障节点ID
 * @param params.standardCode - 标准编码
 * @param params.standardName - 标准名称
 * @param params.standardContent - 标准内容
 * @param params.status - 状态：1-启用，2-停用
 * @returns Promise<any> 更新后的标准内容
 * @since 2026-08-05
 */
export function updateFaultStandard(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-standard/update`,
    params,
  );
}

/**
 * 查看标准内容详情
 * @param id - 标准ID
 * @returns Promise<any> 标准内容详情
 * @since 2026-08-05
 */
export function getFaultStandardById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-standard/${id}`,
  );
}

/**
 * 删除标准内容
 * @param id - 标准ID
 * @returns Promise<any>
 * @since 2026-08-05
 */
export function deleteFaultStandard(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/fault-standard/${id}`,
  );
}

// ========== 导入功能 ==========

/**
 * 统一导入故障树和维修措施
 * @description 上传Excel文件，文件必须包含"故障树"和"维修措施"两个Sheet
 * @param params - FormData，包含file字段
 * @returns Promise<any> 导入结果 {total, successCount, failCount, errors}
 * @since 2026-08-05
 */
export function importFaultKnowledge(params: FormData) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/import/fault-knowledge`,
    params,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
}
