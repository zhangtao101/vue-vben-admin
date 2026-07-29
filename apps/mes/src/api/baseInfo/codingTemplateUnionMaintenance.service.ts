// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 类型定义 ==========

/** 喷码模板列表查询参数 */
export interface PrintCodeTemplateListParams {
  /** 产品组编码 */
  productGroupCode?: string;
  /** 喷码号码，支持模糊查询 */
  printCode?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/** 喷码模板列表项 */
export interface PrintCodeTemplateItem {
  /** 模板主键 */
  id: number;
  /** 喷码号码 */
  printCode: string;
  /** 产品组编码 */
  productGroupCode: string;
  /** 产品组名称 */
  productGroupName: string;
  /** 喷码名称或说明 */
  printName: string;
  /** 1=内销，2=出口 */
  salesType: number;
}

/** 分页查询结果 */
export interface PrintCodeTemplateListResult {
  /** 当前页数据 */
  results: PrintCodeTemplateItem[];
  /** 总条数 */
  total: number;
  /** 当前页条数 */
  count: number;
}

/** 喷码参数项 */
export interface PrintCodeParameter {
  /** 参数ID，只读 */
  parameterId: string;
  /** 参数中文名称，只读 */
  parameterName: string;
  /** 参数预览值 */
  value?: string;
  /** 显示顺序，只读 */
  sortOrder: number;
}

/** 查询喷码参数参数 */
export interface PrintCodeParametersParams {
  /** 喷码模板主键；为空表示新建状态 */
  templateId?: number;
}

/** 生成预览参数 */
export interface PrintCodePreviewParams {
  /** 可选；未传parameters时使用此模板已保存的参数 */
  templateId?: number;
  /** 日期格式 */
  dateFormat: string;
  /** 当前模板1 */
  templateOne: string;
  /** 当前模板2 */
  templateTwo: string;
  /** 当前模板3 */
  templateThree: string;
  /** 可选；优先使用前端当前填写且可能尚未保存的7条参数 */
  parameters?: PrintCodeParameter[];
}

/** 喷码模板信息（含三个模板与7条参数） */
export interface PrintCodeTemplateInfo {
  /** 模板主键 */
  id?: number;
  /** 产品组编码 */
  productGroupCode: string;
  /** 产品组名称 */
  productGroupName: string;
  /** 喷码号码 */
  printCode: string;
  /** 喷码名称或说明 */
  printName?: string;
  /** 日期格式 */
  dateFormat: string;
  /** 内销/出口：1=内销，2=出口 */
  salesType: number;
  /** 固定喷码模板1 */
  templateOne?: string;
  /** 固定喷码模板2 */
  templateTwo?: string;
  /** 固定喷码模板3 */
  templateThree?: string;
  /** 该喷码模板独立保存的7条参数 */
  parameters: PrintCodeParameter[];
}

/** 查询模板详情参数 */
export interface PrintCodeTemplateDetailParams {
  /** 喷码模板主键 */
  id: number;
}

/** 删除喷码模板参数 */
export interface PrintCodeTemplateDeleteParams {
  /** 模板主键 */
  id: number;
}

/** 产品组下拉选项查询参数 */
export interface ProductGroupOptionsParams {
  /** 产品组编码或名称关键字 */
  keyword?: string;
}

/** 产品组下拉选项 */
export interface ProductGroupOption {
  /** 产品组编码 */
  productGroupCode: string;
  /** 产品组名称 */
  productGroupName: string;
}

// ========== 接口函数 ==========

/**
 * 分页查询左侧喷码列表
 * @param params 查询参数
 * @returns 分页结果
 */
export async function listPrintCodeTemplates(
  params: PrintCodeTemplateListParams,
) {
  return requestClient.get<PrintCodeTemplateListResult>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询喷码参数
 * @param params templateId为空时返回7条初始化参数；有值时返回已保存参数
 * @returns 该模板独立保存的7条参数
 */
export async function getPrintCodeParameters(params: PrintCodeParametersParams) {
  return requestClient.get<PrintCodeParameter[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/parameters?${qs.stringify(params)}`,
  );
}

/**
 * 生成三个喷码预览
 * @param params 预览参数（含三个模板与7条参数）
 * @returns 固定3项预览文本
 */
export async function previewPrintCodeTemplates(params: PrintCodePreviewParams) {
  return requestClient.post<string[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/preview`,
    params,
  );
}

/**
 * 新建喷码模板
 * @param params 喷码信息、三个固定模板和该模板自己的7条参数
 * @returns 新建后的喷码模板详情
 */
export async function createPrintCodeTemplate(params: PrintCodeTemplateInfo) {
  return requestClient.post<PrintCodeTemplateInfo>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/create`,
    params,
  );
}

/**
 * 修改喷码模板
 * @param params 喷码信息、三个固定模板和该模板自己的7条参数
 * @returns 修改后的喷码模板详情
 */
export async function updatePrintCodeTemplate(params: PrintCodeTemplateInfo) {
  return requestClient.post<PrintCodeTemplateInfo>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/update`,
    params,
  );
}

/**
 * 查询喷码模板详情
 * @param params 喷码模板主键
 * @returns 喷码信息、三个固定模板和该模板自己的7条参数
 */
export async function getPrintCodeTemplateDetail(
  params: PrintCodeTemplateDetailParams,
) {
  return requestClient.get<PrintCodeTemplateInfo>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/detail?${qs.stringify(params)}`,
  );
}

/**
 * 导出喷码列表
 * @param params 查询条件
 * @returns xlsx二进制文件
 */
export async function exportPrintCodeTemplates(params: { printCode?: string; productGroupCode?: string }) {
  return requestClient.get<Blob>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/export?${qs.stringify(params)}`,
    { responseType: 'blob' },
  );
}

/**
 * 逻辑删除喷码模板
 * @param params 模板主键
 * @returns 已删除模板ID
 */
export async function deletePrintCodeTemplate(
  params: PrintCodeTemplateDeleteParams,
) {
  return requestClient.delete<number>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/print-code-template/${params.id}`,
  );
}

/**
 * 查询启用产品组下拉选项
 * @param params 关键字
 * @returns 启用产品组下拉选项
 */
export async function listProductGroupOptions(params: ProductGroupOptionsParams) {
  return requestClient.get<ProductGroupOption[]>(
    `${import.meta.env.VITE_GLOB_MES_EQUIP_OTHER}/product-group/options?${qs.stringify(params)}`,
  );
}
