<script setup lang="ts">
/**
 * 卸货对接-任务清单组件
 * @description
 * 用于 AGV 卸货对接任务演示，展示卸货任务清单列表，
 * 支持对任务执行"任务完成"操作（纯前端演示，无接口调用）。
 * 页面为单表格布局：
 * 1. 卸货任务清单列表（序号、任务号、任务类型、AGV小车ID、吨桶ID、起始点位、目标点位/目标机台、小车运行状态、任务状态、操作）
 * 2. 操作列提供"任务完成"按钮
 * 3. 通过表格行颜色区分任务状态（未执行-白色、执行中-黄色、已完成-绿色）
 * @since 2026-08-19 10:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Button, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

defineOptions({ name: 'UnloadingDockingTask' });

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

// region 卸货任务清单表格

/**
 * 卸货任务演示数据
 * 功能：模拟 AGV 卸货任务列表，用于演示卸货对接完成流程
 * 字段说明：
 * - taskNo       任务号
 * - taskType     任务类型
 * - agvId        AGV小车ID
 * - tonBucketId  吨桶ID
 * - startPoint   起始点位
 * - targetPoint  目标点位/目标机台
 * - runStatus    小车运行状态 0-空闲 1-运行中 2-充电 3-故障
 * - taskStatus   任务状态 0-待下发 1-已下发 2-执行中 3-已完成
 */
const taskList = ref<any[]>([
  {
    taskNo: 'UL-20260819-001',
    taskType: '卸货',
    agvId: 'AGV-01',
    tonBucketId: 'TB-1001',
    startPoint: 'B-03',
    targetPoint: 'A-01',
    runStatus: 1,
    taskStatus: 2,
  },
  {
    taskNo: 'UL-20260819-002',
    taskType: '卸货',
    agvId: 'AGV-02',
    tonBucketId: 'TB-1002',
    startPoint: 'B-05',
    targetPoint: 'A-02',
    runStatus: 0,
    taskStatus: 0,
  },
  {
    taskNo: 'UL-20260819-003',
    taskType: '卸货',
    agvId: 'AGV-03',
    tonBucketId: 'TB-1003',
    startPoint: 'B-07',
    targetPoint: 'A-03',
    runStatus: 2,
    taskStatus: 1,
  },
  {
    taskNo: 'UL-20260819-004',
    taskType: '卸货',
    agvId: 'AGV-04',
    tonBucketId: 'TB-1004',
    startPoint: 'B-09',
    targetPoint: 'A-04',
    runStatus: 0,
    taskStatus: 0,
  },
  {
    taskNo: 'UL-20260819-005',
    taskType: '卸货',
    agvId: 'AGV-05',
    tonBucketId: 'TB-1005',
    startPoint: 'B-11',
    targetPoint: 'A-05',
    runStatus: 3,
    taskStatus: 3,
  },
]);

/**
 * 小车运行状态文本
 * 功能：根据状态码返回对应的小车运行状态描述
 *
 * @param {number} status - 小车运行状态码（0-空闲 1-运行中 2-充电 3-故障）
 * @returns {string} 对应的小车运行状态文本
 *
 * 注意事项：
 * - 状态码与文本映射需与后端保持一致
 * - 未匹配的状态码默认返回"未知"
 */
function getRunStatusText(status: number) {
  const statusMap: Record<number, string> = {
    0: '空闲',
    1: '运行中',
    2: '充电中',
    3: '故障',
  };
  return statusMap[status] || '未知';
}

/**
 * 小车运行状态颜色
 * 功能：根据状态码返回对应的 Tag 颜色
 *
 * @param {number} status - 小车运行状态码
 * @returns {string} 对应的颜色标识（blue-空闲 green-运行中 orange-充电中 red-故障）
 */
function getRunStatusColor(status: number) {
  const colorMap: Record<number, string> = {
    0: 'blue',
    1: 'green',
    2: 'orange',
    3: 'red',
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

/**
 * 任务完成操作
 * 功能：模拟完成当前卸货任务（纯演示，无接口调用）
 *
 * @param {any} row - 当前操作的任务行数据
 *
 * 流程：
 * 1. 校验任务状态，已完成的任务不可重复操作
 * 2. 更新任务状态为"已完成"
 * 3. 更新小车运行状态为"空闲"
 * 4. 提示操作成功
 *
 * 注意事项：
 * - 演示功能，未对接真实接口
 * - 已完成任务重复操作时会给出警告提示
 */
function completeTask(row: any) {
  if (row.taskStatus === 3) {
    message.warning('该任务已完成，请勿重复操作');
    return;
  }
  row.taskStatus = 3;
  row.runStatus = 0;
  message.success(`任务 ${row.taskNo} 已完成`);
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
      field: 'taskNo',
      title: '任务号',
      minWidth: 160,
    },
    {
      field: 'taskType',
      title: '任务类型',
      minWidth: 90,
    },
    {
      field: 'agvId',
      title: 'AGV小车id',
      minWidth: 90,
    },
    {
      field: 'tonBucketId',
      title: '吨桶ID',
      minWidth: 90,
    },
    {
      field: 'startPoint',
      title: '起始点位',
      minWidth: 100,
    },
    {
      field: 'targetPoint',
      title: '目标点位/目标机台',
      minWidth: 140,
    },
    {
      field: 'runStatus',
      title: '小车运行状态',
      minWidth: 120,
      slots: { default: 'runStatus' },
    },
    {
      field: 'taskStatus',
      title: '任务状态',
      minWidth: 110,
      slots: { default: 'taskStatus' },
    },
    {
      title: '操作',
      minWidth: 110,
      slots: { default: 'action' },
      fixed: 'right',
    },
  ],
  rowClassName: ({ row }: any) => getTaskRowClass(row.taskStatus),
  data: taskList.value,
  height: 500,
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
    <!-- 卸货任务清单列表 -->
    <Grid>
      <template #runStatus="{ row }">
        <Tag :color="getRunStatusColor(row.runStatus)">
          {{ getRunStatusText(row.runStatus) }}
        </Tag>
      </template>
      <template #taskStatus="{ row }">
        <Tag :color="getTaskStatusColor(row.taskStatus)">
          {{ getTaskStatusText(row.taskStatus) }}
        </Tag>
      </template>
      <template #action="{ row }">
        <Button
          type="primary"
          size="small"
          :disabled="row.taskStatus === 3"
          @click="completeTask(row)"
        >
          任务完成
        </Button>
      </template>
    </Grid>
  </div>
</template>

<style scoped>
/* 未执行（待下发/已下发）：白色背景 */
::deep(.task-row-pending) {
  background-color: #ffffff;
}

/* 执行中：黄色背景 */
::deep(.task-row-running) {
  background-color: #fde047;
}

/* 已完成：绿色背景 */
::deep(.task-row-completed) {
  background-color: #bbf7d0;
}
</style>
