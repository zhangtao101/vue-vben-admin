// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询查询字典树
 */
export async function queryDictionaryTree() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/listWordTree`,
  );
}
/**
 * 通过父类编号查询子类字典
 */
export async function listWordListByParentCode(code: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/listWordListByParentCode/${code}`,
  );
}
/**
 * 根据编号查询字典数据
 */
export async function queryDictionaryByCode(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/listWordListByParCode?${qs.stringify(params)}`,
  );
}

/**
 * 查询字典数据
 */
export async function queryDictionary(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/listWord?${qs.stringify(params)}`,
  );
}
/**
 * 查询字典详情
 */
export async function queryDictionaryDetail(code: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/getWord/${code}`,
  );
}
/**
 * 新增字典
 */
export async function addDictionary(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/insertWord`,
    params,
  );
}
/**
 * 修改字典
 */
export async function updateDictionary(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/updateWord`,
    params,
  );
}
/**
 * 修改字典排序
 */
export async function modifyLexicographicSorting(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/UpdateOrderWord`,
    params,
  );
}
/**
 * 删除字典数据
 */
export async function deleteDictionary(code: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/word/deleteWord/${code}`,
  );
}
