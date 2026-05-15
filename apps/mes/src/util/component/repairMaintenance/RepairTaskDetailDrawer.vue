<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、repairTask.service API
 * [OUTPUT]: 对外提供维修任务详情抽屉组件
 * [POS]: 维修维护模块 的维修任务详情抽屉
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-14 13:17:00
 */
import { ref, watch } from 'vue';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Spin,
  TabPane,
  Tabs,
  Tag,
  Timeline,
  TimelineItem,
} from 'ant-design-vue';

import { getProcessRecordsByTask, getRepairTaskById } from '#/api';
import { $t } from '#/locales';
import ProcessRecordDetailDrawer from '#/util/component/repairMaintenance/ProcessRecordDetailDrawer.vue';

// ========== Props & Emits ==========
/** 抽屉可见性 */
interface Props {
  /** 维修任务ID */
  taskId?: number;
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  taskId: undefined,
  visible: false,
});

/** 事件发射 */
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

// ========== 类型定义 ==========
/** 维修任务详情 */
type RepairTaskDetail = {
  createBy?: string;
  createTime?: string;
  equipmentCode: string;
  equipmentName: string;
  faultDescription?: string;
  faultName?: string;
  faultRootCause?: string;
  id: number;
  repairBy?: string;
  repairContent?: string;
  repairDuration?: number;
  repairEndTime?: string;
  repairNo: string;
  repairParts?: string;
  repairResult?: string;
  repairStartTime?: string;
  repairType: string;
  reportBy?: string;
  reportTime?: string;
  requestId: number;
  requestNo: string;
  responseDuration?: number;
  status: string;
  updateBy?: string;
  updateTime?: string;
  urgentLevel: string;
};

/** 维修过程记录项 */
type ProcessRecordItem = {
  actionTime: string;
  actionType: string;
  afterStatus: string;
  beforeStatus: string;
  id: number;
  operator: string;
  remark?: string;
};

