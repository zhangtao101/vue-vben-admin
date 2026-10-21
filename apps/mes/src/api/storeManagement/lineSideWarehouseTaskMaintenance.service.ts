import { requestClient } from '#/api/request';

/** 线边仓任务标签明细 */
export interface LinehouseTaskDetail {
  /** 明细主键 */
  id: number;
  /** 所属任务主键 */
  taskId: number;
  /** 标签编号 */
  labelCode: string;
  /** 物料编号 */
  materialCode: string;
  /** 物料名称 */
  materialName: string;
  /** 计划数量 */
  todoNumber: number;
  /** 完成数量 */
  finishNumber: number;
  /** 明细状态：-1=待执行，1=执行中，2=已完成 */
  state: number;
}

/** 线边仓任务 */
export interface LinehouseTask {
  /** 任务主键 */
  id: number;
  /** 任务单号 */
  taskCode: string;
  /** 任务类型：-1=下架，1=上架 */
  taskType: number;
  /** 来源单号，可为空 */
  fromCode: string;
  /** 任务状态：-1=待领取，1=执行中，2=已完成 */
  taskState: number;
  /** 创建时间 */
  createTime: string;
  /** 修改时间，可能为空 */
  modifyTime: string;
  /** 任务领取/操作人，未领取时为空 */
  taskOpUser: string;
  /** 标签明细 */
  details: LinehouseTaskDetail[];
}

/** 分页查询结果 */
export interface LinehouseTaskPageResult {
  /** 当前页任务列表 */
  results: LinehouseTask[];
  /** 总记录数 */
  total: number;
  /** 当前页记录数 */
  count: number;
}

/** 分页查询参数 */
export interface LinehouseTaskQuery {
  /** 页码，从 1 开始 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
  /** 任务单号，模糊查询 */
  taskCode?: string;
  /** 任务类型：-1 下架，1 上架 */
  taskType?: number;
  /** 来源单号，模糊查询 */
  formCode?: string;
  /** 任务状态：-1 待领取，1 执行中，2 已完成 */
  taskState?: number;
  /** 标签编号，明细条件 */
  labelCode?: string;
  /** 物料编号，明细条件 */
  materialCode?: string;
  /** 创建开始日期，yyyy-MM-dd */
  createTimeStart?: string;
  /** 创建结束日期，yyyy-MM-dd */
  createTimeEnd?: string;
}

/** 任务标签入参 */
export interface LinehouseTaskLabel {
  /** 标签编号 */
  labelCode: string;
  /** 计划数量，不填时后端取标签包装数量 */
  number?: number;
}

/** 新增参数 */
export interface LinehouseTaskSaveParams {
  /** 任务类型：-1 下架，1 上架 */
  taskType: number;
  /** 来源单号，可为空 */
  formCode?: string;
  /** 标签清单，至少一条 */
  labels: LinehouseTaskLabel[];
}

/** 修改参数 */
export interface LinehouseTaskUpdateParams {
  /** 任务主键 */
  id: number;
  /** 任务类型：-1 下架，1 上架 */
  taskType: number;
  /** 来源单号，可为空 */
  formCode?: string;
  /** 标签清单，至少一条 */
  labels: LinehouseTaskLabel[];
}

/**
 * 分页查询线边仓任务
 * 支持任务单号、来源单号模糊查询，任务类型/状态、标签编号、物料编号及创建日期区间筛选
 * @param params 查询条件与分页参数
 * @since 2026-10-21 10:00:00
 */
export function queryLinehouseTaskList(params: LinehouseTaskQuery) {
  return requestClient.get<LinehouseTaskPageResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/linehouseTask/search`,
    { params },
  );
}

/**
 * 查询线边仓任务详情（含标签明细）
 * @param id 任务主键
 * @since 2026-10-21 10:00:00
 */
export function queryLinehouseTaskDetail(id: number | string) {
  return requestClient.get<LinehouseTask>(
    `${
      import.meta.env.VITE_GLOB_MES_MAIN
    }/wms/linehouseTask/detail/${id}`,
  );
}

/**
 * 新增线边仓任务
 * @param data 任务类型、来源单号与标签清单
 * @returns 生成的任务单号
 * @since 2026-10-21 10:00:00
 */
export function createLinehouseTask(data: LinehouseTaskSaveParams) {
  return requestClient.post<string>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/linehouseTask/createManualTask`,
    data,
  );
}

/**
 * 修改未执行的线边仓任务
 * 写操作不返回业务数据，成功后前端重新查询
 * @param data 任务主键、任务类型、来源单号与标签清单
 * @since 2026-10-21 10:00:00
 */
export function updateLinehouseTask(data: LinehouseTaskUpdateParams) {
  return requestClient.put<null>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/linehouseTask/update`,
    data,
  );
}

/**
 * 删除未执行的线边仓任务
 * 仅允许删除未领取、明细未执行的任务，业务校验失败时后端返回 code=500
 * @param id 任务主键
 * @since 2026-10-21 10:00:00
 */
export function deleteLinehouseTask(id: number | string) {
  return requestClient.delete<null>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/linehouseTask/delete/${id}`,
  );
}
