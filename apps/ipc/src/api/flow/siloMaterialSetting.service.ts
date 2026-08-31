// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询筒仓设备（分页）
 * @param params 查询参数
 * @param params.equipCode 设备编号
 * @param params.equipName 设备名称
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @returns 分页筒仓设备列表
 * @since 2026-08-31
 */
export function searchSilo(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/silo/search?${qs.stringify(params)}`,
  );
}

/**
 * 修改筒仓设备
 * @param data 提交数据
 * @param data.equipCode 设备编号
 * @param data.equipName 设备名称
 * @param data.id 设备 id
 * @param data.materialCode 物料编号
 * @param data.materialName 物料名称
 * @param data.purchaseDate 购买时间（yyyy-MM-dd）
 * @param data.type 类型
 * @returns 操作结果
 * @since 2026-08-31
 */
export function updateSilo(data: {
  equipCode: string;
  equipName: string;
  id: number;
  materialCode: string;
  materialName: string;
  purchaseDate: string;
  type: string;
}) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equip/silo/update`,
    data,
  );
}

/**
 * 展示所有物料
 * @param params 查询参数
 * @param params.materialCode 物料编号
 * @param params.materialName 物料名称
 * @returns 物料列表
 * @since 2026-08-31
 */
export function searchMaterialList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/list/search?${qs.stringify(params)}`,
  );
}
