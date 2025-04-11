// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询生产日报
 */
export async function queryProductionDaily(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getReportDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 查询釉线日报
 */
export async function queryEnamelDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getEnamelDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 抛光停机汇总
 */
export async function queryPGStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPGStopHZStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 查询窑炉日报
 */
export async function queryYLDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYLDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 前破碎汇总
 */
export async function queryPreCrushingSummaryStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPreCrushingSummaryStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 生产总量与批次统计
 */
export async function queryProductionAndBatchStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getProductionAndBatchStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 粉料分月明细表
 */
export async function queryPowderMonthlyDetailsStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPowderMonthlyDetailsStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 查询窑炉月报
 */
export async function queryYLMonthStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYLMonthStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  粉料车间统计日报查询
 */
export async function queryYLReportDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYLReportDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  粉料车间统计月报查询
 */
export async function queryYLReportMonthStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYLReportMonthStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  压机日报查询
 */
export async function queryPressDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPressDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  抛光产量日报查询
 */
export async function queryPolishingYieldDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPolishingYieldDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  粉料移交报表查询
 */
export async function queryFLTransferStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getFLTransferStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  能源报表查询
 */
export async function queryEnergyConsumptionStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getEnergyConsumptionStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  抛光入库报表查询
 */
export async function queryPolishedStorageDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPolishedStorageDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  抛光质量报表查询
 */
export async function queryPolishingZLDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPolishingZLDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  玻化砖产品投入产出报表查询
 */
export async function queryBHZInOutApproval(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getBHZInOutApproval?${qs.stringify(params)}`,
  );
}

/**
 * 查询窑线停机日报(明细)
 */
export async function queryYXStopDayMXStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYXStopDayMXStatistics?${qs.stringify(params)}`,
  );
}

/**
 * 玻化分厂压制量明细表
 */
export async function queryBHZPressureDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getBHZPressureDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 制釉间生产表
 */
export async function queryGlazingRoomDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getGlazingRoomDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 压机月报
 */
export async function queryPressMonthStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPressMonthStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 抛光厂投入产出月报
 */
export async function queryPolishPressMonthInOutPutStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPolishPressMonthInOutPutStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 抛光厂投入产出日报
 */
export async function queryPolishPressDayInOutPutStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPolishPressDayInOutPutStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 釉线月报
 */
export async function queryEnamelMonthStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getEnamelMonthStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 生产复选汇总表
 */
export async function queryProduceChecklistsStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getProduceChecklistsStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 抛光分厂电耗
 */
export async function queryPGDetailOfElectricityStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPGDetailOfElectricityStatistics?${qs.stringify(params)}`,
  );
}

/**
 * 粉料厂停机明细表
 */
export async function queryFLStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getFLStopDetailStatistics?${qs.stringify(params)}`,
  );
}

/**
 * 釉线停机明细表
 */
export async function queryYXStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYXStopDetailStatistics?${qs.stringify(params)}`,
  );
}

/**
 * 窑炉停机明细表
 */
export async function queryYLStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYLStopDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 压机停机明细表
 */
export async function queryYJStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYJStopDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 抛光停机明细表
 */
export async function queryPGStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPGStopDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 釉线停机汇总
 */
export async function queryYXStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYXStopHZStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 窑炉停机汇总
 */
export async function queryYLStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYLStopHZStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 各分厂停窑燃气
 */
export async function queryShutdownGasStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getShutdownGasStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 压机停机汇总
 */
export async function queryYJStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYJStopHZStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 粉料厂停机汇总
 */
export async function queryFLStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getFLStopHZStatistics?${qs.stringify(params)}`,
  );
}

// region 报表导出
/**
 * 压机日报导出
 */
export async function excelPathPressDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPressDay?${qs.stringify(params)}`,
  );
}
/**
 * 窑炉日报导出
 */
export async function excelPathYLDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYLDay?${qs.stringify(params)}`,
  );
}
/**
 * 前破碎汇总导出
 */
