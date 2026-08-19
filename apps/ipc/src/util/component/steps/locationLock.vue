/**
 * 库位锁定组件
 * @description
 * 用于 AGV 加料场景的库位锁定演示，以表格形式展示库位锁定清单，
 * 字段包括：序号、库位号、吨桶ID、目标位置、匹配任务号、库位状态、任务状态。
 * 通过表格行颜色区分任务状态（未执行-白色、执行中-黄色、已完成-绿色）。
 * 纯前端演示，无接口调用。
 * @since 2026-08-19 09:30:00
 */
<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
defineProps({
  // 工步id，用于标识具体的工步，默认为 0
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID，用于标识具体的工序，默认为 0
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识具体的设备，默认为空字符串
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心，用于标识具体的工作中心，默认为空字符串
  workstationCode: {
    type: String,
    default: '',
  },
  // 展示类型，用于控制页面展示的内容，默认为 0
  showTypeNumber: {
    type: Number,
    default: 0,
  },
});

// region 库位锁定表格

/**
 * 库位锁定演示数据
 * 功能：模拟库位锁定清单，用于演示库位锁定流程
 * 字段说明：
 * - locationNo    库位号
 * - tonBucketId   吨桶ID
 * - targetPoint   目标位置
 * - matchTaskNo   匹配任务号
 * - locationStatus 库位状态 0-空闲 1-占用
 * - taskStatus    任务状态 0-待下发 1-已下发 2-执行中 3-已完成
 */
const locationList = ref<any[]>([
  {
    locationNo: 'LOC-A01',
    tonBucketId: 'TB-1001',
    targetPoint: 'B-03',
    matchTaskNo: 'RW-20260819-001',
    locationStatus: 1,
    taskStatus: 0,
  },
  {
    locationNo: 'LOC-A02',
    tonBucketId: 'TB-1002',
    targetPoint: 'B-05',
    matchTaskNo: 'RW-20260819-002',
    locationStatus: 1,
    taskStatus: 2,
  },
  {
    locationNo: 'LOC-A03',
    tonBucketId: 'TB-1003',
    targetPoint: 'C-01',
    matchTaskNo: 'RW-20260819-003',
    locationStatus: 1,
    taskStatus: 1,
  },
  {
    locationNo: 'LOC-B01',
    tonBucketId: 'TB-1004',
    targetPoint: 'B-07',
    matchTaskNo: 'RW-20260819-004',
    locationStatus: 0,
    taskStatus: 0,
  },
  {
    locationNo: 'LOC-B02',
    tonBucketId: 'TB-1005',
    targetPoint: 'B-09',
    matchTaskNo: 'RW-20260819-005',
    locationStatus: 1,
    taskStatus: 3,
  },
]);

/**
 * 库位状态文本
 * 功能：根据状态码返回对应的库位状态描述
 *
 * @param {number} status - 库位状态码（0-空闲 1-占用）
 * @returns {string} 对应的库位状态文本
 *
 * 注意事项：
 * - 状态码与文本映射需与后端保持一致
 * - 未匹配的状态码默认返回"未知"
 */
function getLocationStatusText(status: number) {
  const statusMap: Record<number, string> = {
    0: '空闲',
    1: '占用',
  };
  return statusMap[status] || '未知';
}

/**
 * 库位状态颜色
 * 功能：根据状态码返回对应的 Tag 颜色
 *
 * @param {number} status - 库位状态码（0-空闲 1-占用）
 * @returns {string} 对应的颜色标识（success-空闲 warning-占用）
 */
function getLocationStatusColor(status: number) {
  const colorMap: Record<number, string> = {
    0: 'success',
    1: 'warning',
  };
  return colorMap[status] || 'default';
}

/**
 * 任务状态文本
 * 功能：根据状态码返回对应的任务状态描述
 *
 * @param {number} status - 任务状态码（0-待下发 1-已下发 2-执行中 3-已完成）
 * @returns {string} 对应的任务状态文本
 *
 * 注意事项：
 * - 状态码与文本映射需与后端保持一致
 * - 未匹配的状态码默认返回"未知"
 */
function getTaskStatusText(status: number) {
  const statusMap: Record<number, string> = {
    0: '待下发',
    1: '已下发',
    2: '执行中',
    3: '已完成',
  };
  return statusMap[status] || '未知';
}

/**
 * 任务状态颜色
 * 功能：根据状态码返回对应的 Tag 颜色
 *
 * @param {number} status - 任务状态码
 * @returns {string} 对应的颜色标识（orange-待下发 blue-已下发 cyan-执行中 green-已完成）
 */
function getTaskStatusColor(status: number) {
  const colorMap: Record<number, string> = {
    0: 'orange',
    1: 'blue',
    2: 'cyan',
    3: 'green',
  };
  return colorMap[status] || 'default';
}

/**
 * 任务状态行颜色
 * 功能：根据任务状态码返回表格行对应的背景色类名
 *
 * @param {number} status - 任务状态码（0-待下发 1-已下发 2-执行中 3-已完成）
 * @returns {string} 行背景色类名（task-row-pending-白色 task-row-running-黄色 task-row-completed-绿色）
 */
function getTaskRowClass(status: number) {
  const classMap: Record<number, string> = {
    0: 'task-row-pending',
    1: 'task-row-pending',
    2: 'task-row-running',
    3: 'task-row-completed',
  };
  return classMap[status] || 'task-row-pending';
}

const gridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      width: 60,
    },
    {
      field: 'locationNo',
      title: '库位号',
      minWidth: 120,
    },
    {
      field: 'tonBucketId',
      title: '吨桶ID',
      minWidth: 110,
    },
    {
      field: 'targetPoint',
      title: '目标位置',
      minWidth: 110,
    },
    {
      field: 'matchTaskNo',
      title: '匹配任务号',
      minWidth: 180,
    },
    {
      field: 'locationStatus',
      title: '库位状态',
      minWidth: 100,
      slots: { default: 'locationStatus' },
    },
    {
      field: 'taskStatus',
      title: '任务状态',
      minWidth: 110,
      slots: { default: 'taskStatus' },
    },
  ],
  rowClassName: ({ row }: any) => getTaskRowClass(row.taskStatus),
  data: locationList.value,
  height: 400,
  stripe: true,
  pagerConfig: {
    enabled: false,
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid] = useVbenVxeGrid({ gridOptions });

// endregion
</script>

<template>
  <div>
    <!-- 库位锁定清单列表 -->
    <Grid>
      <template #locationStatus="{ row }">
        <Tag :color="getLocationStatusColor(row.locationStatus)">
          {{ getLocationStatusText(row.locationStatus) }}
        </Tag>
      </template>
      <template #taskStatus="{ row }">
        <Tag :color="getTaskStatusColor(row.taskStatus)">
          {{ getTaskStatusText(row.taskStatus) }}
        </Tag>
      </template>
    </Grid>
  </div>
</template>

<style scoped>
/* 未执行（待下发/已下发）：白色背景 */
:deep(.task-row-pending) {
  background-color: #ffffff;
}

/* 执行中：黄色背景 */
:deep(.task-row-running) {
  background-color: #fde047;
}

/* 已完成：绿色背景 */
:deep(.task-row-completed) {
  background-color: #bbf7d0;
}
</style>
