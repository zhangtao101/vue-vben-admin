/**
 * 领料进度类型
 */
export const TYPE_OF_MATERIAL_REQUISITION_PROGRESS = [
  {
    label: '进行中',
    value: '0',
  },
  {
    label: '已完成',
    value: '1',
  },
  {
    label: '未开始',
    value: '-1',
  },
];

/**
 * 领料状态
 */
export const MATERIAL_REQUISITION_STATUS_TYPE = [
  {
    label: '全部',
    value: '2',
  },
  {
    label: '已领',
    value: '1',
  },
  {
    label: '未领',
    value: '0',
  },
];
/**
 * 工单完成状态
 */
export const WORK_ORDER_COMPLETION_STATUS = [
  {
    label: '已完成',
    value: '0',
  },
  {
    label: '足额完成',
    value: '3',
  },
  {
    label: '欠额完成',
    value: '4',
  },
  {
    label: '超额完成',
    value: '6',
  },
];
/**
 * 部件/产品
 */
export const COMPONENTS_PRODUCTS = [
  {
    label: '全部',
    value: '0',
  },
  {
    label: '部件',
    value: '1',
  },
  {
    label: '产品',
    value: '2',
  },
];
/**
 * 延时状态
 */
export const DELAY_STATE = [
  {
    label: '延时欠额',
    value: '1',
  },
  {
    label: '延时超额',
    value: '2',
  },
  {
    label: '延时足额',
    value: '3',
  },
];
