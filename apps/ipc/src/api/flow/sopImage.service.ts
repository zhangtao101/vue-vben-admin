// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * SOP 图像查询参数
 * @since 2026-10-08
 */
export interface SopImageParams {
  /** 产品名称（产品编码），不传时由后端按默认处理 */
  productCode?: string;
}

/**
 * SOP 图像获取
 * @param params 查询参数
 * @param params.productCode 产品编码
 * @returns SOP 图片地址列表，可能是一张或多张
 * @since 2026-10-08
 */
export function getSopImageByProductCode(params: SopImageParams) {
  return requestClient.get<string[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/getSopImageByProductCode?${qs.stringify(params)}`,
  );
}
