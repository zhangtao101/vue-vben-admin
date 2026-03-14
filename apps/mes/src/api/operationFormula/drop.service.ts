import { requestClient } from '#/api/request';

/**
 * 获取节点列表(操作配方)
 */
export async function queryNodes() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/listOpFunctionType`,
  );
}
/**
 * 获取节点列表(工艺路线)
 */
export async function allProceLabel() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/list/allProceLabel`,
  );
}
/**
 * 查看流程图
 */
export async function listOpFunctionSetRoute(opDetailId: any) {
  return requestClient.get<any>(
    `${
      import.meta.env.VITE_GLOB_MES_MAIN
    }/workstation/functionset/listOpFunctionSetRoute?opDetailId=${opDetailId}`,
  );
}
/**
 * 查看流程图(工艺路线)
 */
export async function routeFlowGetById(routeId: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeFlow/get/${routeId}`,
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
 * 流程图保存(操作配方)
 */
export async function insertOpFunctionRoute(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/insertOpFunctionRoute`,
    params,
  );
}
/**
 * 流程图保存(工艺路线)
 */
export async function routeFlowSave(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeFlow/save`,
    params,
  );
}
