// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 导入记录列表查询（分页）
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页展示条数
 * @param {string} [params.fileType] - 文件类别（PPSImport/PPSExport/FabImport）
 * @since 2026-07-23
 */
export async function getXmlImportRecords(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/xmlImport/records?${qs.stringify(params)}`,
  );
}

/**
 * 导入记录明细查看
 * @param {object} params - 查询参数
 * @param {number} params.importId - 记录ID
 * @since 2026-07-23
 */
export async function getXmlImportDetail(params: { importId: number }) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/xmlImport/detail/${params.importId}`,
  );
}
