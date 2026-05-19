/**
 * [INPUT]: 依赖 requestClient、qs、import.meta.env
 * [OUTPUT]: 对外提供模具档案相关 API 函数
 * [POS]: 设备管理模块 的模具档案 API 服务
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-18 10:26:00
 */
// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/**
 * 模具档案-产品绑定关系
 */
export interface MoldProductRelation {
  /** 关联ID，编辑时需传入 */
  id?: number;
  /** 模具ID */
  moldId?: number;
  /** 产品ID */
  productId?: number;
  /** 产品型号，必填 */
  productCode: string;
  /** 产品名称/型号 */
  productModel?: string;
  /** 穴数 */
  cavityCount?: number;
  /** 是否主模，1-是，0-否 */
  isPrimary: number;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createdTime?: string;
}

/**
 * 模具档案-产品绑定查询结果
 */
export interface MoldProductRelationItem {
  /** 关联ID */
  id: number;
  /** 模具ID */
  moldId: number;
  /** 产品ID */
  productId: number;
  /** 产品型号 */
  productCode: string;
  /** 产品名称/型号 */
  productModel: string;
  /** 穴数 */
  cavityCount: number;
  /** 是否主模，1-是，0-否 */
  isPrimary: number;
  /** 备注 */
  remark: string;
  /** 创建时间 */
  createdTime: string;
}

/**
 * 模具档案保存参数（新增/编辑）
 */
export interface MoldArchiveSaveParams {
  /** 模具ID，编辑时传入 */
  id?: number;
  /** 模具编码，必填 */
  moldCode: string;
  /** 模具名称，必填 */
  moldName: string;
  /** 类别ID */
  categoryId?: number;
  /** 工序ID */
  processId?: number;
  /** 工步ID，可选 */
  stepId?: number;
  /** 存放位置 */
  location?: string;
  /** 供应商编号 */
  supplierCode?: string;
  /** 供应商名称 */
  supplierName?: string;
  /** 寿命类型，COUNT-次数，TIME-时间 */
  lifespanType?: string;
  /** 总寿命(次数) */
  totalLifespan?: number;
  /** 总寿命(时间) */
  totalLifespanTime?: number;
  /** 寿命维度 */
  lifespanDimension?: string;
  /** 标准产能 */
  standardCapacity?: number;
  /** 预警阈值，不传时按类别自动带出 */
  warningThreshold?: number;
  /** 拦截阈值，不传时按类别自动带出 */
  blockThreshold?: number;
  /** 恢复模式，不传时按类别自动带出。PERCENT-百分比，FIXED-固定值，MANUAL-手工，NONE-不恢复 */
  recoveryMode?: string;
  /** 恢复百分比，不传时按类别自动带出 */
  recoveryPercent?: number;
  /** 固定恢复值，不传时按类别自动带出 */
  recoveryFixed?: number;
  /** 提前预警天数，不传时按类别自动带出 */
  advanceDays?: number;
  /** 拦截模式，后端保留字段 */
  blockMode?: string;
  /** 产品绑定关系 */
  productRelations?: MoldProductRelation[];
}

/**
 * 模具档案实体
 */
