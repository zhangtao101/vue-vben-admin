<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、repairRequest.service、repairTask.service、notification.service API
 * [OUTPUT]: 对外提供报修单详情抽屉组件，含基本信息、维修记录、通知记录
 * [POS]: 维修维护模块 的报修单详情抽屉
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-14 11:16:00
 */
import { h, ref, watch } from 'vue';

import {
  Descriptions,
  DescriptionsItem,
  Drawer,
  Spin,
  Table,
  TabPane,
  Tabs,
  Tag,
  Typography,
} from 'ant-design-vue';

import {
  getNotificationRecords,
  getRepairRequestById,
  getRepairTasksByRequest,
} from '#/api';
import { $t } from '#/locales';

import RepairTaskDetailDrawer from './RepairTaskDetailDrawer.vue';

// ========== Props & Emits ==========
/** 抽屉可见性 */
interface Props {
  /** 报修单ID */
  requestId?: number;
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  requestId: undefined,
  visible: false,
});

/** 事件发射 */
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

// ========== 类型定义 ==========
/** 报修单详情 */
type RepairRequestDetail = {
  equipmentCode: string;
  equipmentName: string;
  faultName?: string;
  id: number;
  null?: null;
  repairConclusion?: string;
  repairContent: string;
  repairType: string;
  reportBy?: string;
  reportTime: string;
  requestNo: string;
  status: string;
  urgentLevel: string;
};

/** 维修记录项 */
type RepairTaskItem = {
  id: number;
  repairBy?: string;
  repairEndTime?: string;
  repairNo: string;
  repairResult?: string;
  repairStartTime?: string;
  status: string;
};

/** 通知记录项 */
type NotificationRecordItem = {
  failReason?: string;
  notifyChannel: string;
  notifyType: string;
  notifyUserNames: string;
  sendTime: string;
  status: string;
};

/** 报修类型映射 */
const repairTypeMap: Record<string, string> = {
  ANDON: '安灯呼叫',
  DAILY: '日常生产报修',
  EMERGENCY: '应急维修',
  INSPECTION: '点巡检',
  MAINTENANCE: '保养报修',
  OTHER: '其他',
  PREVENTIVE: '预防性维护',
};

/** 紧急程度映射 */
const urgentLevelMap: Record<string, string> = {
  CRITICAL: '紧急',
  HIGH: '高',
  LOW: '低',
  NORMAL: '普通',
};

/** 状态颜色映射 */
const statusColorMap: Record<string, string> = {
  ASSIGNED: 'processing',
  CANCELLED: 'default',
  COMPLETED: 'success',
  DRAFT: 'default',
  PAUSED: 'warning',
  PENDING: 'warning',
  PROCESSING: 'processing',
  WAITING: 'warning',
};

/** 状态映射 */
const taskStatusMap: Record<string, string> = {
  COMPLETED: '已完成',
  PAUSED: '已暂停',
  PROCESSING: '处理中',
  WAITING: '待处理',
};

/** 通知状态映射 */
const notifyStatusMap: Record<string, string> = {
  CANCELLED: '已取消',
  COMPLETED: '已完成',
  DRAFT: '未签发',
  PENDING: '待处理',
  PROCESSING: '处理中',
};

/** 报修类型格式化 */
function formatRepairType(type: string) {
  return repairTypeMap[type] || type;
}

/** 紧急程度格式化 */
function formatUrgentLevel(level: string) {
  return urgentLevelMap[level] || level;
}

/** 状态格式化 */
function formatStatus(status: string) {
  return taskStatusMap[status] || status;
}

/** 通知状态格式化 */
function formatNotifyStatus(status: string) {
  return notifyStatusMap[status] || status;
}

// ========== 抽屉状态 ==========
/** 抽屉可见性 */
const drawerVisible = ref(props.visible);

/** 监听 props.visible 变化 */
watch(
  () => props.visible,
  (val) => {
    drawerVisible.value = val;
  },
);

/** 监听抽屉可见性变化 */
watch(drawerVisible, (val) => {
  emit('update:visible', val);
});

/** 活跃的 Tab */
const activeTab = ref('repair');

/** 加载状态 */
const loading = ref(false);

/** 报修单详情数据 */
const detailData = ref<null | RepairRequestDetail>(null);

/** 维修记录列表 */
const repairTaskList = ref<RepairTaskItem[]>([]);

/** 通知记录列表 */
const notificationList = ref<NotificationRecordItem[]>([]);

/** 维修记录加载状态 */
const taskLoading = ref(false);

/** 通知记录加载状态 */
const notificationLoading = ref(false);

/** 维修任务详情抽屉可见性 */
const taskDetailVisible = ref(false);

/** 当前维修任务ID */
const currentTaskId = ref<number | undefined>(undefined);

/** 点击维修任务号 */
function handleTaskClick(record: RepairTaskItem) {
  currentTaskId.value = record.id;
  taskDetailVisible.value = true;
}

/** 加载详情数据 */
async function loadDetail() {
  if (!props.requestId) {
    detailData.value = null;
    return;
  }
  try {
    loading.value = true;
    const data = await getRepairRequestById(props.requestId);
    detailData.value = data as RepairRequestDetail;
  } finally {
    loading.value = false;
  }
}

/** 加载维修记录 */
async function loadRepairTasks() {
  if (!props.requestId) return;
  try {
    taskLoading.value = true;
    const data = await getRepairTasksByRequest(props.requestId);
    repairTaskList.value = (data || []) as RepairTaskItem[];
  } finally {
    taskLoading.value = false;
  }
}

