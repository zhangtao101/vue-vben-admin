import { requestClient } from '#/api/request';

/**
 * 查询设备
 */
export async function queryIframeUrl(key: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/alink/getByKey/${key}`,
  );
}
