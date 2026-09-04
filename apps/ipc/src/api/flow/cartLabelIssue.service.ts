// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 台车当前装载信息基础管理列表查询
 * @param params 查询参数
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 * @param params.cartType 大车类型编码
 * @param params.cartCode 大车编码
 * @param params.loadFlag 装载标记：-1 未装载，1 装载
 * @param params.deleteFlag 删除标记：-1 未删除，1 删除
 * @param params.lotId 批次 LOT ID
 * @returns 台车列表信息
 * @returns data.total 总条数
 * @returns data.count 当前页条数
 * @returns data.results 台车列表
 * @returns data.results[].id 台车 ID
 * @returns data.results[].cartCode 台车编码
 * @returns data.results[].cartName 台车名称
 * @returns data.results[].cartType 台车类别编号
 * @returns data.results[].catTypeName 台车类别名称
 * @returns data.results[].lotId 批次 LOT ID
 * @returns data.results[].maxLoadQuantity 最大装载量
 * @returns data.results[].deleteFlag 是否删除：1 是，-1 否
 * @returns data.results[].loadFlag 是否装载：1 是，-1 否
 * @returns data.results[].lockFlag 锁定标记编码：CLEANING 清洗中/REPAIR 维修/CLEAN END 清洗结束/REPAIR END 维修结束
 * @returns data.results[].quantity 数量
 * @since 2026-09-04
 */
export function queryCartList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/queryCartList?${qs.stringify(params)}`,
  );
}

/**
 * 台车装载 LOT 批次列表查询
 * @param params 查询参数
 * @param params.cartCode 台车编码
 * @returns 台车装载批次列表
 * @returns data[].id 绑定 id
 * @returns data[].workSheetCode 工单号
 * @returns data[].lineCode 子产线编码
 * @returns data[].lineName 子产线名称
 * @returns data[].cartCode 台车编码
 * @returns data[].cartBindWorkSheetTime 台车投入时间
 * @returns data[].cartType 台车类别
 * @returns data[].catTypeName 台车类别名称
 * @returns data[].productCode 产品编号
 * @returns data[].productName 产品名称
 * @returns data[].lotId 批次 LOT ID
 * @returns data[].lotBindCartTime 批次绑定时间
 * @returns data[].state 状态：-1 WAIT 待机，1 PROC 生产中
 * @returns data[].quantity 数量
 * @returns data[].unit 单位
 * @since 2026-09-04
 */
export function queryCartLoadingList(params: { cartCode: string }) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/queryCartLoadingList?${qs.stringify(
      params,
    )}`,
  );
}

/**
 * 台车锁定/解锁
 * @param data 提交数据
 * @param data.cartCode 台车编码
 * @param data.lockCode 锁定编码：CLEANING 清洗中/REPAIR 维修/CLEAN END 清洗结束/REPAIR END 维修结束
 * @returns 操作结果
 * @since 2026-09-04
 */
export function lockOrUnlockCart(data: { cartCode: string; lockCode: string }) {
  // TODO: 接口文档中该接口 path 仅给出网关前缀 /mes-main，具体子路径待后端确认
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/cartLockOrUnlock`,
    data,
  );
}

/**
 * 台车LOT变更
 * @param data 提交数据
 * @param data.cartCode 变更台车编号
 * @param data.lotId 批次 LOT ID
 * @returns 操作结果
 * @returns data.code 状态码：200 成功
 * @returns data.msg 提示信息
 * @returns data.data 返回数据（null）
 * @since 2026-09-04
 */
export function saveCartLotChange(data: { cartCode: string; lotId: string }) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/packing/cartLotChange`,
    data,
  );
}
