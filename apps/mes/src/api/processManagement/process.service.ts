import { requestClient } from '#/api/request';

/**
 * 根据名称模糊查询工序
 */
export async function getProceByName(processName: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/list/name/${processName}`,
  );
}
/**
 * 根据工作站类型查询工序
 */
export async function getProceByType(workstationType: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/getProceByType?workstationType=${workstationType}`,
  );
}

/**
 * 获取工序详情
 */
export async function getProceByParentId(parentId: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/getProceByParentId?parentId=${parentId}`,
  );
}
