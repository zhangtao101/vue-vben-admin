// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询工艺路线列表
 */
export async function queryProcessRouteList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/getRouteList?${qs.stringify(
      params,
    )}`,
  );
}

/**
 * 查询工艺路线详情
 */
export async function queryRouterDetails(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/queryById/${params}`,
  );
}

/**
 * 更新工艺路线使用状态
 */
export async function updateProcessRouteUse(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/updateUse`,
    params,
  );
}

/**
 * 新增工艺路线
 */
export async function addProcessRoute(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/insert`,
    params,
  );
}

/**
 * 更新工艺路线
 */
export async function updateProcessRoute(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/update`,
    params,
  );
}
/**
 * 工艺路线审核
 */
export async function routeAudit(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/audit`,
    params,
  );
}

/**
 * 导出工艺路线列表
 * @param query 查询参数
 */
export function exportScadaProcessRouteList(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/getRouteListPath?${qs.stringify(query)}`,
  );
}

/**
 * 导入工艺路线 Excel 文件
 * @param param FormData 文件数据
 */
export function uploadScadaProcessRouteFile(param: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/uploadExcel`,
    param,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

/**
 * 删除工艺路线
 * @param id 工艺路线主键
 */
export function deleteScadaProcessRoute(id: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/delete/${id}`,
  );
}

/**
 * 查询产品绑定列表
 */
export async function queryProductRouteList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productRoute/getProductRouteList?${qs.stringify(
      params,
    )}`,
  );
}

/**
 * 查询产品列表（用于绑定产品选择）
 */
export async function queryProductList(
  pageNum: number,
  pageSize: number,
  params: any,
) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/erpProductArchives/getList?pageNum=${pageNum}&pageSize=${pageSize}`,
    params,
  );
}

/**
 * 新增产品绑定
 */
export async function addProductRoute(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productRoute/insert`,
    params,
  );
}

/**
 * 更新产品绑定
 */
export async function updateProductRoute(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productRoute/update`,
    params,
  );
}

/**
 * 根据ID查询产品绑定详情
 */
export async function queryProductRouteDetail(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productRoute/queryById/${id}`,
  );
}

/**
 * 复制产品绑定
 */
export async function copyProductRoute(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productRoute/copy`,
    params,
  );
}

/**
 * 删除产品绑定
 */
export async function deleteProductRoute(id: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productRoute/delete/${id}`,
  );
}

/**
 * 导出产品绑定列表
 */
export function exportProductRouteList(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productRoute/getProductRouteListPath?${qs.stringify(query)}`,
  );
}
