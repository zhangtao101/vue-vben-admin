/**
 * [INPUT]: 依赖 qs、#/api/request 的 requestClient，调用知识库维护相关接口
 * [OUTPUT]: 对外提供手册增删改、目录增删改查、角色绑定、文件上传、角色下拉等 API 函数
 * [POS]: 知识库管理-知识库维护模块 的 API 层，被 knowledgeBaseMaintain.vue 等页面引用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-08-04 09:00:00
 */

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 路径前缀 ==========

const MANUAL_PREFIX = `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/manual`;
const CATEGORY_PREFIX = `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/knowledge/category`;
const ROLE_PREFIX = `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/category/role`;
const SYS_ROLE_PREFIX = `${import.meta.env.VITE_GLOB_MES_USER}/sys/role`;

// ========== 手册管理 ==========

/**
 * 新增手册。
 * @param {Object} params - 手册参数。
 * @param {string} params.manualCode - 手册编码。
 * @param {string} params.manualName - 手册名称。
 * @param {string} [params.manualContent] - 手册标签tag。
 * @param {string} [params.attachmentUrl] - 附件URL。
 * @param {number} params.faultTreeId - 关联目录ID。
 * @param {string} [params.faultTreeName] - 故障现象名称。
 * @param {string} [params.remark] - 备注。
 * @returns {Promise<any>} 返回操作结果。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function addManual(params: {
  attachmentUrl?: string;
  faultTreeId: number;
  faultTreeName?: string;
  manualCode: string;
  manualContent?: string;
  manualName: string;
  remark?: string;
}) {
  return requestClient.post<any>(`${MANUAL_PREFIX}/add`, params);
}

/**
 * 删除手册。
 * @param {number} id - 手册ID。
 * @returns {Promise<any>} 返回操作结果。
 * @throws {Error} 手册不存在或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function deleteManual(id: number) {
  return requestClient.delete<any>(`${MANUAL_PREFIX}/delete/${id}`);
}

/**
 * 修改手册。
 * @param {Object} params - 手册参数。
 * @param {number} params.id - 手册ID。
 * @param {string} params.manualCode - 手册编码。
 * @param {string} params.manualName - 手册名称。
 * @param {string} [params.manualContent] - 手册标签tag。
 * @param {string} [params.attachmentUrl] - 附件URL。
 * @param {number} params.faultTreeId - 关联目录ID。
 * @param {string} [params.faultTreeName] - 故障现象名称。
 * @param {string} [params.remark] - 备注。
 * @returns {Promise<any>} 返回操作结果。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function editManual(params: {
  attachmentUrl?: string;
  faultTreeId: number;
  faultTreeName?: string;
  id: number;
  manualCode: string;
  manualContent?: string;
  manualName: string;
  remark?: string;
}) {
  return requestClient.put<any>(`${MANUAL_PREFIX}/edit`, params);
}

// ========== 目录管理 ==========

/**
 * 删除目录。
 * @param {number} id - 目录ID。
 * @returns {Promise<any>} 返回操作结果。
 * @throws {Error} 目录不存在或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function deleteCategory(id: number) {
  return requestClient.delete<any>(`${CATEGORY_PREFIX}/delete/${id}`);
}

/**
 * 查看文档树。
 * @param {Object} [params] - 查询参数。
 * @param {string} [params.keyword] - 关键词筛选。
 * @returns {Promise<any>} 返回树形文档数据，树节点包含 id、categoryCode、categoryName、parentId、children、manuals。
 * @throws {Error} 网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function getCategoryTree(params?: { keyword?: string }) {
  return requestClient.get<any>(
    `${CATEGORY_PREFIX}/getTree?${qs.stringify(params || {})}`,
  );
}

/**
 * 新增目录。
 * @param {Object} params - 目录参数。
 * @param {string} params.categoryCode - 目录编号。
 * @param {string} params.categoryName - 目录名称。
 * @param {number} [params.parentId] - 父目录ID。
 * @returns {Promise<number>} 返回新目录ID。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function addCategory(params: {
  categoryCode: string;
  categoryName: string;
  parentId?: number;
}) {
  return requestClient.post<number>(`${CATEGORY_PREFIX}/save`, params);
}

/**
 * 修改目录。
 * @param {Object} params - 目录参数。
 * @param {number} params.id - 目录ID。
 * @param {string} params.categoryCode - 目录编号。
 * @param {string} params.categoryName - 目录名称。
 * @param {number} [params.parentId] - 父目录ID。
 * @returns {Promise<number>} 返回操作结果。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function updateCategory(params: {
  categoryCode: string;
  categoryName: string;
  id: number;
  parentId?: number;
}) {
  return requestClient.put<number>(`${CATEGORY_PREFIX}/update`, params);
}

// ========== 目录角色绑定 ==========

/**
 * 查看目录下人员角色。
 * @param {number} categoryId - 目录ID。
 * @returns {Promise<string[]>} 返回角色编号字符串列表。
 * @throws {Error} 目录不存在或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function getCategoryRoles(categoryId: number) {
  return requestClient.get<string[]>(`${ROLE_PREFIX}/get/${categoryId}`);
}

/**
 * 修改目录角色绑定（通知渠道）。
 * @param {Object} params - 角色绑定参数。
 * @param {number} params.categoryId - 目录ID。
 * @param {number} [params.id] - 绑定记录ID。
 * @param {string} [params.roleCode] - 单个角色编号。
 * @param {string[]} [params.roleCodes] - 角色编号列表。
 * @returns {Promise<any>} 返回操作结果。
 * @throws {Error} 参数校验失败或网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function updateCategoryRoles(params: {
  categoryId: number;
  id?: number;
  roleCode?: string;
  roleCodes?: string[];
}) {
  return requestClient.put<any>(`${ROLE_PREFIX}/update`, params);
}

// ========== 角色下拉 ==========

/**
 * 获取角色下拉选项。
 * @returns {Promise<any>} 返回角色下拉列表数据。
 * @throws {Error} 网络异常时 Promise 被拒绝。
 * @since 2026-08-04 09:00:00
 */
export async function getRoleSelectInfo() {
  return requestClient.get<any>(`${SYS_ROLE_PREFIX}/getSelectInfo`);
}
