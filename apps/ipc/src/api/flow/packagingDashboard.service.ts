import { requestClient } from '#/api/request';

/**
 * 包装看板单条数据（一块看板卡片包含上下两条包装产线）
 * @since 2026-10-08
 */
export interface PackagingDashboardItem {
  /** 上面的进料 */
  feedInQtyA: null | number;
  /** 下面的进料 */
  feedInQtyB: null | number;
  /** 上面的排除手动 */
  manualRejectQtyA: null | number;
  /** 下面的排除手动 */
  manualRejectQtyB: null | number;
  /** 上面的包装产线名字 */
  subLineNameA: string;
  /** 下面的包装产线名称 */
  subLineNameB: null | string;
  /** 上面的子产线 */
  sublineQtyA: null | number;
  /** 下面的子产线 */
  sublineQtyB: null | number;
}

/**
 * 包装看板
 * @returns 看板数据列表，每条包含上下两条产线的名称与三个指标数
 * @since 2026-10-08
 */
export function getPackagingDashboard() {
  return requestClient.get<PackagingDashboardItem[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/palletiz/dashboard`,
  );
}
