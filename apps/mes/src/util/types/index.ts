import { $t } from '@vben/locales';

/**
 * 领料进度类型
 */
export const TYPE_OF_MATERIAL_REQUISITION_PROGRESS = [
  {
    label: $t('status.inProgress'),
    value: '0',
  },
  {
    label: $t('status.finished'),
    value: '1',
  },
  {
    label: $t('status.notStarted'),
    value: '-1',
  },
];

/**
 * 领料状态
 */
export const MATERIAL_REQUISITION_STATUS_TYPE = [
  {
    label: $t('basic.all'),
    value: '2',
  },
  {
    label: $t('status.received'),
    value: '1',
  },
  {
    label: $t('status.unreceived'),
    value: '0',
  },
];
/**
 * 工单完成状态
 */
export const WORK_ORDER_COMPLETION_STATUS = [
  {
    label: $t('status.finished'),
    value: '0',
  },
  {
    label: $t('status.fullCompletion'),
    value: '3',
  },
  {
    label: $t('status.shortCompletion'),
    value: '4',
  },
  {
    label: $t('status.overCompletion'),
    value: '6',
  },
];
/**
 * 部件/产品
 */
export const COMPONENTS_PRODUCTS = [
  {
    label: $t('basic.all'),
    value: '0',
  },
  {
    label: $t('status.part'),
    value: '1',
  },
  {
    label: $t('status.product'),
    value: '2',
  },
];
/**
 * 延时状态
 */
export const DELAY_STATE = [
  {
    label: $t('status.delayShort'),
    value: '1',
  },
  {
    label: $t('status.delayOver'),
    value: '2',
  },
  {
    label: $t('status.delayFull'),
    value: '3',
  },
];
/**
 * 评价状态
 */
export const EVALUATION_STATUS = [
  {
    label: $t('status.verySatisfied'),
    value: '1',
  },
  {
    label: $t('status.satisfied'),
    value: '2',
  },
  {
    label: $t('status.dissatisfied'),
    value: '3',
  },
];
