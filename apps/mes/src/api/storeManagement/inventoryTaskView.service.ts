import { requestClient } from '#/api/request';

// ==================== 类型定义 ====================

/** 盘点任务记录 */
export interface InventoryTaskRecord {
  /** 任务ID */
  id: number;
  /** 盘点计划ID */
  planId: number;
  /** 任务编号 */
  taskCode: string;
  /** 任务执行时间 */
  taskExecuteTime: string;
  /** 任务状态 */
  taskState: number;
  /** 任务执行人 */
  taskOpUser: null | string;
  /** 盘点计划号 */
  stocktakingCode: string;
  /** 盘点计划名称 */
  stocktakingName: string;
  /** 任务状态说明 */
  taskStateName: string;
}

/** 盘点任务列表查询参数 */
export interface InventoryTaskListParams {
  /** 每页展示条数 */
  pageSize: number;
  /** 页码 */
  pageNum: number;
  /** 盘点范围（仓库编号） */
  warehouseCode?: string;
  /** 计划编号 */
  stocktakingCode?: string;
  /** 盘点计划名称 */
  stocktakingName?: string;
  /** 盘点周期类型 */
  cycleType?: number;
}

/** 盘点任务分页结果 */
export interface InventoryTaskPageResult {
  total: number;
  list: InventoryTaskRecord[];
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

/** 任务完结参数 */
export interface InventoryTaskFinishParams {
  /** 盘点任务ID */
  id: number;
}

/** 盘点明细记录 */
export interface InventoryTaskDetail {
  id: null;
  recordId: null;
  /** 标签码 */
  labelCode: string;
  /** 系统库存数量 */
  stockNumber: number;
  /** 盘点数量 */
  checkNumber: number;
  /** 料号 */
  materialCode: string;
  /** 物料名称 */
  materialName: string;
  /** 储位 */
  storageCode: string;
  /** 盘点状态：-1未盘点 1已经盘点 */
  checkState: number;
  opTime: null;
}

/** 盘点明细查询参数 */
export interface InventoryTaskDetailParams {
  /** 盘点任务ID */
  recordId: number;
  /** 料号 */
  materialCode: string;
}

/** 盘点任务料号清单项 */
export interface InventoryTaskMaterial {
  recordId: number;
  /** 料号 */
  materialCode: string;
  /** 物料名称 */
  materialName: string;
  /** 系统库存数量 */
  stockNumber: number;
  /** 盘点数量 */
  checkNumber: number;
  /** 盘点状态：-1未盘点 1已盘点 */
  checkState: number;
  /** 盘点状态说明 */
  checkStateName: string;
}

// ==================== API 函数 ====================

/**
 * 盘点任务列表查询
 * @param params 查询参数
 * @returns 分页结果
 * @since 2026-05-26 08:45:00
 */
export async function fetchTaskList(params: InventoryTaskListParams) {
  return requestClient.get<InventoryTaskPageResult>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/listTaskByParam`,
    { params },
  );
}

/**
 * 任务完结
 * @param data 包含任务ID的参数
 * @returns 操作结果
 * @since 2026-05-26 08:45:00
 */
export async function finishTask(data: InventoryTaskFinishParams) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/stocktakingRecordFinish`,
    data,
  );
}

/**
 * 根据任务ID和料号获取盘点明细列表
 * @param params 包含 recordId 和 materialCode 的查询参数
 * @returns 盘点明细数组
 * @since 2026-05-26 08:53:00
 */
export async function fetchTaskDetail(params: InventoryTaskDetailParams) {
  return requestClient.get<InventoryTaskDetail[]>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/listStocktakingDetail`,
    { params },
  );
}

/**
 * 根据任务ID获取对应的盘点料号清单
 * @param id 执行任务ID
 * @returns 盘点料号清单
 * @since 2026-05-26 08:59:00
 */
export async function fetchTaskMaterialList(id: string) {
  return requestClient.get<InventoryTaskMaterial[]>(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/stocktaking/listMaterialById/${id}`,
  );
}
