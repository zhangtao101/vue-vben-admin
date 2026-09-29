// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 班组列表查询参数 */
export interface TeamGroupListParams {
  /** 子产线 id */
  subLineId?: number;
  /** 班组名称，支持模糊查询 */
  groupName?: string;
  /** 班组编号，支持模糊查询 */
  groupCode?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 班组记录 */
export interface TeamGroupItem {
  /** 主键 */
  id: number;
  /** 班组编号 */
  groupCode: string;
  /** 班组名称 */
  groupName: string;
  /** 子产线 id */
  subLineId: number;
  /** 备注 */
  remark: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 分页查询结果 */
export interface TeamGroupListResult {
  /** 当前页数据 */
  list: TeamGroupItem[];
  /** 总条数 */
  total: number;
}

/** 新增班组参数 */
export interface TeamGroupCreateParams {
  /** 子产线 id，必填 */
  subLineId: number;
  /** 班组编号，必填 */
  groupCode: string;
  /** 班组名称，必填 */
  groupName: string;
  /** 备注 */
  remark?: string;
}

/** 可用人员 */
export interface TeamGroupUserItem {
  /** 用户 id */
  userId?: number;
  /** 用户编号 */
  userCode?: string;
  /** 用户名称 */
  userName?: string;
}

/** 班组人员（绑定关系） */
export interface TeamGroupBoundUserItem {
  /** 绑定关系主键 */
  id?: number;
  /** 用户 id */
  userId?: number;
  /** 用户编号 */
  userCode?: string;
  /** 用户名称 */
  userName?: string;
}

/** 班组绑定人员参数 */
export interface TeamGroupBindUserParams {
  /** 班组 id，必填 */
  groupId: number;
  /** 人员列表，必填 */
  userList: TeamGroupUserItem[];
}

/** 修改班组参数 */
export interface TeamGroupUpdateParams {
  /** 主键，必填 */
  id: number;
  /** 子产线 id */
  subLineId?: number;
  /** 班组编号，必填 */
  groupCode: string;
  /** 班组名称，必填 */
  groupName: string;
  /** 备注 */
  remark?: string;
}

// ========== 接口函数 ==========

/**
 * 分页查询班组列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listTeamGroups(params: TeamGroupListParams) {
  return requestClient.get<TeamGroupListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/work/group/search?${qs.stringify(params)}`,
  );
}

/**
 * 新增班组
 * @param params 班组信息
 * @returns 新增后的班组
 */
export async function createTeamGroup(params: TeamGroupCreateParams) {
  return requestClient.post<TeamGroupItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/work/group/add`,
    params,
  );
}

/**
 * 修改班组
 * @param params 班组信息
 * @returns 修改后的班组
 */
export async function updateTeamGroup(params: TeamGroupUpdateParams) {
  return requestClient.put<TeamGroupItem>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/work/group/update`,
    params,
  );
}

/**
 * 删除班组
 * @param id 主键
 * @returns 删除结果
 */
export async function deleteTeamGroup(id: number) {
  return requestClient.delete<boolean>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/work/group/delete/${id}`,
  );
}

/**
 * 展示所有可用人员
 * @param subLineId 产线 id，非必填
 * @returns 可用人员列表
 * @since 2026-09-29
 */
export async function listAvailableUsers(subLineId?: number | string) {
  return requestClient.get<TeamGroupUserItem[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/work/group/userNames?${qs.stringify({ subLineId })}`,
  );
}

/**
 * 根据班组 id 展示人员
 * @param id 班组 id
 * @returns 班组已绑定人员列表
 * @since 2026-09-29
 */
export async function listGroupUsers(id: number | string) {
  return requestClient.get<TeamGroupBoundUserItem[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/work/group/userSearch?${qs.stringify({ id })}`,
  );
}

/**
 * 班组绑定人员（后台会先清空原有绑定关系再绑定，可重复调用）
 * @param params 班组 id 与人员列表
 * @returns 绑定结果
 * @since 2026-09-29
 */
export async function bindGroupUsers(params: TeamGroupBindUserParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/work/group/addUser`,
    params,
  );
}