/** 加载通知记录 */
async function loadNotifications() {
  if (!props.requestId) return;
  try {
    notificationLoading.value = true;
    const data = await getNotificationRecords(props.requestId);
    notificationList.value = (data || []) as NotificationRecordItem[];
  } finally {
    notificationLoading.value = false;
  }
}

/** 监听抽屉打开和 Tab 切换 */
watch(
  () => props.visible,
  (val) => {
    if (val && props.requestId) {
      loadDetail();
      // 根据活跃 Tab 加载数据
      if (activeTab.value === 'repair') {
        loadRepairTasks();
      } else if (activeTab.value === 'notification') {
        loadNotifications();
      }
    }
  },
);

/** Tab 切换 */
function handleTabChange(tab: number | string) {
  activeTab.value = tab as string;
  if (tab === 'repair' && repairTaskList.value.length === 0) {
    loadRepairTasks();
  } else if (tab === 'notification' && notificationList.value.length === 0) {
    loadNotifications();
  }
}

/** 维修记录列定义 */
const taskColumns = [
  {
    title: () => $t('repair.repairRequestDetail.repairTaskNo'),
    dataIndex: 'repairNo',
    width: 180,
    customRender: ({ record }: { record: RepairTaskItem }) => {
      return h(
        Typography.Link,
        { onClick: () => handleTaskClick(record) },
        () => record.repairNo,
      );
    },
  },
  { title: () => $t('repair.repairRequestDetail.repairBy'), dataIndex: 'repairBy', width: 100 },
  {
    title: () => $t('repair.repairRequestDetail.status'),
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }: { text: string }) => {
      const color = statusColorMap[text] || 'default';
      return h(Tag, { color }, () => formatStatus(text));
    },
  },
  { title: () => $t('repair.repairRequestDetail.repairResult'), dataIndex: 'repairResult', width: 100 },
  { title: () => $t('repair.repairRequestDetail.startTime'), dataIndex: 'repairStartTime', width: 160 },
  { title: () => $t('repair.repairRequestDetail.endTime'), dataIndex: 'repairEndTime', width: 160 },
];

/** 通知记录列定义 */
const notificationColumns = [
  { title: () => $t('repair.repairRequestDetail.notifyType'), dataIndex: 'notifyType', width: 100 },
  { title: () => $t('repair.repairRequestDetail.channel'), dataIndex: 'notifyChannel', width: 100 },
  { title: () => $t('repair.repairRequestDetail.receiver'), dataIndex: 'notifyUserNames', width: 100 },
  {
    title: () => $t('repair.repairRequestDetail.status'),
    dataIndex: 'status',
    width: 80,
    customRender: ({ text }: { text: string }) => {
      const color = text === 'COMPLETED' ? 'success' : (text === 'CANCELLED' ? 'error' : 'processing');
      return h(Tag, { color }, () => formatNotifyStatus(text));
    },
  },
  { title: () => $t('repair.repairRequestDetail.sendTime'), dataIndex: 'sendTime', width: 160 },
  { title: () => $t('repair.repairRequestDetail.failReason'), dataIndex: 'failReason', width: 120 },
];
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="$t('repair.repairOrder.detailTitle')"
    width="900"
    :destroy-on-close="true"
  >
    <Spin :spinning="loading">
      <!-- 基本信息 -->
      <Descriptions :column="2" bordered size="small" v-if="detailData">
        <DescriptionsItem :label="$t('repair.repairOrder.requestNo')">
          {{ detailData.requestNo }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('common.status')">
          <Tag :color="statusColorMap[detailData.status] || 'default'">
            {{ formatStatus(detailData.status) }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.repairOrder.equipmentCode')">
          {{ detailData.equipmentCode }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.repairOrder.equipmentName')">
          {{ detailData.equipmentName }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.repairOrder.repairType')">
          {{ formatRepairType(detailData.repairType) }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.repairOrder.urgentLevel')">
          {{ formatUrgentLevel(detailData.urgentLevel) }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.repairOrder.reportBy')">
          {{ detailData.reportBy }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.repairOrder.reportTime')">
          {{ detailData.reportTime }}
        </DescriptionsItem>
        <DescriptionsItem
          :label="$t('repair.repairOrder.faultDescription')"
          :span="2"
        >
          {{ detailData.repairContent }}
        </DescriptionsItem>
        <DescriptionsItem
          v-if="detailData.repairConclusion"
          :label="$t('repair.repairOrder.repairConclusion')"
          :span="2"
        >
          {{ detailData.repairConclusion }}
        </DescriptionsItem>
      </Descriptions>

      <!-- 维修记录 & 通知记录 -->
      <Tabs v-model:active-key="activeTab" @change="handleTabChange" style="margin-top: 16px">
        <TabPane key="repair" :tab="$t('repair.repairOrder.repairRecord')">
          <Spin :spinning="taskLoading">
            <Table
              :data-source="repairTaskList"
              :columns="taskColumns"
              :pagination="false"
              row-key="id"
              size="small"
              :scroll="{ y: 300 }"
            />
          </Spin>
        </TabPane>

        <TabPane key="notification" :tab="$t('repair.repairOrder.notificationRecord')">
          <Spin :spinning="notificationLoading">
            <Table
              :data-source="notificationList"
              :columns="notificationColumns"
              :pagination="false"
              row-key="sendTime"
              size="small"
              :scroll="{ y: 300 }"
            />
          </Spin>
        </TabPane>
      </Tabs>
    </Spin>

    <!-- 维修任务详情抽屉 -->
    <RepairTaskDetailDrawer
      v-model:visible="taskDetailVisible"
      :task-id="currentTaskId"
    />
  </Drawer>
</template>
