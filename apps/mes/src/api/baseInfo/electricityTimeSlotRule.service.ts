// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 新增电量规则
 */
export function addedBatteryRules(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/rule/insert`,
    params,
  );
}

/**
 * 获取电量规则
 */
export function getThePowerRule(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/rule/getParamList?${qs.stringify(params)}`,
  );
}

/**
 * 电量规则启停用
 */
export function thePowerRuleIsTurnedOnAndOff(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/rule/useDLParam`,
    params,
  );
}
