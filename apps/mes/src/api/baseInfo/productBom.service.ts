// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询产品 BOM 列表
 */
export function getProductBomList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/queryList?${qs.stringify(params)}`,
  );
}

/**
 * 根据 BOM 编码查询详情（设计 BOM）
 */
export function getBomDetailList(code: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/getDetailList/${code}`,
  );
}

/**
 * 根据 BOM 编码查询详情树（多级展开）
 */
export function getBomDetailTree(code: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/queryDetailTree/${code}`,
  );
}

/**
 * 查询产品 BOM 类型树（用于产品BOM页面）
 */
export function getProductBomTypeTree() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/bomtype/getTree`,
  );
}

/**
 * 下载产品 BOM 导入模板（返回文件路径）
 */
export function downloadProductBomTemplate() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/downloadExcel`,
  );
}

/**
 * 导入产品 BOM Excel 文件
 * @param formData FormData 文件数据（字段名 file）
 */
export function importProductBom(formData: FormData) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}
