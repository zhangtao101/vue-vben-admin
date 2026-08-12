// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 人员与产线绑定关系查询参数 */
export interface StaffBindListParams {
  /** 用户编号 */
  userCode?: string;
  /** 产线组编号 */
  lineGroupCode?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 人员与产线绑定关系记录 */
export interface StaffBindItem {
  /** 主键 */
  id: number;
  /** 用户名称 */
  userCode: string;
  /** 用户姓名 */
  userName: string;
  /** 产线组编号 */
  lineGroupCode: string;
  /** 产线组名称 */
  lineGroupName: string;
  /** 产线编号 */
  lineCode: string;
  /** 产线名称 */
  lineName: string;
  /** 状态 0未启用 1启用 */
  state: null | number;
}

/** 分页查询结果 */
export interface StaffBindListResult {
  /** 当前页数据 */
  list: StaffBindItem[];
  /** 总条数 */
  total: number;
}

/** 批量添加用户参数（单条） */
export interface StaffBindAddItem {
  /** 产线id */
  lineId: number;
  /** 用户编号 */
  userCode: string;
  /** 用户id */
  userId: number;
  /** 用户名称 */
  userName: string;
}

/** 批量修改绑定关系参数（单条） */
export interface StaffBindUpdateItem {
  /** 主键 */
  id: number;
  /** 产线id */
  lineId: number;
  /** 用户编号 */
  userCode: string;
  /** 用户id */
  userId: number;
  /** 用户名称 */
  userName: string;
}

/** 删除绑定关系参数 */
export interface StaffBindDeleteParams {
  /** id列表 */
  ids: string;
}

/** 修改状态参数 */
export interface StaffBindStateParams {
  /** id列表 */
  ids: string[];
  /** 状态 1启用 0未启用 */
  state: number;
}

/** 工人用户信息 */
export interface WorkerUserItem {
  /** 用户id */
  id: number;
  /** 用户编号 */
  userCode: string;
  /** 用户姓名 */
  userName: string;
}

/** 产线信息（根据产线组获取） */
export interface LineByGroupItem {
  /** 产线id */
  id: number;
  /** 产线名称 */
  lineName: string;
  /** 产线编号 */
  lineCode: string;
}

/** 根据产线组获取产线返回结果 */
export interface LineByGroupResult {
  /** 产线列表 */
  results: LineByGroupItem[];
}

// ========== 接口函数 ==========

/**
 * 分页查询人员与产线绑定关系
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listStaffBinds(params: StaffBindListParams) {
  return requestClient.get<StaffBindListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/userSearch?${qs.stringify(params)}`,
  );
}

/**
 * 批量添加用户与产线绑定
 * @param params 绑定关系列表
 * @returns 添加结果
 */
export async function addStaffBinds(params: StaffBindAddItem[]) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/addUser`,
    params,
  );
}

/**
 * 批量修改产线与人员绑定关系
 * @param params 绑定关系列表
 * @returns 修改结果
 */
export async function updateStaffBinds(params: StaffBindUpdateItem[]) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/updateSearch`,
    params,
  );
}

/**
 * 删除产线与用户绑定关系
 * @param params 删除参数（包含ids）
 * @returns 删除结果
 */
export async function deleteStaffBinds(params: StaffBindDeleteParams) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/deleteUser?ids=${params.ids}`,
  );
}

/**
 * 修改绑定状态
 * @param params 状态参数（ids + state）
 * @returns 修改结果
 */
export async function updateStaffBindState(params: StaffBindStateParams) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/subLine/updateState`,
    params,
  );
}

/**
 * 获取工人名单
 * @returns 工人用户列表
 */
export async function getWorkerUserList() {
  return requestClient.get<WorkerUserItem[]>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/roleCode`,
  );
}

/**
 * 根据产线组id获取产线信息
 * @param groupId 产线组id
 * @returns 产线列表
 */
export async function getLinesByGroup(groupId: number | string) {
  return requestClient.get<LineByGroupResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/getByGroup/${groupId}`,
  );
}
