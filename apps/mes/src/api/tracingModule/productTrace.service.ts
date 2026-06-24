// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 产品追溯页面 ==========

/**
 * 根据二维码获取产品追溯列表
 * @param query 查询参数 { qrcode }
 */
export async function getTraceList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/trace/product/getTraceList?${qs.stringify(query)}`,
  );
}

/**
 * 根据条码和产品获取对应的追溯路线
 * @param query 查询参数 { qrcode, productCode }
 */
export async function getPartTraceList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/trace/product/getPartTraceList?${qs.stringify(query)}`,
  );
}

/**
 * 点击详情获取工序详细信息（工艺参数、质检、不良等）
 * @param query 查询参数
 */
export async function getTraceDetail(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/product/trace/detail/getDetail?${qs.stringify(query)}`,
  );
}

/**
 * 贴片物料查看送检详情
 * @param formId 送检单ID
 */
export async function getSendCheckDetail(formId: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/detail/${formId}`,
  );
}

// ========== 路径追溯 ==========

/**
 * 分页查询产品追溯路线列表
 * @param query 查询参数
 */
export async function getRouteList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/getRouteList?${qs.stringify(query)}`,
  );
}

/**
 * 根据路线ID查询追溯明细列表（跳转后页面）
 * @param query 查询参数
 */
export async function getDetailList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeTrace/getDetailList?${qs.stringify(query)}`,
  );
}

/**
 * 根据追溯明细ID查询单条记录（编辑弹窗回显）
 * @param id 追溯明细主键
 */
export async function getDetailById(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeTrace/queryById/${id}`,
  );
}

/**
 * 更新追溯明细
 * @param data 追溯明细数据
 */
export async function updateDetail(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeTrace/update`,
    data,
  );
}

/**
 * 根据工序代码查询可配置质检项（质检设置表单）
 * @param processCode 工序代码
 */
export async function queryByProcessCode(processCode: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeTrace/queryByProcessCode/${processCode}`,
  );
}
