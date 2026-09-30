// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 人员登记记录保存项 */
export interface StaffRegisterSaveItem {
  /** 主键，新增时为空 */
  id?: null | number;
  /** 作业日期 */
  workDate?: string;
  /** 作业开始时间 */
  startTime?: string;
  /** 作业结束时间 */
  endTime?: string;
  /** 班别编号 */
  shiftCode?: string;
  /** 班别名称 */
  shiftName?: string;
  /** 班组编号 */
  groupCode?: string;
  /** 班组名称 */
  groupName?: string;
  /** 班组人员数量 */
  groupNumber?: number;
  /** 子产线编号 */
  subLineCode?: string;
  /** 子产线名称 */
  subLineName?: string;
  /** 状态：-1停用 1启用 */
  status?: number;
  /** 备注 */
  remark?: string;
}

/** 人员登记记录查询参数 */
export interface StaffRegisterListParams {
  /** 作业日期开始 */
  startDate?: string;
  /** 作业日期结束 */
  endDate?: string;
  /** 班组编号 */
  groupCode?: string;
  /** 子产线编号 */
  subLineCode?: string;
  /** 班别编号 */
  shiftCode?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 人员登记记录 */
export interface StaffRegisterItem {
  /** 主键 */
  id?: number;
  /** 作业日期 */
  workDate?: string;
  /** 作业开始时间 */
  startTime?: string;
  /** 作业结束时间 */
  endTime?: string;
  /** 班别编号 */
  shiftCode?: string;
  /** 班别名称 */
  shiftName?: string;
  /** 班组编号 */
  groupCode?: string;
  /** 班组名称 */
  groupName?: string;
  /** 班组人员数量 */
  groupNumber?: number;
  /** 子产线编号 */
  subLineCode?: string;
  /** 子产线名称 */
  subLineName?: string;
  /** 状态：-1停用 1启用 */
  status?: number;
  /** 备注 */
  remark?: string;
}

/** 人员登记记录分页查询结果 */
export interface StaffRegisterListResult {
  /** 总条数 */
  total: number;
  /** 当前页条数 */
  count: number;
  /** 当前页数据 */
  results: StaffRegisterItem[];
}

// ========== 接口函数 ==========

/**
 * 人员登记记录保存
 * @param {StaffRegisterSaveItem[]} records - 保存提交的列表集合
 * @returns {Promise<any>} 接口返回结果
 * @since 2026-09-29
 */
export async function saveStaffRegisterRecords(
  records: StaffRegisterSaveItem[],
) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/subLineUserRecord/save`,
    records,
  );
}

/**
 * 登记人员记录列表查询
 * @param {StaffRegisterListParams} params - 查询参数，包含作业日期范围、班组编号、子产线编号、班别编号等
 * @returns {Promise<StaffRegisterListResult>} 分页数据
 * @since 2026-09-29
 */
export async function listStaffRegisterRecords(
  params: StaffRegisterListParams,
) {
  return requestClient.get<StaffRegisterListResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/subLineUserRecord/queryList?${qs.stringify(params)}`,
  );
}

/**
 * 删除登记记录（支持批量）
 * @param {number[]} ids - 勾选的ID列表
 * @returns {Promise<any>} 接口返回结果
 * @since 2026-09-29
 */
export async function deleteStaffRegisterRecords(ids: number[]) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/subLineUserRecord/delete?${qs.stringify(
      { ids },
      { arrayFormat: 'repeat' },
    )}`,
  );
}