export interface MoldArchive {
  /** 模具ID */
  id: number;
  /** 模具编码 */
  moldCode: string;
  /** 模具名称 */
  moldName: string;
  /** 类别ID */
  categoryId: number;
  /** 类别编码 */
  moldGroupCode: string;
  /** 类别名称 */
  moldGroupName: string;
  /** 类别来源，KG-客供，ZZ-自制 */
  categorySource: string;
  /** 适用设备组名称 */
  equipmentGroupName: string;
  /** 工序ID */
  processId: number;
  /** 工步ID */
  stepId: number;
  /** 存放位置 */
  location: string;
  /** 总寿命 */
  totalLifespan: number;
  /** 已使用次数 */
  usedCount: number;
  /** 剩余寿命 */
  remainingLifespan: number;
  /** 使用占比(%) */
  usagePercent: number;
  /** 寿命类型 */
  lifespanType: string;
  /** 寿命维度 */
  lifespanDimension: string;
  /** 总寿命(时间) */
  totalLifespanTime: number;
  /** 已使用时间 */
  usedTime: number;
  /** 标准产能 */
  standardCapacity: number;
  /** 恢复模式 */
  recoveryMode: string;
  /** 恢复百分比 */
  recoveryPercent: number;
  /** 固定恢复值 */
  recoveryFixed: number;
  /** 预警阈值(%) */
  warningThreshold: number;
  /** 拦截阈值(%) */
  blockThreshold: number;
  /** 拦截模式 */
  blockMode: string;
  /** 提前预警天数 */
  advanceDays: number;
  /** 当前业务状态，IN_STORAGE-在库，IN_USE-使用中，MAINTENANCE-维修中 */
  currentStatus: string;
  /** 当前业务状态名称 */
  currentStatusName: string;
  /** 启停用状态，ACTIVE-启用，DISABLED-停用 */
  status: string;
  /** 启停用状态名称 */
  statusName: string;
  /** 供应商编号 */
  supplierCode: string;
  /** 供应商名称 */
  supplierName: string;
  /** 当前工单号 */
  currentWorkOrderNo: string;
  /** 当前设备编码 */
  currentEquipmentCode: string;
  /** 上机时间 */
  installTime: string;
  /** 创建时间 */
  createdTime: string;
  /** 更新时间 */
  updatedTime: string;
  /** 版本号 */
  version: number;
  /** 产品绑定关系 */
  productRelations: MoldProductRelationItem[];
}

/**
 * 模具档案分页查询参数
 */
export interface MoldArchivePageParams {
  /** 类别ID */
  categoryId?: number;
  /** 工序ID */
  processId?: number;
  /** 启停用状态，ACTIVE-启用，DISABLED-停用；不传表示全部 */
  status?: string;
  /** 关键字，支持模具编码/模具名称 */
  keyword?: string;
  /** 页码，默认1 */
  pageNum?: number;
  /** 每页条数，默认10 */
  pageSize?: number;
}

/**
 * 单模具寿命统计结果
 */
export interface SingleMoldStatistics {
  /** 模具ID */
  moldId: number;
  /** 模具编码 */
  moldCode: string;
  /** 模具名称 */
  moldName: string;
  /** 启停用状态 */
  status: string;
  /** 启停用状态名称 */
  statusName: string;
  /** 当前业务状态 */
  currentStatus: string;
  /** 当前业务状态名称 */
  currentStatusName: string;
  /** 总寿命 */
  totalLifespan: number;
  /** 已使用次数 */
  usedCount: number;
  /** 剩余寿命 */
  remainingLifespan: number;
  /** 使用占比(%) */
  usagePercent: number;
  /** 预警阈值(%) */
  warningThreshold: number;
  /** 拦截阈值(%) */
  blockThreshold: number;
  /** 恢复模式 */
  recoveryMode: string;
}

/**
 * 全局模具寿命统计结果
 */
export interface GlobalMoldStatistics {
  /** 模具总数 */
  totalMolds: number;
  /** 达到预警的模具数 */
  warningMolds: number;
  /** 达到拦截的模具数 */
  blockMolds: number;
}

/**
 * 产品型号查询参数
 */
