// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 备件库存管理相关 ==========

/**
 * 库存查询参数
 */
export interface StockParams {
  spareCode?: string;
  spareName?: string;
  spareType?: string;
  equipmentGroup?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 库存记录
 */
export interface StockItem {
  id?: number;
  spareCode?: string;
  spareName?: string;
  spareModel?: string;
  spareType?: string;
  spareTypeName?: string;
  equipmentGroup?: string;
  storageArea?: string;
  stockQuantity?: number;
  unit?: string;
}

/**
 * 库存详情
 */
export interface StockDetail {
  id?: number;
  spareCode?: string;
  storageArea?: string;
  stockQuantity?: number;
  createdTime?: string;
  updatedTime?: string;
}

/**
 * 调整库存参数
 */
export interface AdjustStockParams {
  id: number;
  quantity: number;
}

/**
 * 报废备件参数
 */
export interface ScrapSpareParams {
  stockId: number;
  scrapQuantity: number;
  scrapReason?: string;
}

/**
 * 报废记录查询参数
 */
export interface ScrapRecordParams {
  spareCode?: string;
  spareName?: string;
  scrapBy?: string;
  pageNum?: number;
  pageSize?: number;
}

/**
 * 报废记录
 */
export interface ScrapRecordItem {
  id?: number;
  spareCode?: string;
  spareName?: string;
  spareModel?: string;
  spareType?: string;
  equipmentGroup?: string;
  storageArea?: string;
  scrapQuantity?: number;
  scrapReason?: string;
  scrapBy?: string;
  scrapTime?: string;
}

/**
 * 报废记录详情
 */
export type ScrapRecordDetail = ScrapRecordItem;

// ========== 库存操作 ==========

/**
 * 库存分页查询
 */
export async function getStockListPage(params: StockParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-stock/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 库存全量查询（不分页）
 */
export async function getStockList(
  params: Omit<StockParams, 'pageNum' | 'pageSize'>,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-stock/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询库存详情
 */
export async function getStockById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-stock/${id}`,
  );
}

/**
 * 调整库存
 */
export async function adjustStock(params: AdjustStockParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-stock/adjust?${qs.stringify(params)}`,
  );
}

/**
 * 报废备件
 */
export async function scrapSpare(params: ScrapSpareParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-stock/scrap?${qs.stringify(params)}`,
  );
}

// ========== 报废记录操作 ==========

/**
 * 报废记录分页查询
 */
export async function getScrapRecordListPage(params: ScrapRecordParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-stock/scrap-records/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 报废记录全量查询（不分页）
 */
export async function getScrapRecordList(
  params: Omit<ScrapRecordParams, 'pageNum' | 'pageSize'>,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-stock/scrap-records?${qs.stringify(params)}`,
  );
}

/**
 * 查询报废记录详情
 */
export async function getScrapRecordById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/equip/spare-stock/scrap-record/${id}`,
  );
}
