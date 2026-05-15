<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、repairTask.service、getProcessRecordById API
 * [OUTPUT]: 对外提供过程记录详情抽屉组件
 * [POS]: 维修维护模块 的过程记录详情抽屉
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-15 12:37:00
 */

import type {
  ProcessRecordDetail,
  ReportDetailData,
  TransferDetailData,
} from '#/api/equipManagement/repairTask.service';

import { ref, watch } from 'vue';

import {
  Descriptions,
  DescriptionsItem,
  Drawer,
  Spin,
} from 'ant-design-vue';

import { getProcessRecordById } from '#/api';
import { $t } from '#/locales';

// Props
const props = defineProps<{
  recordId?: number;
  visible: boolean;
}>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

// ========== 类型定义 ==========
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

// ========== 状态 ==========
/** 详情加载状态 */
const loading = ref(false);
/** 过程记录详情数据 */
const detailData = ref<null | ProcessRecordDetail>(null);

// ========== 方法 ==========

/**
 * 加载过程记录详情数据。
 * @returns {void} 无返回值
 * @throws 请求失败时设置 detailData 为 null
 * @since 2026-05-15 12:37:00
 */
function loadDetail() {
  if (!props.recordId) {
    detailData.value = null;
    return;
  }
  loading.value = true;
  getProcessRecordById(props.recordId)
    .then((data) => {
      detailData.value = data;
    })
    .catch(() => {
      detailData.value = null;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 格式化维修任务状态为中文显示。
 * @param {string} status - 状态编码
 * @returns {string} 中文状态名称，未知状态返回原值
 * @since 2026-05-15 12:37:00
 */
function formatStatus(status: string) {
  return statusMap[status] || status;
}

/**
 * 格式化动作类型为中文显示。
 * @param {string} actionType - 动作类型编码
 * @returns {string} 中文动作名称，未知类型返回原值
 * @since 2026-05-15 12:37:00
 */
function formatActionType(actionType: string) {
  return actionTypeMap[actionType] || actionType;
}

/**
 * 关闭过程记录详情抽屉。
 * @returns {void} 无返回值
 * @since 2026-05-15 12:37:00
 */
function handleClose() {
  emit('update:visible', false);
}

// ========== 监听 ==========

/**
 * 监听抽屉可见性变化，打开时加载详情数据。
 * @returns {void} 无返回值
 * @since 2026-05-15 12:37:00
 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadDetail();
    }
  },
);
</script>

<template>
  <Drawer
    :open="visible"
    :title="$t('repair.processRecordDetail.title')"
    width="500"
    @close="handleClose"
  >
    <Spin :spinning="loading">
      <Descriptions v-if="detailData" :column="1" bordered size="small">
        <DescriptionsItem :label="$t('repair.processRecordDetail.processType')">
          {{ formatActionType(detailData.actionType) }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.processRecordDetail.operator')">
          {{ detailData.operator }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.processRecordDetail.actionTime')">
          {{ detailData.actionTime }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.processRecordDetail.beforeStatus')">
          <span :style="{ color: statusColorMap[detailData.beforeStatus] ? undefined : '#666' }">
            {{ formatStatus(detailData.beforeStatus) }}
          </span>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.processRecordDetail.afterStatus')">
          <span :style="{ color: statusColorMap[detailData.afterStatus] ? undefined : '#666' }">
            {{ formatStatus(detailData.afterStatus) }}
          </span>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('repair.processRecordDetail.processRemark')">
          {{ detailData.remark || '-' }}
        </DescriptionsItem>

        <!-- 转交详情 -->
        <template v-if="detailData.actionType === 'TRANSFER' && (detailData.detailData as TransferDetailData)">
          <DescriptionsItem :label="$t('repair.processRecordDetail.fromUser')">
            {{ (detailData.detailData as TransferDetailData).fromUser || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.processRecordDetail.toUser')">
            {{ (detailData.detailData as TransferDetailData).toUser || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.processRecordDetail.transferReason')">
            {{ (detailData.detailData as TransferDetailData).transferReason || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.processRecordDetail.transferRemark')">
            {{ (detailData.detailData as TransferDetailData).transferRemark || '-' }}
          </DescriptionsItem>
        </template>

        <!-- 填报详情 -->
        <template v-if="detailData.actionType === 'REPORT' && (detailData.detailData as ReportDetailData)">
          <DescriptionsItem :label="$t('repair.processRecordDetail.repairResult')">
            {{ (detailData.detailData as ReportDetailData).repairResult || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.processRecordDetail.hasReplacedParts')">
            {{ (detailData.detailData as ReportDetailData).hasReplacedParts ? $t('common.yes') : $t('common.no') }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.processRecordDetail.replacedParts')">
            {{ (detailData.detailData as ReportDetailData).replacedParts || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.processRecordDetail.rootCauseCategory')">
            {{ (detailData.detailData as ReportDetailData).rootCauseCategory || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.processRecordDetail.rootCauseDetail')">
            {{ (detailData.detailData as ReportDetailData).rootCauseDetail || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.processRecordDetail.repairMethod')">
            {{ (detailData.detailData as ReportDetailData).repairMethod || '-' }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('repair.processRecordDetail.repairContent')" :span="1">
            {{ (detailData.detailData as ReportDetailData).repairContent || '-' }}
          </DescriptionsItem>
        </template>
      </Descriptions>
      <div v-else style="text-align: center; color: #999; padding: 32px;">
        {{ $t('repair.processRecordDetail.noData') }}
      </div>
    </Spin>
  </Drawer>
</template>