export interface ErpProductParams {
  /** 产品型号 */
  productCode?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 产品型号项
 */
export interface ErpProductItem {
  /** 产品型号 */
  productCode: string;
  /** 产品名称 */
  productName: string;
}

/**
 * 产品型号分页结果
 */
export interface ErpProductResult {
  /** 总条数 */
  total: number;
  /** 产品列表 */
  list: ErpProductItem[];
}

/**
 * 供应商项
 */
export interface SupplierItem {
  /** 客户编号 */
  customerCode: string;
  /** 客户名称 */
  customerName: string;
}

// ========== 接口定义 ==========

/**
 * 分页查询模具档案列表
 * @description 返回模具档案分页列表，包含基本信息和产品绑定关系
 * @param params - 查询参数：categoryId、processId、status、keyword、pageNum、pageSize
 */
export async function getMoldArchivePageList(params: MoldArchivePageParams) {
  return requestClient.get<{
    count: number;
    results: MoldArchive[];
    total: number;
  }>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/base/list-page?${qs.stringify(params)}`,
  );
}

/**
 * 查询模具档案列表（不分页）
 * @description 用于下拉选择等场景
 * @param params - 查询参数：categoryId、processId、status、keyword
 */
export async function getMoldArchiveList(
  params?: Partial<MoldArchivePageParams>,
) {
  return requestClient.get<MoldArchive[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/base/list?${qs.stringify(params || {})}`,
  );
}

/**
 * 查询模具详情
 * @description 获取模具档案的详细信息，包括基本信息和寿命信息
 * @param id - 模具ID
 */
export async function getMoldArchiveDetail(id: number) {
  return requestClient.get<MoldArchive>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/base/detail?id=${id}`,
  );
}

/**
 * 保存模具档案（新增/编辑）
 * @description 新增或编辑模具档案。有 id 为编辑，无 id 为新增。warningThreshold、blockThreshold、recoveryMode 等参数不传时按类别自动带出
 * @param params - 模具档案信息，包含 productRelations 产品绑定关系
 */
export async function saveMoldArchive(params: MoldArchiveSaveParams) {
  return requestClient.post<MoldArchive>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/base`,
    params,
  );
}

/**
 * 查询产品绑定列表
 * @description 查询模具档案关联的产品绑定明细
 * @param moldId - 模具ID
 */
export async function getProductRelations(moldId: number) {
  return requestClient.get<MoldProductRelationItem[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/base/product-relations?moldId=${moldId}`,
  );
}

/**
 * 模具寿命统计
 * @description 传 moldId 或 moldCode 时返回单模具统计；都不传时返回全局统计
 * @param params - 查询参数，moldId 或 moldCode 二选一传
 */
export async function getMoldLifespanStatistics(params?: {
  moldCode?: string;
  moldId?: number;
}) {
  return requestClient.get<GlobalMoldStatistics | SingleMoldStatistics>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/lifespan/statistics?${qs.stringify(params || {})}`,
  );
}

/**
 * 获取产品型号列表（远程接口）
 * @description 远程调用 ERP 产品档案接口，用于模具档案新增/编辑页产品绑定表格的「产品型号」选择
 * @param params - 查询参数：productCode、pageNum、pageSize
 */
export async function getErpProductList(params?: ErpProductParams) {
  return requestClient.post<ErpProductResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/erpProductArchives/getList?${qs.stringify(params)}`,
    {},
  );
}

/**
 * 获取供应商下拉列表（远程接口）
 * @description 远程调用客户接口，用于模具档案新增/编辑页供应商下拉
 * @param customerName - 客户名称关键字，可选
 */
export async function getSupplierList(customerName?: string) {
  return requestClient.get<SupplierItem[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/customer/getCustomerList?${qs.stringify({ customerName })}`,
  );
}

/**
 * 删除模具档案
 * @description 按ID删除模具档案
 * @param id - 模具档案ID
 */
export async function deleteMoldArchiveById(id: number) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/base/${id}`,
  );
}

/**
 * 模具档案下拉选择列表
 * @description 用于下拉选择场景，返回 moldCode、moldName 字段
 * @param params - 查询参数：keyword（模具编码/模具名称关键字）、status（状态，默认启用）
 */
export async function getMoldArchiveSelectList(params?: {
  keyword?: string;
  status?: string;
}) {
  return requestClient.get<
    Array<{ id: number; moldCode: string; moldName: string }>
  >(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/mold/base/list?${qs.stringify(
      { ...params, status: params?.status || 'ACTIVE' },
    )}`,
  );
}
