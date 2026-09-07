// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 设备上模数量配置 ==========

/**
 * 设备上模数量配置-分页查询参数
 */
export interface EquipCategoryLimitPageParams {
  /** 设备编码，精确匹配，可空 */
  equipmentCode?: string;
  /** 模具类别ID，可空 */
  categoryId?: number;
  /** 页码，默认 1 */
  pageNum?: number;
  /** 每页条数，默认 10 */
  pageSize?: number;
}

/**
 * 设备上模数量配置-新增参数
 */
export interface EquipCategoryLimitAddParams {
  /** 设备编码 */
  equipmentCode: string;
  /** 模具类别ID */
  categoryId: number;
  /** 最大在机模具数，必须 > 0 */
  maxOnMachine: number;
}

/**
 * 设备上模数量配置-编辑参数（仅更新 maxOnMachine）
 */
export interface EquipCategoryLimitUpdateParams {
  /** 配置记录ID，取列表返回的 id */
  id: number;
  /** 新的最大在机模具数，必须 > 0 */
  maxOnMachine: number;
}

/**
 * 分页查询配置列表
 * 返回：data.results=当页列表（渲染表格），data.total=总条数（分页组件），data.count=当页条数
 * @param params 查询参数（设备编码精确匹配，模具类别ID精确匹配，均可不传）
 */
export async function getEquipCategoryLimitPage(
  params: EquipCategoryLimitPageParams,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/equip-category-limit/list?${qs.stringify(params)}`,
  );
}

/**
 * 新增配置
 * 同设备同类别已存在时返回 402：该设备该类别的配置已存在，请直接编辑
 * @param params 新增参数
 */
export async function addEquipCategoryLimit(params: EquipCategoryLimitAddParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/equip-category-limit/add?${qs.stringify(params)}`,
  );
}

/**
 * 编辑配置
 * 使用列表返回的配置记录ID定位，仅更新 maxOnMachine
 * @param params 编辑参数
 */
export async function updateEquipCategoryLimit(
  params: EquipCategoryLimitUpdateParams,
) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/equip-category-limit/update?${qs.stringify(params)}`,
  );
}

/**
 * 删除配置
 * 删除后该设备该类别回退类别默认规则
 * @param id 配置记录ID，取列表返回的 id
 */
export async function deleteEquipCategoryLimit(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/equip-category-limit/delete?${qs.stringify({ id })}`,
  );
}