/** 动作类型映射 */
const actionTypeMap: Record<string, string> = {
  ASSIGN: '指派',
  CANCEL: '取消',
  CLAIM: '领取',
  COMPLETE: '完成',
  PAUSE: '暂停',
  REPORT: '填报',
  RESUME: '恢复',
  START: '开始',
  TRANSFER: '转交',
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
const statusMap: Record<string, string> = {
  ASSIGNED: '已指派',
  CANCELLED: '已取消',
  COMPLETED: '已完成',
  DRAFT: '草稿',
  PAUSED: '已暂停',
  PENDING: '待处理',
  PROCESSING: '处理中',
  WAITING: '待领取',
};

/** 紧急程度映射 */
const urgentLevelMap: Record<string, string> = {
  CRITICAL: '紧急',
  HIGH: '高',
  LOW: '低',
  NORMAL: '普通',
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

/** 状态格式化 */
function formatStatus(status: string) {
  return statusMap[status] || status;
}

/** 紧急程度格式化 */
function formatUrgentLevel(level: string) {
  return urgentLevelMap[level] || level;
}

/** 报修类型格式化 */
function formatRepairType(type: string) {
  return repairTypeMap[type] || type;
}

/** 动作类型格式化 */
function formatActionType(actionType: string) {
  return actionTypeMap[actionType] || actionType;
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

/** 加载状态 */
const loading = ref(false);

/** 任务详情数据 */
const detailData = ref<null | RepairTaskDetail>(null);

/** 过程记录列表 */
const processRecords = ref<ProcessRecordItem[]>([]);

/** 过程记录加载状态 */
const processLoading = ref(false);

/** 详情抽屉状态 */
const detailDrawerVisible = ref(false);
const detailDrawerRecordId = ref<number | undefined>(undefined);

/** 查看详情 */
function handleViewDetail(recordId: number) {
  detailDrawerRecordId.value = recordId;
  detailDrawerVisible.value = true;
}

/** 加载详情数据 */
async function loadDetail() {
  if (!props.taskId) {
    detailData.value = null;
    return;
  }
  try {
    loading.value = true;
    const data = await getRepairTaskById(props.taskId);
    detailData.value = data as RepairTaskDetail;
  } finally {
    loading.value = false;
  }
}

/** 加载过程记录 */
async function loadProcessRecords() {
  if (!props.taskId) return;
  try {
    processLoading.value = true;
    const data = await getProcessRecordsByTask(props.taskId);
    processRecords.value = (data || []) as ProcessRecordItem[];
  } finally {
    processLoading.value = false;
  }
}

/** 监听抽屉打开 */
watch(
  () => props.visible,
  (val) => {
    if (val && props.taskId) {
      loadDetail();
      loadProcessRecords();
    }
  },
);
</script>

<template>
  <Drawer
    v-model:open="drawerVisible"
    :title="$t('repair.repairTask.detailTitle')"
    width="700"
    :destroy-on-close="true"
  >
    <Spin :spinning="loading">
      <Tabs style="margin-top: 16px">
        <TabPane key="info" :tab="$t('repair.repairTaskDetail.basicInfo')">
          <Descriptions :column="2" bordered size="small" v-if="detailData">
            <DescriptionsItem :label="$t('repair.repairTask.repairNo')">
              {{ detailData.repairNo }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('common.status')">
              <Tag :color="statusColorMap[detailData.status] || 'default'">
                {{ formatStatus(detailData.status) }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.requestNo')">
              {{ detailData.requestNo }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.equipmentCode')">
              {{ detailData.equipmentCode }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.equipmentName')">
              {{ detailData.equipmentName }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.urgentLevel')">
              {{ formatUrgentLevel(detailData.urgentLevel) }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.repairType')">
              {{ formatRepairType(detailData.repairType) }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.reportBy')">
              {{ detailData.reportBy }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.reportTime')">
              {{ detailData.reportTime }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.repairBy')">
              {{ detailData.repairBy }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.faultName')">
              {{ detailData.faultName }}
            </DescriptionsItem>
            <DescriptionsItem
              :label="$t('repair.repairTask.repairContent')"
              :span="2"
            >
              {{ detailData.repairContent }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.repairStartTime')">
              {{ detailData.repairStartTime }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.repairEndTime')">
              {{ detailData.repairEndTime }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.repairDuration')">
              {{
                detailData.repairDuration
                  ? `${detailData.repairDuration} ${$t('repair.repairTaskDetail.minutes')}`
                  : '-'
              }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('repair.repairTask.responseDuration')">
              {{
                detailData.responseDuration
                  ? `${detailData.responseDuration} ${$t('repair.repairTaskDetail.minutes')}`
                  : '-'
              }}
            </DescriptionsItem>
            <DescriptionsItem
              :label="$t('repair.repairTask.repairResult')"
              :span="2"
            >
              {{ detailData.repairResult }}
            </DescriptionsItem>
            <DescriptionsItem
              :label="$t('repair.repairTask.repairParts')"
              :span="2"
            >
              {{ detailData.repairParts }}
            </DescriptionsItem>
            <DescriptionsItem
              :label="$t('repair.repairTask.faultRootCause')"
              :span="2"
            >
              {{ detailData.faultRootCause }}
            </DescriptionsItem>
          </Descriptions>
        </TabPane>

        <TabPane
          key="process"
          :tab="$t('repair.repairTaskDetail.processRecord')"
        >
          <Spin :spinning="processLoading">
            <Timeline
              v-if="processRecords.length > 0"
              mode="alternate"
              class="!mt-4"
            >
              <TimelineItem
                v-for="record in processRecords"
                :key="record.id"
                :color="
                  record.actionType === 'COMPLETE' ||
                  record.actionType === 'CANCEL'
                    ? 'green'
                    : 'blue'
                "
              >
                <div
                  style="
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                  "
                >
                  <div>
                    <div style="font-weight: 500">
                      {{ formatActionType(record.actionType) }}
                      <Tag
                        :color="statusColorMap[record.afterStatus] || 'default'"
                        style="margin-left: 8px"
                      >
                        {{ formatStatus(record.afterStatus) }}
                      </Tag>
                    </div>
                    <div style=" margin-top: 4px;color: #888">
                      {{ $t('repair.repairTaskDetail.operator') }}：{{
                        record.operator
                      }}
                    </div>
                    <div
                      v-if="record.remark"
                      style=" margin-top: 4px;color: #666"
                    >
                      {{ record.remark }}
                    </div>
                  </div>
                  <div
                    style="
                      display: flex;
                      flex-direction: column;
                      gap: 4px;
                      align-items: flex-end;
                    "
                  >
                    <div
                      style=" font-size: 12px;color: #888; white-space: nowrap"
                    >
                      {{ record.actionTime }}
                    </div>
                    <Button
                      type="link"
                      size="small"
                      @click="handleViewDetail(record.id)"
                    >
                      {{ $t('repair.repairTaskDetail.viewDetail') }}
                    </Button>
                  </div>
                </div>
              </TimelineItem>
            </Timeline>
            <div v-else style=" padding: 16px;color: #999; text-align: center">
              {{ $t('repair.repairTaskDetail.noProcessRecord') }}
            </div>
          </Spin>
        </TabPane>
      </Tabs>
    </Spin>
  </Drawer>

  <!-- 过程记录详情抽屉 -->
  <ProcessRecordDetailDrawer
    v-model:visible="detailDrawerVisible"
    :record-id="detailDrawerRecordId"
  />
</template>
