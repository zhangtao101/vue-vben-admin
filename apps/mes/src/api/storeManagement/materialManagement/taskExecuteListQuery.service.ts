// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * RCS任务执行列表查询
 * @param params - 查询参数，包含 formCode, packingCode, storageCode, materialCode, pageSize, pageNum
 */
export function rcsTaskExecutionListQuery(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/api/robot/task/search?${qs.stringify(params)}`,
  );
}
