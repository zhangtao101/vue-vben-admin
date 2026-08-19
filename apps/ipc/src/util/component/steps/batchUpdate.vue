<script setup lang="ts">
/**
 * 批次更新组件
 * @description
 * 用于批次更新作业演示，展示批次物料清单（左侧表格）与批次更新记录（右侧表格），
 * 纯前端演示，无接口调用。
 * 页面左右两栏布局：
 * 1. 左侧：批次物料清单列表（序号、物料名称、进料量、实际进料量、反应时间、反应温度、执行类型）
 * 2. 右侧：批次更新记录列表（序号、吨桶ID、机台号、批次号、操作时间）
 * 3. 左侧表格通过行颜色区分任务状态（未执行-白色、执行中-黄色、已完成-绿色）
 * @since 2026-08-19 10:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

defineOptions({ name: 'BatchUpdate' });

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

// region 左侧：批次物料清单表格

/**
 * 批次物料演示数据
 * 功能：模拟批次更新所需的物料清单列表
 * 字段说明：
 * - materialName  物料名称
 * - feedQty       进料量
 * - actualQty     实际进料量
 * - reactionTime  反应时间
 * - reactionTemp  反应温度
 * - executeType   执行类型 自动/手动
 * - taskStatus    任务状态（隐藏字段，用于行颜色区分）0-待下发 1-已下发 2-执行中 3-已完成
 */
const materialList = ref<any[]>([
  {
    materialName: 'A液',
    feedQty: '500KG',
    actualQty: '498.5KG',
    reactionTime: '60min',
    reactionTemp: '80℃',
    executeType: '自动',
    taskStatus: 2,
  },
  {
    materialName: 'B液',
    feedQty: '300KG',
    actualQty: '300KG',
    reactionTime: '45min',
    reactionTemp: '75℃',
    executeType: '自动',
    taskStatus: 0,
  },
  {
    materialName: 'C粉',
    feedQty: '100KG',
    actualQty: '98.2KG',
    reactionTime: '30min',
    reactionTemp: '70℃',
    executeType: '手动',
    taskStatus: 1,
  },
  {
    materialName: 'D液',
    feedQty: '200KG',
    actualQty: '200KG',
    reactionTime: '50min',
    reactionTemp: '85℃',
    executeType: '自动',
    taskStatus: 0,
  },
  {
    materialName: 'E粉',
    feedQty: '80KG',
    actualQty: '79.6KG',
    reactionTime: '20min',
    reactionTemp: '65℃',
    executeType: '手动',
    taskStatus: 3,
  },
]);

/**
 * 执行类型颜色
 * 功能：根据执行类型返回对应的 Tag 颜色
 *
 * @param {string} type - 执行类型（自动/手动）
 * @returns {string} 对应的颜色标识（自动-green 手动-orange）
 */
function getExecuteTypeColor(type: string) {
  const colorMap: Record<string, string> = {
    自动: 'green',
    手动: 'orange',
  };
  return colorMap[type] || 'default';
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

const materialGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      width: 60,
    },
    {
      field: 'materialName',
      title: '物料名称',
      minWidth: 110,
    },
    {
      field: 'feedQty',
      title: '进料量',
      minWidth: 90,
    },
    {
      field: 'actualQty',
      title: '实际进料量',
      minWidth: 100,
    },
    {
      field: 'reactionTime',
      title: '反应时间',
      minWidth: 100,
    },
    {
      field: 'reactionTemp',
      title: '反应温度',
      minWidth: 100,
    },
    {
      field: 'executeType',
      title: '执行类型',
      minWidth: 100,
      slots: { default: 'executeType' },
    },
  ],
  rowClassName: ({ row }: any) => getTaskRowClass(row.taskStatus),
  data: materialList.value,
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

const [MaterialGrid] = useVbenVxeGrid({ gridOptions: materialGridOptions });

// endregion

// region 右侧：批次更新记录表格

/**
 * 批次更新记录演示数据
 * 功能：模拟批次更新后的操作记录列表
 * 字段说明：
 * - tonBucketId   吨桶ID
 * - machineNo     机台号
 * - batchNo       批次号
 * - operateTime   操作时间
 */
const recordList = ref<any[]>([
  {
    tonBucketId: 'TB-1001',
    machineNo: 'M-01',
    batchNo: 'PC20260819001',
    operateTime: '2026-08-19 09:30:00',
  },
  {
    tonBucketId: 'TB-1002',
    machineNo: 'M-02',
    batchNo: 'PC20260819002',
    operateTime: '2026-08-19 10:05:00',
  },
  {
    tonBucketId: 'TB-1003',
    machineNo: 'M-01',
    batchNo: 'PC20260819003',
    operateTime: '2026-08-19 10:42:00',
  },
  {
    tonBucketId: 'TB-1004',
    machineNo: 'M-03',
    batchNo: 'PC20260819004',
    operateTime: '2026-08-19 11:18:00',
  },
  {
    tonBucketId: 'TB-1005',
    machineNo: 'M-02',
    batchNo: 'PC20260819005',
    operateTime: '2026-08-19 11:56:00',
  },
]);

const recordGridOptions: VxeGridProps<any> = {
  align: 'center',
  border: true,
  columns: [
    {
      title: '序号',
      type: 'seq',
      width: 60,
    },
    {
      field: 'tonBucketId',
      title: '吨桶ID',
      minWidth: 100,
    },
    {
      field: 'machineNo',
      title: '机台号',
      minWidth: 90,
    },
    {
      field: 'batchNo',
      title: '批次号',
      minWidth: 150,
    },
    {
      field: 'operateTime',
      title: '操作时间',
      minWidth: 170,
    },
  ],
  data: recordList.value,
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

const [RecordGrid] = useVbenVxeGrid({ gridOptions: recordGridOptions });

// endregion
</script>

<template>
  <div class="batch-layout">
    <!-- 左侧：批次物料清单列表 -->
    <div class="material-panel">
      <div class="panel-title">批次物料清单</div>
      <MaterialGrid>
        <template #executeType="{ row }">
          <Tag :color="getExecuteTypeColor(row.executeType)">
            {{ row.executeType }}
          </Tag>
        </template>
      </MaterialGrid>
    </div>
    <!-- 右侧：批次更新记录列表 -->
    <div class="record-panel">
      <div class="panel-title">批次更新记录</div>
      <RecordGrid />
    </div>
  </div>
</template>

<style scoped>
/* 左右两栏布局 */
.batch-layout {
  display: flex;
  gap: 16px;
  width: 100%;
}

/* 左侧物料清单容器：自适应宽度，占比更大 */
.material-panel {
  flex: 1.4;
  min-width: 0;
}

/* 右侧批次记录容器：自适应宽度 */
.record-panel {
  flex: 1;
  min-width: 0;
}

/* 面板标题 */
.panel-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

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
