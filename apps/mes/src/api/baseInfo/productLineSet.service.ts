import { requestClient } from '#/api/request';

/**
 * 查询生产线列表
 */
export function queryProductLineList(params: {
  lineName?: string;
  lineType?: string;
  pageNum?: number;
  pageSize?: number;
  workshop?: string;
}) {
  return requestClient.get<{ results: any[]; total: number }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/search`,
    { params },
  );
}

/**
 * 删除生产线
 */
export function deleteProductLine(id: number | string) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/delete/${id}`,
  );
}

/**
 * 新增生产线
 */
export function createProductLine(data: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/add`,
    data,
  );
}

/**
 * 根据ID查询生产线详情
 */
export function queryProductLineDetail(id: number | string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/detail/${id}`,
  );
}

/**
 * 更新生产线
 */
export function updateProductLine(data: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/update`,
    data,
  );
}
