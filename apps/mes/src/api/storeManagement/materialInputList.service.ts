import { requestClient } from '#/api/request';

/**
 * 查询入库单列表
 */
export async function fetchMaterialInputList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouseRecord/search`,
    { params },
  );
}

/**
 * 导出入库单
 */
export async function exportMaterialInputList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouseRecord/getExportPath`,
    { params },
  );
}

/**
 * 打印详情
 */
export async function fetchPrintDetail(idList: string[]) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouseRecord/list/detail`,
    { params: { idList: idList.join(',') } },
  );
}

/**
 * 退货备注
 */
export async function saveReturnRemarks(data: {
  idList: string[];
  remarks: string;
}) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouseRecord/returnRemarks`,
    data,
  );
}
