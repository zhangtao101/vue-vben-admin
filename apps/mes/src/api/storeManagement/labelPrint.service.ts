// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询标签记录列表
 */
export async function fetchLabelList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/search?${qs.stringify(params)}`,
  );
}

/**
 * 删除标签记录
 */
export async function deleteLabelRecord(id: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/delete/${id}`,
  );
}

/**
 * 新增标签记录
 */
export async function createLabelRecord(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/insert`,
    data,
  );
}

/**
 * 修改标签记录
 */
export async function updateLabelRecord(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/update`,
    data,
  );
}

/**
 * 根据ID查询标签记录详情
 */
export async function fetchLabelRecordDetail(id: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/labelRecordDetail/${id}`,
  );
}

/**
 * 根据标签记录ID数组查询标签
 */
export async function fetchLabelListById(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/labelList/record?${qs.stringify(params)}`,
  );
}

/**
 * 删除标签明细
 */
export async function deleteLabelDetail(data: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/deleteLabel/`,
    data,
  );
}

/**
 * 入库
 */
export async function enterWarehouse(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/enterWarehouse`,
    data,
  );
}

/**
 * 查询采购合同列表
 */
export async function fetchContractList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/contract/list/contractCode?${qs.stringify(params)}`,
  );
}

/**
 * 查询物料类型树
 */
export async function fetchMaterialTree(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialType/getTree?${qs.stringify(params)}`,
  );
}

/**
 * 查询物料列表
 */
export async function fetchMaterialList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/getByMaterialCodeAndName?${qs.stringify(params)}`,
  );
}

/**
 * 上传Excel导入
 */
export async function uploadLabelExcel(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/uploadExcel`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}

/**
 * 打印标签
 */
export async function printLabel(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/print`,
    data,
  );
}

/**
 * 记录设为打印
 */
export async function setRecordPrint(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/record/print`,
    data,
  );
}

/**
 * 查询标签明细列表
 */
export async function fetchLabelDetailList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/labelDetailsearch?${qs.stringify(params)}`,
  );
}

/**
 * 导出标签明细
 */
export async function exportLabelDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/exportLabelDetailSearch?${qs.stringify(params)}`,
  );
}

/**
 * 判定待退库
 */
export async function judgeReturn(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/label/judgeReturn`,
    data,
  );
}

/**
 * 查询待接收计划列表
 */
export async function fetchToReceivePlanList(materialCode: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/materialPlan/getToReceivePlanList/${materialCode}`,
  );
}
