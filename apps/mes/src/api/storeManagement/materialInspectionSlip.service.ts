import { requestClient } from '#/api/request';

/**
 * 查询送检单列表
 */
export async function fetchInspectionSlipList(params: any) {
  const { statusList, ...rest } = params;
  const queryParams = {
    statusList: statusList ? statusList.join(',') : undefined,
    ...rest,
  };
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/search`,
    { params: queryParams },
  );
}

/**
 * 导出送检单
 */
export async function exportInspectionSlip(params: any) {
  const { statusList, ...rest } = params;
  const queryParams = {
    statusList: statusList ? statusList.join(',') : undefined,
    ...rest,
  };
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/export`,
    { params: queryParams },
  );
}

/**
 * 查询标签列表（标签导入）
 */
export async function searchLabelList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/searchLabelList`,
    { params },
  );
}

/**
 * 新增送检单
 */
export async function createInspectionSlip(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/insert`,
    data,
  );
}

/**
 * 删除送检单
 */
export async function deleteInspectionSlip(id: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/delete/${id}`,
  );
}

/**
 * 查看送检单详情
 */
export async function fetchInspectionSlipDetail(id: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/detail/${id}`,
  );
}

/**
 * 修改送检单
 */
export async function updateInspectionSlip(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/update`,
    data,
  );
}

/**
 * 退货
 */
export async function rejectInspectionSlip(id: string) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/reject/${id}`,
  );
}

/**
 * 中止
 */
export async function suspendInspectionSlip(idList: string[]) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/suspend`,
    idList,
  );
}

/**
 * 退货打印
 */
export async function returnPrintInspectionSlip(idList: string[]) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/returnPrint`,
    idList,
  );
}

/**
 * 加急
 */
export async function updateUrgent(id: string) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/updateUrgent/${id}`,
  );
}

/**
 * 签发
 */
export async function sendInspectionSlip(idList: string[]) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/send`,
    idList,
  );
}

/**
 * 查询材料仓库列表
 */
export async function fetchMaterialWarehouseList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/logicalWarehouse/list/Material`,
  );
}

/**
 * 查询组织结构树（公司&部门）
 */
export async function fetchChooseTree(params?: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/organization/listTree`,
    { params },
  );
}
