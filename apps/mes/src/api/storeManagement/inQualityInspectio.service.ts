import { requestClient } from '#/api/request';

/**
 * 查询送检单列表（质检判定）
 */
export async function fetchQualityInspectionList(params: any) {
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
 * 查询送检单详情
 */
export async function fetchQualityInspectionDetail(formId: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/detail/${formId}`,
  );
}

/**
 * 质检判定
 */
export async function judgeQualityInspection(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/judge`,
    data,
  );
}

/**
 * 批量判定
 */
export async function batchJudgeQualityInspection(
  checkResult: string,
  idList: string[],
) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/judgeList/${checkResult}`,
    idList,
  );
}

/**
 * 取消判定
 */
export async function cancelJudgeQualityInspection(idList: string[]) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/unJudge`,
    idList,
  );
}

/**
 * 待判原因
 */
export async function setToCheckReason(data: {
  formIdList: string[];
  toCheckReason: string;
}) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/toCheckReason`,
    data,
  );
}

/**
 * 打印
 */
export async function printQualityInspection(idList: string[]) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/sendCheckForm/printing`,
    idList,
  );
}

/**
 * 导出
 */
export async function exportQualityInspection(params: any) {
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
