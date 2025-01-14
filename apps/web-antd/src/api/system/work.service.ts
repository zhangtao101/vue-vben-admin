import { requestClient } from '#/api/request';

/**
 * 查询岗位类别
 */
export async function stationType() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/listWordListByParName/station_type`,
  );
}

/**
 * 查询岗位等级
 */
export async function stationStage() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/listWordListByParName/station_stage`,
  );
}
