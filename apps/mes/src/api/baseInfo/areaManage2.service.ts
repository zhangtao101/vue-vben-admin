// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 区域列表查询参数 */
export interface AreaManage2ListParams {
  /** 区域编号，支持模糊查询 */
  areaCode?: string;
  /** 产线组名称，支持模糊查询 */
  lineGroupName?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 区域记录 */
export interface AreaManage2Item {
  /** 主键 */
  id: number;
  /** 区域编号 */
  areaCode: string;
  /** 区域名称 */
  areaName: string;
  /** 产线组 id */
  lineGroupId?: number;
  /** 产线组名称 */
  lineGroupName?: string;
  /** 备注 */
  remark?: string;
}

/** 分页查询结果 */
export interface AreaManage2ListResult {
  /** 当前页数据 */
  list: AreaManage2Item[];
  /** 总条数 */
  total: number;
}

/** 新增区域参数 */
export interface AreaManage2CreateParams {
  /** 区域编号，必填 */
  areaCode: string;
  /** 区域名称，必填 */
  areaName: string;
  /** 产线组 id，必填 */
  lineGroupId: number;
  /** 备注，必填 */
  remark: string;
}

/** 修改区域参数 */
export interface AreaManage2UpdateParams {
  /** 主键，编辑时必填 */
  id?: number;
  /** 区域编号，必填 */
  areaCode: string;
  /** 区域名称，必填 */
  areaName: string;
  /** 产线组 id，必填 */
  lineGroupId: number;
  /** 备注，必填 */
  remark: string;
}

/** 产线组记录 */
export interface AreaManage2LineGroupItem {
  /** 产线组 id */
  id: number;
  /** 产线组编号 */
  lineGroupCode: string;
  /** 产线组名称 */
  lineGroupName: string;
}

/** 产线组查询结果 */
export interface AreaManage2LineGroupResult {
  /** 当前页数据 */
  list: AreaManage2LineGroupItem[];
  /** 总条数 */
  total: number;
}

// ========== 接口函数 ==========

/**
 * 分页查询区域列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listAreaManage2(params: AreaManage2ListParams) {
  return requestClient.get<AreaManage2ListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/area/search?${qs.stringify(params)}`,
  );
}

/**
 * 添加区域
 * @param params 区域信息
 * @returns 保存结果
 */
export async function addAreaManage2(params: AreaManage2CreateParams) {
  return requestClient.post<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/area/add`,
    params,
  );
}

/**
 * 修改区域
 * @param params 区域信息
 * @returns 修改结果
 */
export async function updateAreaManage2(params: AreaManage2UpdateParams) {
  return requestClient.put<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/area/update`,
    params,
  );
}

/**
 * 删除区域
 * @param id 主键
 * @returns 删除结果
 */
export async function deleteAreaManage2(id: number) {
  return requestClient.delete<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/area/delete/${id}`,
  );
}

/**
 * 获取产线组列表（下拉选择）
 * @returns 产线组列表
 */
export async function listArea2LineGroups() {
  return requestClient.get<AreaManage2LineGroupResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/group/search?${qs.stringify({ pageNum: 1, pageSize: 100 })}`,
  );
}
