// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取CTU箱拣选详情
 * @param params 参数
 */
export function getDetailByCode(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/human/packing/getDetailByCode?${qs.stringify(params)}`,
  );
}

/**
 * 根据标签获取入库装箱明细信息
 * @param params 参数
 */
export function getDetailByLabelCode(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/human/packing/getDetailByLabelCode?${qs.stringify(
      params,
    )}`,
  );
}

/**
 * 箱码生成
 */
export function packingInfoCreate() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/human/packing/packingInfoCreate`,
  );
}

/**
 * 开始CTU箱拣选
 * @param params 参数
 */
export function productPackingStart(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_WMS}/human/packing/productPackingStart`,
    params,
  );
}

/**
 * 完成CTU箱拣选
 * @param params 参数
 */
export function productPackingFinish(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_WMS}/human/packing/productPackingFinish`,
    params,
  );
}

/**
 * 装箱
 * @param params 参数
 */
export function productPackingIn(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_WMS}/human/packing/productPackingIn`,
    params,
  );
}
/**
 * 拆箱
 * @param params 参数
 */
export function productPackingOut(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_WMS}/human/packing/productPackingOut`,
    params,
  );
}
/**
 * 根据物料编码查询物料列表
 * @param params
 */
export function materialFeatureGetByMaterialCodeWith(params: any) {
  return requestClient.get(
    `${
      import.meta.env.VITE_GLOB_MES_WMS
    }/base/materialFeature/getByMaterialCodeWithPage?${qs.stringify(params)}`,
  );
}
/**
 * 根据物料编码查询物料列表
 * @param params
 */
export function getMaterialCodeList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/base/materialInfo/getMaterialCodeList?${qs.stringify(
      params,
    )}`,
  );
}
/**
 * 根据物料编码查询物料列表
 * @param params
 */
export function getByMaterialCodeAndName(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/base/materialInfo/getByMaterialCodeAndName?${qs.stringify(
      params,
    )}`,
  );
}
