import { requestClient } from '#/api/request';

/** 不可拆分料记录 */
export interface MaterialDescriptionItem {
  /** 记录主键，仅编辑和删除时使用 */
  id: number;
  /** 物料编号 */
  materialCode: string;
  /** 物料特征，可为空 */
  description: string;
}

/** 分页查询结果 */
export interface MaterialDescriptionPageResult {
  /** 当前页数据 */
  results: MaterialDescriptionItem[];
  /** 符合条件的总记录数 */
  total: number;
  /** 当前页记录数 */
  count: number;
}

/** 分页查询参数 */
export interface MaterialDescriptionQuery {
  /** 物料编号，模糊查询 */
  materialCode?: string;
  /** 物料特征，模糊查询 */
  description?: string;
  /** 页码，从 1 开始 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
}

/** 新增参数 */
export interface MaterialDescriptionSaveParams {
  /** 物料编号，必填，最多 255 个字符 */
  materialCode: string;
  /** 物料特征，选填，最多 255 个字符 */
  description?: string;
}

/** 修改参数 */
export interface MaterialDescriptionUpdateParams {
  /** 记录主键，必填 */
  id: number;
  /** 物料编号，必填，最多 255 个字符 */
  materialCode: string;
  /** 物料特征，选填，最多 255 个字符 */
  description?: string;
}

/**
 * 分页查询不可拆分料清单
 * 按物料编号、物料特征模糊查询，后端只返回 inseparable=1 的记录
 * @param params 查询条件与分页参数
 * @since 2026-10-19 10:00:00
 */
export function queryMaterialDescriptionList(
  params: MaterialDescriptionQuery,
) {
  return requestClient.get<MaterialDescriptionPageResult>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialDescription/search`,
    { params },
  );
}

/**
 * 新增不可拆分料
 * 后端固定保存 inseparable=1，成功后返回 null
 * @param data 新增内容
 * @since 2026-10-19 10:00:00
 */
export function createMaterialDescription(
  data: MaterialDescriptionSaveParams,
) {
  return requestClient.post<null>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialDescription/save`,
    data,
  );
}

/**
 * 修改不可拆分料
 * 后端固定保存 inseparable=1，成功后返回 null
 * @param data 修改内容，需带 id
 * @since 2026-10-19 10:00:00
 */
export function updateMaterialDescription(
  data: MaterialDescriptionUpdateParams,
) {
  return requestClient.put<null>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialDescription/update`,
    data,
  );
}

/**
 * 删除不可拆分料
 * 成功后返回 null
 * @param id 记录主键
 * @since 2026-10-19 10:00:00
 */
export function deleteMaterialDescription(id: number | string) {
  return requestClient.delete<null>(
    `${
      import.meta.env.VITE_GLOB_MES_MAIN
    }/base/materialDescription/delete/${id}`,
  );
}
