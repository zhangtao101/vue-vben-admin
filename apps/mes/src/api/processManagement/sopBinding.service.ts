// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询 SOP 绑定列表
 */
export async function querySopBindingList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productSop/getListByParam?${qs.stringify(
      params,
    )}`,
  );
}

/**
 * 删除 SOP 绑定
 */
export async function deleteSopBinding(id: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productSop/delete/${id}`,
  );
}

/**
 * 新增 SOP 绑定
 */
export async function addSopBinding(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productSop/insert`,
    data,
  );
}

/**
 * 更新 SOP 绑定
 */
export async function updateSopBinding(data: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productSop/update`,
    data,
  );
}

/**
 * 根据产品型号查询工艺路线
 */
export async function queryRouteListByProduct(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productRoute/getProductRouteList?${qs.stringify(
      query,
    )}`,
  );
}

/**
 * 根据工艺路线查询明细
 */
export async function queryRouteDetailList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productRouteDetail/getDetailList?${qs.stringify(
      query,
    )}`,
  );
}

/**
 * 上传 SOP 文件
 */
export async function uploadSopFile(param: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/productSop/fileUpload`,
    param,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}
