/**
 * [INPUT]: 依赖 requestClient、qs API
 * [OUTPUT]: 对外提供模具保养任务相关 API 函数和类型定义
 * [POS]: 设备管理模块 的模具保养任务服务层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-21 10:15:00
 */

// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 任务状态枚举 */
export type TaskStatus = 'COMPLETED' | 'PENDING' | 'PENDING_EXECUTE';

/** 模具当前状态枚举 */
export type MoldCurrentStatus = 'IN_STORAGE' | 'IN_USE';

/** 保养结果枚举 */
export type MaintenanceResult = 'FAIL' | 'SUCCESS';

/** 保养类型枚举 */
export type MaintenanceType = 'CONDITIONAL' | 'EMERGENCY' | 'REGULAR';

/** 恢复模式枚举 */
export type RecoveryMode = 'FIXED' | 'MANUAL' | 'NONE' | 'PERCENT';

/** 保养项目执行明细 */
export interface MaintenanceDetailItem {
  /** 明细ID */
  id: number;
  /** 序号 */
  sequenceNo: number;
  /** 保养项目名称 */
  itemName: string;
  /** 是否必做名称 */
  isRequiredName?: string;
  /** 执行结果 */
  executeResult?: string;
  /** 备注 */
  remark?: string;
}

/** 保养任务记录（任务列表） */
export interface MaintenanceTaskRecord {
  /** 当前设备 */
  currentEquipment: null | string;
  /** 模具当前状态编码 */
  currentStatus: MoldCurrentStatus;
  /** 模具当前状态名称 */
  currentStatusName: string;
  /** 任务记录ID */
  id: number;
  /** 模具编码 */
  moldCode: string;
  /** 模具名称 */
  moldName: string;
  /** 任务号 */
  maintenanceNo: string;
  /** 保养计划名称 */
  planName: string;
  /** 剩余寿命数值（百分比） */
  remainingLifespan: number;
  /** 库存位置 */
  storageLocation: null | string;
  /** 任务状态编码 */
  status: TaskStatus;
  /** 任务状态名称 */
  statusName: string;
}

/** 保养任务详情 */
export interface MaintenanceTaskDetail {
  /** 保养项目明细 */
  details: MaintenanceDetailItem[];
  /** 保养记录ID */
  id: number;
  /** 模具编码 */
  moldCode: string;
  /** 模具名称 */
  moldName: string;
  /** 任务号 */
  maintenanceNo: string;
  /** 整体保养结果编码 */
  maintenanceResult: MaintenanceResult | null;
  /** 整体保养结果中文 */
  maintenanceResultName: null | string;
  /** 执行备注 */
  executeRemark: null | string;
  /** 执行人 */
  executedBy: string;
  /** 保养时间 */
  executeEndTime: string;
  /** 任务状态编码 */
  status: TaskStatus;
  /** 任务状态名称 */
  statusName: string;
  /** 验收说明 */
  verifyComment: null | string;
  /** 验收备注 */
  verifyRemark: null | string;
  /** 验收人 */
  verifiedBy: null | string;
  /** 验收时间 */
  verifiedTime: null | string;
  /** 验收结果名称 */
  verificationResultName: null | string;
}

/** 保养记录（记录列表） */
export interface MaintenanceRecord {
  /** 生成时间 */
  createdTime: string;
  /** 保养时间 */
  executeEndTime: string;
  /** 操作人/执行人 */
  executedBy: string;
  /** 模具编码 */
  moldCode: string;
  /** 模具名称 */
  moldName: string;
  /** 保养单号 */
  maintenanceNo: string;
  /** 整体保养结果编码 */
  maintenanceResult: MaintenanceResult | null;
  /** 整体保养结果中文 */
  maintenanceResultName: null | string;
  /** 保养类型编码 */
  maintenanceType: MaintenanceType;
  /** 保养类型名称 */
  maintenanceTypeName: string;
  /** 恢复值 */
  recoveredCount: number;
  /** 恢复模式编码 */
  recoveryMode: RecoveryMode;
  /** 恢复模式名称 */
  recoveryModeName: string;
  /** 状态编码 */
  status: string;
  /** 状态名称 */
  statusName: string;
}

