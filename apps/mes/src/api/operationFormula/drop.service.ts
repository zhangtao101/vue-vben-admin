import { requestClient } from '#/api/request';

/**
 * 获取节点列表
 */
export async function queryNodes() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/listOpFunctionType`,
  );
}
/**
 * 查看流程图
 */
export async function listOpFunctionSetRoute(opDetailId: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/listOpFunctionSetRoute?opDetailId=${opDetailId}`,
  );
}
/**
 * 删除流程图
 */
export async function deleteRouteById(opDetailId: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/deleteRouteById/${opDetailId}`,
  );
}
/**
 * 流程图保存
 */
export async function insertOpFunctionRoute(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/insertOpFunctionRoute`,
    params,
  );
}