export async function excelPathPreCrushingSummary(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPreCrushingSummary?${qs.stringify(params)}`,
  );
}
/**
 * 粉料分月明细表导出
 */
export async function excelPathPowderMonthlyDetailsStatistics() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPowderMonthlyDetailsStatistics`,
  );
}
/**
 * 生产总量与批次统计导出
 */
export async function excelPathProductionAndBatchStatistics() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathProductionAndBatchStatistics`,
  );
}
/**
 * 窑炉月报导出
 */
export async function excelPathYLMonth(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYLMonth?${qs.stringify(params)}`,
  );
}
/**
 * 釉线日报导出
 */
export async function excelPathEnamelDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathEnamelDay?${qs.stringify(params)}`,
  );
}
/**
 * 抛光产量日报导出
 */
export async function excelPathPolishingYieldDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPolishingYieldDay?${qs.stringify(params)}`,
  );
}
/**
 * 釉线停机汇总导出
 */
export async function excelPathYXStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYXStopHZStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 窑炉停机汇总导出
 */
export async function excelPathYLStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYLStopHZStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 各分厂停窑燃气导出
 */
export async function excelPathShutdownGasStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathShutdownGasStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 粉料移交导出
 */
export async function excelPathFLTransfer(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathFLTransfer?${qs.stringify(params)}`,
  );
}
/**
 * 压机停机汇总导出
 */
export async function excelPathYJStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYJStopHZStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 压机停机汇总导出
 */
export async function excelPathFLStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathFLStopHZStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 料车间工单生产日报导出
 */
export async function excelPathYLReportDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYLReportDay?${qs.stringify(params)}`,
  );
}
/**
 * 料车间工单生产月报导出
 */
export async function excelPathYLReportMonth(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYLReportMonth?${qs.stringify(params)}`,
  );
}
/**
 * 窑线停机日报导出(明细)
 */
export async function excelPathYXStopDayMXStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYXStopDayMXStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 玻化砖产品投入产出批报导出
 */
export async function excelPathBHZInOutApproval(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathBHZInOutApproval?${qs.stringify(params)}`,
  );
}
/**
 * 能耗日报导出
 */
export async function excelPathEnergyConsumptionStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathEnergyConsumptionStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 抛光入库日报导出
 */
export async function excelPathPolishedStorageDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPolishedStorageDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 抛光质量日报导出
 */
export async function excelPathPolishingZLDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPolishingZLDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 玻化分厂压制量明细表导出
 */
export async function excelPathBHZPressureDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathBHZPressureDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 制釉间生产日报导出
 */
export async function excelGlazingRoomDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelGlazingRoomDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 压机月报导出
 */
export async function excelPathPressMonth(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPressMonth?${qs.stringify(params)}`,
  );
}
/**
 * 抛光厂投入产出月报导出
 */
export async function excelPathMonthPolishPressInOutPut(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathMonthPolishPressInOutPut?${qs.stringify(params)}`,
  );
}
/**
 * 抛光厂投入产出日报导出
 */
export async function excelPathDayPolishPressInOutPut(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathDayPolishPressInOutPut?${qs.stringify(params)}`,
  );
}
/**
 * 釉线月报导出
 */
export async function excelPathEnamelMonth(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathEnamelMonth?${qs.stringify(params)}`,
  );
}
/**
 * 生产复选汇总表导出
 */
export async function excelPathProduceChecklists(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathProduceChecklists?${qs.stringify(params)}`,
  );
}
/**
 * 生产复选汇总表导出
 */
export async function excelPathPGDetailOfElectricityStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPGDetailOfElectricityStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 粉料停机明细表导出
 */
export async function excelPathFLStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathFLStopDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 釉线停机明细表导出
 */
export async function excelPathYXStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYXStopDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 窑炉停机明细表导出
 */
export async function excelPathYLStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYLStopDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 压机停机明细表导出
 */
export async function excelPathYJStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYJStopDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 抛光停机明细表导出
 */
export async function excelPathPGStopDetailStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPGStopDetailStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 抛光停机汇总导出
 */
export async function excelPathPGStopHZStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPGStopHZStatistics?${qs.stringify(params)}`,
  );
}
// endregion
