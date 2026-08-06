// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

const BASE_URL = `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/knowledge`;

// ========== 检索查询 ==========

/**
 * 维修故障知识统一检索
 * 输入关键词后，统一查询状态为已完成的维修记录及状态为启用的结构化知识，并按时间倒序分页返回。
 * @param {Object} params - 检索参数
 * @param {string} params.keyword - 检索关键词
 * @param {number} [params.pageNum=1] - 页码，从1开始
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise<any>} 分页检索结果
 * @since 2026-08-05
 */
export async function searchFaultKnowledge(params: {
  keyword: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return requestClient.get<any>(
    `${BASE_URL}/fault-search?${qs.stringify(params)}`,
  );
}

// ========== 详情查询 ==========

/**
 * 查询维修故障知识统一详情
 * 点击检索结果卡片后调用。sourceType=1返回报修、维修及过程时间线；sourceType=2返回结构化知识详情。
 * @param {Object} params - 详情参数
 * @param {number} params.sourceType - 来源类型：1-维修单，2-知识库
 * @param {number} params.sourceId - 来源数据主键
 * @returns {Promise<any>} 统一详情数据
 * @since 2026-08-05
 */
export async function getFaultKnowledgeDetail(params: {
  sourceId: number;
  sourceType: number;
}) {
  return requestClient.get<any>(
    `${BASE_URL}/fault-detail?${qs.stringify(params)}`,
  );
}
