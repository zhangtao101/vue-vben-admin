// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * web菜单查询
 */
export async function getMenusWebList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/webmenu/getMenus`,
  );
}
/**
 * 根据条件查询菜单
 */
export async function filterWeb(params: { name: string }) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/webmenu/getMenuByParam?${qs.stringify(params)}`,
  );
}
/**
 * 调整菜单排序
 */
export async function changeOrderWeb(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/webmenu/menuChangeOrder`,
    params,
  );
}
/**
 * 菜单新增
 */
export async function createArticleWeb(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/webmenu/add`,
    params,
  );
}
/**
 * 菜单修改
 */
export async function updateArticleWeb(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/webmenu/up`,
    params,
  );
}

/**
 * 菜单删除
 * @param id 菜单id
 */
export async function deleteBtnById(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/webmenu/delete?id=${id}`,
  );
}
