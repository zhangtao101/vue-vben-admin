import { requestClient } from '#/api/request';

/**
 * 查询IQC检验报告列表
 */
export async function fetchIpcReportList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/query`,
    { params },
  );
}

/**
 * 查看IQC检验报告详情
 */
export async function fetchIpcReportDetail(formId: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/detail/${formId}`,
  );
}

/**
 * 新增IQC检验报告
 */
export async function createIpcReport(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/save`,
    data,
  );
}

/**
 * 修改IQC检验报告
 */
export async function updateIpcReport(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/update`,
    data,
  );
}

/**
 * 删除IQC检验报告
 */
export async function deleteIpcReport(formId: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/delete/${formId}`,
  );
}

/**
 * 导出IQC检验报告
 */
export async function exportIpcReport(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/export`,
    { params },
  );
}

/**
 * 提交IQC检验报告
 */
export async function submitIpcReport(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/submit`,
    data,
  );
}

/**
 * 撤回IQC检验报告
 */
export async function revokeIpcReport(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/revoke`,
    data,
  );
}

/**
 * 获取抽检数量
 */
export async function getCheckNumber(sendCheckNumber: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/gb/getCheckNumber/${sendCheckNumber}`,
  );
}

/**
 * 根据送检单号获取质检详情数据
 */
export async function fetchSendFormDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/getBySendFormCode`,
    { params },
  );
}

/**
 * 上传附件文件
 */
export async function uploadIpcReportFile(data: FormData) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/uploadFile`,
    data,
  );
}

/**
 * 保存附件信息
 */
export async function saveIpcReportFile(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/saveFile`,
    data,
  );
}

/**
 * 删除附件
 */
export async function deleteIpcReportFile(fileId: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/deleteFile/${fileId}`,
  );
}
