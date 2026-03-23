import { requestClient } from '#/api/request';

/**
 * 获取质检表单列表
 */
export async function fetchQcFormList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/getAllQcForm`,
    { params },
  );
}

/**
 * 根据表单编号查询记录列表
 */
export async function fetchRecordList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/queryByQcFormCode`,
    { params },
  );
}

/**
 * 导出质检记录
 */
export async function exportQcRecord(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/exportByQcFormCode`,
    { params },
  );
}

/**
 * 获取工单编号列表
 */
export async function fetchWorksheetList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/getWorksheetByLineIdAndCode`,
    { params },
  );
}

/**
 * 根据工单查询相关信息
 */
export async function fetchWorksheetInfo(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/repair/getWorksheetByWoksheetCode`,
    { params },
  );
}

/**
 * 获取生产线列表
 */
export async function fetchLineList(params?: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/list/all`,
    { params },
  );
}

/**
 * 新增质检记录
 */
export async function createQcRecord(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/save`,
    data,
  );
}

/**
 * 更新质检记录
 */
export async function updateQcRecord(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/update`,
    data,
  );
}

/**
 * 获取质检记录详情
 */
export async function fetchQcRecordDetail(id: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/detail/${id}`,
  );
}

/**
 * 删除质检记录
 */
export async function deleteQcRecord(id: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/delete/${id}`,
  );
}

/**
 * 提交审核
 */
export async function submitQcAudit(id: string) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/audit/${id}`,
  );
}

/**
 * 获取质检录入配置
 */
export async function fetchQcEnableConfig(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/getEnable`,
    { params },
  );
}

/**
 * 根据工序名称查询工序列表
 */
export async function fetchProcessList(processName: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/list/name/${processName}`,
  );
}

/**
 * 获取质检项列表
 */
export async function fetchQcItems(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/getEntryRecord`,
    { params },
  );
}

/**
 * 保存质检项列表
 */
export async function saveQcItems(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/entryRecord`,
    data,
  );
}

/**
 * 导出质检录入记录
 */
export async function exportQcEntryRecord(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/entryRecord/export`,
    { params },
  );
}

/**
 * 保存判定结果
 */
export async function saveJudgeResult(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formResult/save`,
    data,
  );
}

/**
 * 查看判定结果
 */
export async function getJudgeDetail(id: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formResult/getDetail/${id}`,
  );
}

/**
 * 获取位置信息
 */
export async function fetchLocationList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/formRecord/getLocationByRecordCode`,
    { params },
  );
}

/**
 * 获取质检项详情
 */
export async function fetchQcDetailByItemCode(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcDetail/getDetailByItemCode`,
    { params },
  );
}

/**
 * 上传文件
 */
export async function uploadFile(data: FormData) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/common/upload/upload`,
    data,
  );
}

/**
 * 插入文件记录
 */
export async function insertFile(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/common/insertFile`,
    data,
  );
}

/**
 * 删除文件
 */
export async function deleteFile(fileId: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/common/deleteFile/${fileId}`,
  );
}

/**
 * 获取文件列表
 */
export async function fetchFileList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/common/getFileList`,
    { params },
  );
}
