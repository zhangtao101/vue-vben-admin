import { requestClient } from '#/api/request';
/**
 * 测试
 */
export function luckySheetDateil() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_KANBAN_KETTLESTEST}/LuckySheetDateil`,
  );
}
