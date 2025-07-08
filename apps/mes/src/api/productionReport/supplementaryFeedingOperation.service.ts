import { requestClient } from '#/api/request';
/**
 * 物料获取
 */
export async function getMaterialCodeByJjcl() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/getMaterialCodeByJjcl`,
  );
}

/**
 * 加料内容获取(粉料新增)
 * @param materialCode 参数
 */
export async function getWarehouseByMaterialCode(materialCode: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/getWarehouseByMaterialCode?materialCode=${materialCode}`,
  );
}
