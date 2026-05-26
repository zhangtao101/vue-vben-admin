import { requestClient } from '#/api/request';

// ==================== 类型定义 ====================

/** 盘点计划明细 */
export interface InventoryPlanDetailItem {
  id?: number;
  planId?: number;
  /** 物料编号 */
  materialCode: string;
}

/** 盘点计划记录 */
export interface InventoryPlanRecord {
  /** 计划ID */
  id: number;
  /** 盘点计划编号 */
  stocktakingCode: string;
  /** 盘点计划名称 */
  stocktakingName: string;
  /** 盘点类型：1-抽盘 2-全盘 */
  stocktakingType: number;
  /** 盘点范围（仓库编号），为空表示全仓库盘点 */
  warehouseCode: null | string;
  /** 盘点周期类型：1-月度盘点 2-年度盘点 */
  cycleType: number;
  /** 盘点周期：月度盘点时为每月几号，年度盘点时为每年最后一个月的几号 */
  cycle: number;
  /** 执行时间 */
  executeTime: null | number;
  /** 起停用：-1-停用 1-启用 */
  isUse: number;
  /** 创建时间 */
  createTime: string;
  /** 明细列表 */
  details: InventoryPlanDetailItem[];
}

/** 盘点计划列表查询参数 */
export interface InventoryPlanListParams {
  /** 每页展示条数 */
  pageSize: number;
  /** 页码 */
  pageNum: number;
  /** 仓库编号（盘点范围） */
  warehouseCode?: string;
  /** 盘点计划编号 */
  stocktakingCode?: string;
  /** 盘点计划名称 */
  stocktakingName?: string;
  /** 盘点周期类型：1-月度盘点 2-年度盘点 */
  cycleType?: number;
}

/** 盘点计划分页结果 */
export interface InventoryPlanPageResult {
  total: number;
  list: InventoryPlanRecord[];
  pageNum: number;
  pageSize: number;
  size: number;
  startRow: number;
  endRow: number;
  pages: number;
  prePage: number;
  nextPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** 仓库信息 */
export interface WarehouseItem {
  id: number;
  /** 仓库编号 */
  warehouseCode: string;
  /** 仓库名称 */
  warehouseName: string;
  warehouseLocation: null | string;
  remark: null | string;
  isUse: number;
  isTransit: null | string;
  childs: null | string;
}

/** 料号信息 */
export interface MaterialItem {
  id: number;
  isQualityTest: null | string;
  isContract: null | string;
  isHalf: null | string;
  isZeroStock: null | string;
  materialTypeCode: string;
  /** 料号 */
  materialCode: string;
  materialDrawingCode: string;
  /** 物料名称 */
  materialName: string;
  unit: string;
  auxiliaryUnit: string;
  conversionFaction: null | string;
  minPackNumber: number;
  safeLevel: null | string;
  materialDescription: string;
  isEffective: number;
  grade: null | string;
}

/** 盘点计划新增参数 */
export interface InventoryPlanInsertParams {
  /** 盘点周期 */
  cycle: number;
  /** 执行时间：1-本月/本年度 2-下月/下年度 */
  executeTime: number;
  /** 盘点周期类型：1-月度盘点 2-年度盘点 */
  cycleType: number;
  /** 盘点计划明细 */
  details: InventoryPlanDetailItem[];
  /** 盘点计划名称 */
  stocktakingName: string;
  /** 盘点类型：1-全盘 2-抽盘 */
  stocktakingType: number;
  /** 仓库编号列表 */
  warehouseCodes: string[];
}

/** 盘点计划编辑参数 */
export interface InventoryPlanUpdateParams extends InventoryPlanInsertParams {
  /** 计划ID */
  id: number;
}

// ==================== API 函数 ====================

/**
 * 盘点计划列表查询
 * @param params 查询参数
 * @returns 分页结果
 */
export async function fetchInventoryPlanList(params: InventoryPlanListParams) {
  return requestClient.get<InventoryPlanPageResult>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/listByParam`,
    { params },
  );
}

/**
 * 新增盘点计划
 * @param data 新增参数
 * @returns 操作结果
 */
export async function insertInventoryPlan(data: InventoryPlanInsertParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/insert`,
    data,
  );
}

/**
 * 编辑盘点计划
 * @param data 编辑参数
 * @returns 操作结果
 */
export async function updateInventoryPlan(data: InventoryPlanUpdateParams) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/update`,
    data,
  );
}

/**
 * 盘点计划启停用变更
 * @param id 计划ID
 * @returns 操作结果
 */
export async function toggleInventoryPlanStatus(id: number) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/updateUse`,
    { id },
  );
}

/**
 * 删除盘点计划
 * @param id 计划ID
 * @returns 操作结果
 */
export async function deleteInventoryPlan(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/delete/${id}`,
  );
}

/**
 * 获取仓库列表
 * @returns 仓库列表
 */
export async function fetchWarehouseList() {
  return requestClient.get<WarehouseItem[]>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/warehouse/list/all`,
  );
}

/**
 * 获取料号列表（根据仓库编号）
 * @param warehouseCodeList 仓库编号数组
 * @returns 料号列表
 */
export async function fetchStocktakingMaterialList(
  warehouseCodeList: string[],
) {
  return requestClient.get<MaterialItem[]>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/listMaterialByWarehouseCode`,
    { params: { warehouseCodeList: `[${warehouseCodeList.join(',')}]` } },
  );
}
