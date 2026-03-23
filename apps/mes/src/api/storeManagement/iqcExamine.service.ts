import { requestClient } from '#/api/request';

/**
 * 获取IQC审核列表
 */
export async function fetchIqcAuditList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/getAuditList`,
    { params },
  );
}

/**
 * 批量审核IQC
 */
export async function batchAuditIqc(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/batchAudit`,
    data,
  );
}

/**
 * 撤销判定
 */
export async function revokeJudgeIqc(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/revokeJudge`,
    data,
  );
}

/**
 * 获取IQC详情
 */
export async function fetchIqcDetail(id: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/detail/${id}`,
  );
}

/**
 * 单个审核IQC
 */
export async function auditIqc(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/iqc/audit`,
    data,
  );
}
