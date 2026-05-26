// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询物料类别列表
 * @param params
 */
export async function queryMaterialCategoryList(params: {
  pageNum: number;
  pageSize: number;
  selectedTypeCode?: string;
  typeCode?: string;
  typeName?: string;
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialType/list/search?pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
    {
      params: {
        typeCode: params.typeCode,
        typeName: params.typeName,
        selectedTypeCode: params.selectedTypeCode,
      },
    },
  );
}

/**
 * 查询物料类别树
 */
export async function queryMaterialTree() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialType/treeData`,
  );
}

/**
 * 查询材料信息列表
 */
export function queryMaterialInfoList(params: {
  materialCode?: string;
  materialName?: string;
  materialTypeCode?: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return requestClient.get<{ results: any[]; total: number }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/list/search`,
    { params },
  );
}

/**
 * 根据ID查询材料信息
 */
export function queryMaterialInfoById(params: { id: number | string }) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/getMaterialById`,
    { params },
  );
}

/**
 * 查询材料详情（产品描述）
 */
export function queryMaterialInfoDetail(code: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/detail/${code}`,
  );
}

/**
 * 查询材料产品引用
 */
export function queryMaterialInfoProductReferences(code: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/productReferences/${code}`,
  );
}

/**
 * 更新材料上下限安全量
 */
export function materialUpDownSafe(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/materialUpDownSafe?${qs.stringify(params)}`,
    {},
  );
}

/**
 * 更新物料标签描述
 */
export function updateNameToLabelAndIQC(materialCode: string) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/updateNameToLabelAndIQC/${materialCode}`,
  );
}

/**
 * 下载材料信息模板
 */
export function downloadMaterialsTemplate() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/downloadTemplate`,
  );
}

/**
 * 查询PAS文件
 */
export function queryPasFile(params: { materialCode?: string }) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/queryPasFile`,
    { params },
  );
}

/**
 * 添加PAS文件
 */
export function addPASFile(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/addPASFile`,
    data,
    {
      headers: {
        'Content-Type':
          'multipart/form-data;boundary=ebf9f03029db4c2799ae16b5428b06bd1',
      },
    },
  );
}

/**
 * 更新PAS文件
 */
export function updatePASFile(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/updatePASFile`,
    data,
    {
      headers: {
        'Content-Type':
          'multipart/form-data;boundary=ebf9f03029db4c2799ae16b5428b06bd1',
      },
    },
  );
}

// ==================== MSD 信息相关 ====================

/** MSD 信息 */
export interface MSDInfo {
  /** MSD信息ID */
  id: number;
  /** 料号 */
  materialCode: string;
  /** MSD等级 */
  msdLevel: number;
  /** 检测周期（单位月） */
  checkCycle: number;
}

/** MSD 信息保存参数 */
export interface MSDInfoSaveParams {
  /** MSD信息ID，新增时传 null */
  id: null | number;
  /** 料号 */
  materialCode: string;
  /** MSD等级 */
  msdLevel: number;
  /** 检测周期（单位月） */
  checkCycle: number;
}

/**
 * 根据料号查看MSD信息
 * @param params 包含 materialCode 的查询参数
 * @returns MSD信息
 * @since 2026-05-26 09:38:00
 */
export async function queryMSDInfo(params: { materialCode?: string }) {
  return requestClient.get<MSDInfo>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/queryMSDinfo`,
    { params },
  );
}

/**
 * 保存MSD信息（新增/修改）
 * @param data MSD信息保存参数
 * @returns 操作结果
 * @since 2026-05-26 09:38:00
 */
export async function saveMSDInfo(data: MSDInfoSaveParams) {
  return requestClient.post<null>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/saveMSDInfo`,
    data,
  );
}
