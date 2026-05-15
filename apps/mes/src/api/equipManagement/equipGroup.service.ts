/**
 * [INPUT]: 依赖 requestClient、qs API
 * [OUTPUT]: 对外提供设备群组相关 API 函数和类型定义
 * [POS]: 设备管理模块 的设备群组服务层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-15 12:37:00
 */

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 响应类型定义 ==========

/** 设备群组绑定项 */
export interface EquipGroupBindingItem {
  id: number;
  equipCroupCode: string;
  equipCode: string;
  equipName: string;
}

/** 设备群组信息 */
export interface EquipGroupInfo {
  id: number;
  configType: string;
  configCode: string;
  configName: string;
  parentCode?: null | string;
  repairGroupCode?: null | string;
  sortOrder?: number;
  status: string;
  remark?: null | string;
  createdBy?: string;
  createdTime?: string;
  updatedTime?: null | string;
}

/** 绑定设备项 */
export interface BindingEquipItem {
  equipCroupCode: string;
  equipCode: string;
  equipName: string;
}

/** 保存绑定请求参数 */
export interface SaveBindingParams {
  equipGroupCode: string;
  bindings: BindingEquipItem[];
}

// ========== 设备群组绑定相关 ==========

/**
 * 根据设备群组获取设备列表
 * @param groupCode 设备群组编码
 * @returns 设备列表
 */
export async function getEquipListByGroupCode(groupCode: string) {
  return requestClient.get<EquipGroupBindingItem[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/group/binding/listByGroupCode?${qs.stringify({ groupCode })}`,
  );
}

/**
 * 根据设备获取设备群组编码
 * @param equipCode 设备编码
 * @returns 设备群组信息
 */
export async function getGroupByEquipCode(equipCode: string) {
  return requestClient.get<EquipGroupInfo>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/group/binding/getGroupByEquipCode?${qs.stringify({ equipCode })}`,
  );
}

/**
 * 保存设备群组绑定关系
 * @param params 绑定参数
 */
export async function saveEquipGroupBinding(params: SaveBindingParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/group/binding/save`,
    params,
  );
}
