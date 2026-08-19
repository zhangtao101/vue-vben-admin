<script setup lang="ts">
/**
 * 卸货对接组件
 * @description
 * 用于 AGV 卸货任务对接演示，展示卸货任务清单列表（左侧表格），
 * 并提供右侧卸货对接表单，完成卸货对接操作（纯前端演示，无接口调用）。
 * 页面左右两栏布局：
 * 1. 左侧：卸货任务清单列表（序号、任务号、任务类型、AGV小车ID、吨桶ID、起始ID、目标点位/目标机台、小车运行状态、任务状态）
 * 2. 右侧：卸货对接表单（AGVID、吨桶ID 输入框；AGV任务号、卸货任务号 文本显示；任务完成按钮）
 * 3. 通过表格行颜色区分任务状态（未执行-白色、执行中-黄色、已完成-绿色）
 * @since 2026-08-19 10:00:00
 */
import type { VxeGridProps } from '#/adapter/vxe-table';

import { reactive, ref } from 'vue';

import {
  Button,
  Col,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

defineOptions({ name: 'UnloadingDocking' });

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
 * 功能：模拟 AGV 卸货任务列表，用于演示卸货对接流程
 * 字段说明：
 * - taskNo        任务号（AGV 任务号）
 * - unloadTaskNo  卸货任务号
 * - taskType      任务类型
 * - agvId         AGV小车ID
 * - tonBucketId   吨桶ID
 * - startPoint    起始ID
 * - targetPoint   目标点位/目标机台
 * - runStatus     小车运行状态 0-空闲 1-运行中 2-充电 3-故障
 * - taskStatus    任务状态 0-待下发 1-已下发 2-执行中 3-已完成
 */
const taskList = ref<any[]>([
  {
    taskNo: 'AGV-20260819-001',
    unloadTaskNo: 'UL-20260819-001',
    taskType: '卸货',
    agvId: 'AGV-01',
    tonBucketId: 'TB-1001',
    startPoint: 'B-03',
    targetPoint: 'A-01',
    runStatus: 1,
    taskStatus: 2,
  },
  {
    taskNo: 'AGV-20260819-002',
    unloadTaskNo: 'UL-20260819-002',
    taskType: '卸货',
    agvId: 'AGV-02',
    tonBucketId: 'TB-1002',
    startPoint: 'B-05',
    targetPoint: 'A-02',
    runStatus: 0,
    taskStatus: 0,
  },
  {
    taskNo: 'AGV-20260819-003',
    unloadTaskNo: 'UL-20260819-003',
    taskType: '卸货',
    agvId: 'AGV-03',
    tonBucketId: 'TB-1003',
    startPoint: 'B-07',
    targetPoint: 'A-03',
    runStatus: 2,
    taskStatus: 1,
  },
  {
    taskNo: 'AGV-20260819-004',
    unloadTaskNo: 'UL-20260819-004',
    taskType: '卸货',
    agvId: 'AGV-04',
    tonBucketId: 'TB-1004',
    startPoint: 'B-09',
    targetPoint: 'A-04',
    runStatus: 0,
    taskStatus: 0,
  },
  {
    taskNo: 'AGV-20260819-005',
    unloadTaskNo: 'UL-20260819-005',
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
      title: '起始ID',
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
  ],
  rowClassName: ({ row }: any) => getTaskRowClass(row.taskStatus),
  data: taskList.value,
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

// region 卸货对接表单

/**
 * 卸货对接表单数据
 * 功能：存储右侧表单的输入与回显数据
 * 字段说明：
 * - agvId         AGVID 输入框
 * - tonBucketId   吨桶ID 输入框
 * - agvTaskNo     AGV任务号（文本显示）
 * - unloadTaskNo  卸货任务号（文本显示）
 */
const formData = reactive({
  agvId: '',
  tonBucketId: '',
  agvTaskNo: '',
  unloadTaskNo: '',
});

/**
 * 回显任务信息到表单
 * 功能：将任务行数据回显到右侧表单
 *
 * @param {any} row - 任务行数据
 *
 * 流程：
 * 1. 将行内的 AGV 编号、吨桶 ID 回显到输入框
 * 2. 将行内的 AGV 任务号、卸货任务号回显到文本显示区
 */
function fillForm(row: any) {
  formData.agvId = row.agvId;
  formData.tonBucketId = row.tonBucketId;
  formData.agvTaskNo = row.taskNo;
  formData.unloadTaskNo = row.unloadTaskNo;
}

/**
 * 表格行点击回显
 * 功能：点击左侧表格某行时，将任务信息回显到右侧表单
 *
 * @param {any} param - VXE Grid cell-click 事件参数
 * @param {any} param.row - 当前点击的行数据
 */
function handleCellClick({ row }: any) {
  fillForm(row);
}

/**
 * 随机回显卸货任务
 * 功能：组件初始化时随机从任务列表选取一行，回显到右侧表单，
 * 使页面加载后表单即有数据展示
 */
function randomInitForm() {
  const randomIndex = Math.floor(Math.random() * taskList.value.length);
  const row = taskList.value[randomIndex];
  if (row) {
    fillForm(row);
  }
}

// 初始化时随机显示一条卸货任务数据
randomInitForm();

/**
 * 任务完成操作
 * 功能：模拟完成当前卸货对接任务（纯演示，无接口调用）
 *
 * 流程：
 * 1. 校验 AGVID、吨桶ID 是否填写
 * 2. 校验是否已从左侧表格选择卸货任务
 * 3. 查找对应任务行，校验任务状态
 * 4. 更新任务状态为"已完成"、小车运行状态为"空闲"
 * 5. 提示操作成功
 *
 * 注意事项：
 * - 演示功能，未对接真实接口
 * - 已完成任务重复操作时给出警告提示
 */
function completeTask() {
  if (!formData.agvId || !formData.tonBucketId) {
    message.warning('请先填写 AGVID 和吨桶ID');
    return;
  }
  if (!formData.agvTaskNo || !formData.unloadTaskNo) {
    message.warning('请先在左侧表格中选择卸货任务');
    return;
  }
  const target = taskList.value.find(
    (item) => item.taskNo === formData.agvTaskNo,
  );
  if (!target) {
    message.warning('未找到对应的卸货任务');
    return;
  }
  if (target.taskStatus === 3) {
    message.warning('该任务已完成，请勿重复操作');
    return;
  }
  target.taskStatus = 3;
  target.runStatus = 0;
  message.success(`卸货任务 ${target.taskNo} 已完成`);
}

// endregion
</script>

<template>
  <div class="docking-layout">
    <!-- 左侧：卸货任务清单列表 -->
    <div class="table-panel">
      <Grid @cell-click="handleCellClick">
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
      </Grid>
    </div>
    <!-- 右侧：卸货对接表单 -->
    <div class="form-panel">
      <div class="form-title">卸货对接</div>
      <Form layout="vertical" :model="formData">
        <!-- 第一行：AGVID、吨桶ID 输入框 -->
        <Row :gutter="12">
          <Col :span="12">
            <FormItem label="AGVID">
              <Input v-model:value="formData.agvId" placeholder="请输入AGV编号" />
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="吨桶ID">
              <Input v-model:value="formData.tonBucketId" placeholder="请输入吨桶ID" />
            </FormItem>
          </Col>
        </Row>
        <!-- 第二行：AGV任务号、卸货任务号 文本显示 -->
        <Row :gutter="12">
          <Col :span="12">
            <FormItem label="AGV任务号">
              <div class="text-value">
                {{ formData.agvTaskNo || '—' }}
              </div>
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="卸货任务号">
              <div class="text-value">
                {{ formData.unloadTaskNo || '—' }}
              </div>
            </FormItem>
          </Col>
        </Row>
        <!-- 任务完成按钮 -->
        <Button type="primary" block @click="completeTask">
          任务完成
        </Button>
      </Form>
    </div>
  </div>
</template>

<style scoped>
/* 左右两栏布局 */
.docking-layout {
  display: flex;
  gap: 16px;
  width: 100%;
}

/* 左侧表格容器：自适应宽度 */
.table-panel {
  flex: 1;
  min-width: 0;
}

/* 右侧表单容器：固定宽度，带边框卡片样式 */
.form-panel {
  width: 440px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
}

/* 表单标题 */
.form-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

/* 文本显示区域：模拟输入框外观 */
.text-value {
  height: 32px;
  line-height: 30px;
  padding: 0 11px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #f5f5f5;
  color: rgba(0, 0, 0, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
