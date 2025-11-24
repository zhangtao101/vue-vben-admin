// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询图库管理列表
 * @param query 查询参数
 */
export function queryGallery(query: any) {
  return requestClient.get(`/scada/gallery/list?${qs.stringify(query)}`);
}

/**
 * 查询图库管理详情
 * @param id 记录ID
 */
export function queryGalleryById(id: any) {
  return requestClient.get(`/scada/gallery/${id}`);
}

/**
 * 新增图库管理
 * @param data 表单数据
 */
export function insertGallery(data: any) {
  return requestClient.post('/scada/gallery', data);
}

/**
 * 上传文件
 * @param data FormData 文件数据
 */
export function uploadGalleryFile(data: any) {
  return requestClient.post('/scada/gallery/uploadFile', data);
}

/**
 * 更新图库管理
 * @param data 表单数据
 */
export function updateGallery(data: any) {
  return requestClient.put('/scada/gallery', data);
}

/**
 * 删除图库管理
 * @param id 记录ID
 */
export function deleteGallery(id: any) {
  return requestClient.delete(`/scada/gallery/${id}`);
}
