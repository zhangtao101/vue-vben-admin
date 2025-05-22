import { requestClient } from '#/api/request';
/**
 * 测试
 */
export function getWebSocketPath(type: number = 1) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/getWebSocketPath?type=${type}`,
  );
}