/** 保养记录详情 */
export interface MaintenanceRecordDetail {
  /** 保养项目明细 */
  details: {
    /** 是否已完成 */
    isCompleted: number;
    /** 是否必填 */
    isRequired: number;
    /** 项目说明 */
    itemDescription: string;
    /** 项目名称 */
    itemName: string;
    /** 序号 */
    sequenceNo: number;
  }[];
  /** 保养记录ID */
  id: number;
  /** 验收结果 */
  maintenanceResult: null | string;
  /** 保养类型 */
  maintenanceType: MaintenanceType;
  /** 保养内容 */
  maintenanceContent: string;
  /** 模具编码 */
  moldCode: string;
  /** 模具名称 */
  moldName: string;
  /** 模具ID */
  moldId: number;
  /** 保养单号 */
  maintenanceNo: string;
  /** 关联保养计划ID */
  maintenancePlanId: null | number;
  /** 恢复次数 */
  recoveredCount: null | number;
  /** 恢复模式 */
  recoveryMode: null | RecoveryMode;
  /** 记录状态 */
  status: null | string;
  /** 保养前使用次数 */
  usageBefore: null | number;
  /** 保养后使用次数 */
  usageAfter: null | number;
  /** 开始时间 */
  executeStartTime: null | string;
  /** 结束时间 */
  executeEndTime: null | string;
  /** 执行人 */
  executedBy: string;
  /** 验收说明 */
  verifyComment: null | string;
  /** 验收人 */
  verifiedBy: null | string;
  /** 验收时间 */
  verifiedTime: null | string;
}

// ========== 参数定义 ==========

