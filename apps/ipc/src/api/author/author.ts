// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/** 作业平台按钮权限项 */
export interface WorkButtonItem {
  /** 按钮编码（如 JB_START/JB_END） */
  buttonCode: string;
  /** 按钮名称 */
  buttonName: string;
  /** 说明 */
  discription: string;
  /** 主键 */
  id: number;
  /** 是否启用：1 启用 */
  isEnable: number;
  /** 菜单编码 */
  menuCode: string;
  /** 请求方式 */
  requestMethod: string;
  /** 关联接口地址 */
  url: string;
}

/**
 * web菜单查询
 * @param params
 */
export async function getMenusWeb(params: {
  menuCode: string;
  type: 'pda' | 'web';
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/button/listButtonByRole?${qs.stringify(params)}`,
  );
}

/**
 * 作业平台人员按钮权限查询
 * @param params 查询参数
 * @param params.menuCode 菜单编码（如 JM_001）
 * @returns {Promise<WorkButtonItem[]>} 当前用户在该菜单下拥有的按钮权限列表
 * @since 2026-10-15
 */
export async function listWorkButtonByRole(params: { menuCode: string }) {
  return requestClient.get<WorkButtonItem[]>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/button/listWorkButtonByRole?${qs.stringify(params)}`,
  );
}
