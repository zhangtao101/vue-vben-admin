// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 筒仓设备列表查询参数 */
export interface SiloMaterialListParams {
  /** 设备编号，支持模糊查询 */
  equipCode?: string;
  /** 设备名称，支持模糊查询 */
  equipName?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 筒仓设备记录 */
export interface SiloMaterialItem {
  /** 主键 */
  id: number;
  /** 设备编号 */
  equipCode: string;
  /** 设备名称 */
  equipName: string;
  /** 类型 */
  type: string;
  /** 购买时间 */
  purchaseDate: string;
  /** 物料编号 */
  materialCode: string;
  /** 物料名称 */
  materialName: string;
}

/** 分页查询结果 */
export interface SiloMaterialListResult {
  /** 当前页数据 */
  list: SiloMaterialItem[];
  /** 总条数 */
  total: number;
}

/** 新增筒仓设备参数 */
export interface SiloMaterialCreateParams {
  /** 设备编号，必填 */
  equipCode: string;
  /** 设备名称，必填 */
  equipName: string;
  /** 物料编号，必填 */
  materialCode: string;
  /** 物料名称，必填 */
  materialName: string;
  /** 购买时间，必填 */
  purchaseDate: string;
  /** 类型，必填 */
  type: string;
}

/** 修改筒仓设备参数 */
export interface SiloMaterialUpdateParams {
  /** 主键，编辑时必填 */
  id?: number;
  /** 设备编号，必填 */
  equipCode: string;
  /** 设备名称，必填 */
  equipName: string;
  /** 物料编号，必填 */
  materialCode: string;
  /** 物料名称，必填 */
  materialName: string;
  /** 购买时间，必填 */
  purchaseDate: string;
  /** 类型，必填 */
  type: string;
}

/** 物料下拉查询参数 */
export interface MaterialInfoParams {
  /** 物料编号 */
  materialCode?: string;
  /** 物料名称 */
  materialName?: string;
}

/** 物料信息 */
export interface MaterialInfoItem {
  /** 物料编号 */
  materialCode: string;
  /** 物料名称 */
  materialName: string;
}

/** 物料查询结果 */
export interface MaterialInfoResult {
  /** 总条数 */
  total: number;
  /** 条数 */
  count: number;
  /** 物料列表 */
  results: MaterialInfoItem[];
}

// ========== 接口函数 ==========

/**
 * 分页查询筒仓设备列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listSiloMaterials(params: SiloMaterialListParams) {
  return requestClient.get<SiloMaterialListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/silo/search?${qs.stringify(params)}`,
  );
}

/**
 * 增加筒仓设备
 * @param params 筒仓设备信息
 * @returns 保存结果
 */
export async function addSiloMaterial(params: SiloMaterialCreateParams) {
  return requestClient.post<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/silo/add`,
    params,
  );
}

/**
 * 修改筒仓设备
 * @param params 筒仓设备信息
 * @returns 修改结果
 */
export async function updateSiloMaterial(params: SiloMaterialUpdateParams) {
  return requestClient.put<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/silo/update`,
    params,
  );
}

/**
 * 删除筒仓
 * @param id 主键
 * @returns 删除结果
 */
export async function deleteSiloMaterial(id: number) {
  return requestClient.delete<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/silo/delete/${id}`,
  );
}

/**
 * 展示所有物料（下拉选择）
 * @param params 物料查询参数
 * @returns 物料列表
 */
export async function listMaterialInfos(params: MaterialInfoParams) {
  return requestClient.get<MaterialInfoResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/list/search?${qs.stringify(params)}`,
  );
}