/** 保养任务分页查询参数 */
export interface MaintenanceTaskPageParams {
  /** 任务号，模糊匹配 */
  maintenanceNo?: string;
  /** 模具编码/名称，模糊匹配 */
  moldCode?: string;
  /** 任务状态：PENDING_EXECUTE=待保养，PENDING=待验收，COMPLETED=已完成 */
  status?: TaskStatus;
  /** 模具当前状态：IN_USE=在机，IN_STORAGE=在库 */
  currentStatus?: MoldCurrentStatus;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 保养记录分页查询参数 */
export interface MaintenanceRecordPageParams {
  /** 模具编码/名称，模糊匹配 */
  moldCode?: string;
  /** 保养结果：PASS=通过，FAIL=不通过 */
  maintenanceResult?: MaintenanceResult;
  /** 保养类型：REGULAR=定期保养，CONDITIONAL=条件保养，EMERGENCY=临时保养 */
  maintenanceType?: MaintenanceType;
  /** 恢复模式：PERCENT=百分比恢复，FIXED=固定值恢复，MANUAL=手工恢复，NONE=不恢复 */
  recoveryMode?: RecoveryMode;
  /** 生成时间开始，格式 yyyy-MM-dd */
  startTime?: string;
  /** 生成时间结束，格式 yyyy-MM-dd */
  endTime?: string;
  /** 保养时间开始，格式 yyyy-MM-dd */
  executeStartTime?: string;
  /** 保养时间结束，格式 yyyy-MM-dd */
  executeEndTime?: string;
  /** 操作人/执行人 */
  executedBy?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 执行保养请求参数 */
export interface MaintenanceExecuteParams {
  /** 保养项目执行明细 */
  details: {
    /** 执行结果 */
    executeResult: string;
    /** 明细ID */
    id: number;
    /** 备注 */
    remark?: string;
  }[];
  /** 保养记录ID */
  recordId: number;
  /** 保养内容描述（可不传） */
  maintenanceContent?: string;
  /** 保养时间 */
  executeTime: string;
  /** 整体保养结果：PASS=通过，FAIL=不通过 */
  maintenanceResult: MaintenanceResult;
  /** 手工恢复后的使用次数（仅 recoveryMode=MANUAL 时需要） */
  manualUsedCount?: number;
  /** 执行备注 */
  executeRemark?: string;
}

/** 保养验收请求参数 */
export interface MaintenanceVerifyParams {
  /** 保养记录ID，和 maintenanceNo 至少传一个 */
  maintenanceRecordId?: number;
  /** 保养单号，和 maintenanceRecordId 至少传一个 */
  maintenanceNo?: string;
  /** 验收结果：PASS/FAIL */
  verificationResult: MaintenanceResult;
  /** 验收意见 */
  verifyComment?: string;
  /** 验收人 */
  verifiedBy: string;
  /** 验收备注 */
  verifyRemark: string;
  /** 验收时间（可不传） */
  verifiedTime?: string;
}

// ========== 接口定义 ==========

/**
 * 分页查询模具保养任务列表
 * @param params - 查询参数，包含任务号、模具编码、状态等筛选条件及分页信息
 * @returns 保养任务分页列表，包含结果集、总数和计数
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function getMaintenanceTaskPage(
  params: MaintenanceTaskPageParams,
) {
  return requestClient.get<{
    code: number;
    data: {
      count: number;
      results: MaintenanceTaskRecord[];
      total: number;
    };
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance/task-list-page?${qs.stringify(
      params,
    )}`,
  );
}

/**
 * 查询模具保养任务详情
 * @param id - 保养任务记录ID，用于获取任务的完整信息
 * @returns 保养任务详情数据，包含保养项目明细、执行信息、验收信息等
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function getMaintenanceTaskDetail(id: number) {
  return requestClient.get<{
    code: number;
    data: MaintenanceTaskDetail;
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance/task-detail?${qs.stringify(
      { id },
    )}`,
  );
}

/**
 * 执行保养并提交结果
 * @param params - 执行参数，包含保养项目执行明细、保养时间、保养结果等
 * @returns 执行结果数据，包含执行人、执行时间、保养单号等信息
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function executeMaintenance(params: MaintenanceExecuteParams) {
  return requestClient.post<{
    code: number;
    data: {
      executedBy: string;
      executeEndTime: string;
      executeStartTime: string;
      id: number;
      maintenanceNo: string;
      maintenanceResult: MaintenanceResult;
      moldCode: string;
      recoveredCount: number;
      recoveryMode: RecoveryMode;
      status: string;
      updatedTime: string;
    };
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance/execute`,
    params,
  );
}

/**
 * 分页查询模具保养记录
 * @param params - 查询参数，包含模具编码、保养结果、保养类型等筛选条件及分页信息
 * @returns 保养记录分页列表，包含结果集、总数和计数
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function getMaintenanceRecordPage(
  params: MaintenanceRecordPageParams,
) {
  return requestClient.get<{
    code: number;
    data: {
      count: number;
      results: MaintenanceRecord[];
      total: number;
    };
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/record/list-page?${qs.stringify(
      params,
    )}`,
  );
}

/**
 * 查询保养记录详情
 * @param id - 保养记录ID，用于获取记录的完整信息
 * @returns 保养记录详情数据，包含保养项目明细、使用次数、验收信息等
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function getMaintenanceRecordDetail(id: number) {
  return requestClient.get<{
    code: number;
    data: MaintenanceRecordDetail;
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance/detail?${qs.stringify(
      { id },
    )}`,
  );
}

/**
 * 保养验收
 * @param params - 验收参数，包含验收结果、验收意见、验收人等
 * @returns 验收后的保养记录详情
 * @throws 请求失败时由 requestClient 抛出错误
 * @since 2026-05-21 10:15:00
 */
export async function verifyMaintenance(params: MaintenanceVerifyParams) {
  return requestClient.post<{
    code: number;
    data: MaintenanceRecordDetail;
    msg: string;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/maintenance/verify`,
    params,
  );
}
