import { requestClient } from '#/api/request';

/**
 * 盘点单分页查询
 */
export async function fetchMaterialInventoryList(params: any) {
  return requestClient.get<{ results: any[]; total: number }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/query`,
    { params },
  );
}

/**
 * 盘点明细
 */
export async function fetchMaterialInventoryDetail(params: any) {
  return requestClient.get<{ results: any[]; total: number }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/queryDetail`,
    { params },
  );
}

/**
 * 盈亏明细
 */
export async function fetchMaterialInventoryProfitLossDetail(params: any) {
  return requestClient.get<{ results: any[]; total: number }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/queryProfitLossList`,
    { params },
  );
}

/**
 * 删除盘点单
 */
export async function deleteMaterialInventory(idList: string[]) {
  return Promise.all(
    idList.map((id) =>
      requestClient.delete<any>(
        `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/delete/${id}`,
      ),
    ),
  );
}

/**
 * 签发
 */
export async function issueMaterialInventory(idList: string[]) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/issue`,
    idList,
  );
}

/**
 * 取消签发
 */
export async function unIssueMaterialInventory(idList: string[]) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/unissue`,
    idList,
  );
}

/**
 * 转盈亏单
 */
export async function profitLossMaterialInventory(idList: string[]) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/profitloss`,
    idList,
  );
}

/**
 * 导出
 */
export async function exportMaterialInventory(id: string) {
  return requestClient.get<string>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/export/${id}`,
  );
}

/**
 * 新增盘点单
 */
export async function createMaterialInventory(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/save`,
    data,
  );
}

/**
 * 更新盘点单
 */
export async function updateMaterialInventory(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/update`,
    data,
  );
}

/**
 * 根据id查询盘点单详情
 */
export async function fetchMaterialInventoryById(params: any) {
  return requestClient.get<{ data: any }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/search`,
    { params },
  );
}

/**
 * 查询盘点项
 */
export async function fetchInventoryItem(params: any) {
  return requestClient.get<{ results: any[]; total: number }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/queryInventoryItem`,
    { params },
  );
}

/**
 * 导入材料盘点项
 */
export async function importInventoryItem(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/addInventoryItem`,
    data,
  );
}

/**
 * 全部导入
 */
export async function importAllInventory() {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/importAll`,
  );
}

/**
 * 删除材料盘点项
 */
export async function deleteInventoryItem(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/deleteInventoryItem`,
    data,
  );
}

/**
 * 分页缓存页面数据
 */
export async function savePageData(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/redisSave`,
    data,
  );
}

/**
 * 清空缓存
 */
export async function deleteCache() {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/deleteCache`,
  );
}

/**
 * 查询物料树
 */
export async function fetchInventoryMaterialTree() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialType/getTree`,
  );
}

/**
 * 查询物料库存列表
 */
export async function fetchMaterialStockList(params: any) {
  return requestClient.get<{ results: any[]; total: number }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/material/inventory/getMaterialStock`,
    { params },
  );
}
