<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue 的组件，以及 moldBase、moldMounting API
 * [OUTPUT]: 对外提供模具下模填报页面组件
 * [POS]: 设备管理模块 的模具下模填报页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-19 16:25:00
 */
import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { Button, Card, Divider, Input, message, Space } from 'ant-design-vue';

import { getEquipBindingByCode } from '#/api/equipManagement/moldBase.service';
import {
  getMoldCurrentInfo,
  submitMoldOperation,
} from '#/api/equipManagement/moldMounting.service';
import { $t } from '#/locales';

// ========== 状态定义 ==========

/** 设备编码 */
const equipmentCode = ref('');
/** 设备信息 */
const equipmentInfo = ref<null | {
  equipName: string;
  processName: string;
}>(null);
/** 设备加载状态 */
const equipmentLoading = ref(false);

/** 当前在机模具信息 */
const moldCurrentInfo = ref<null | {
  installTime: null | string;
  moldCode: null | string;
  moldName: null | string;
  workOrderNo: null | string;
}>(null);
/** 在机模具加载状态 */
const moldCurrentLoading = ref(false);

/** 提交加载状态 */
const submitLoading = ref(false);

// ========== 计算属性 ==========

/** 是否可以提交（下模） */
const canSubmit = computed(() => {
  return (
    moldCurrentInfo.value !== null &&
    moldCurrentInfo.value.moldCode !== null &&
    !submitLoading.value
  );
});

// ========== 接口调用 ==========

/**
 * 查询设备信息
 * @returns {void} 无返回值
 * @since 2026-05-19 16:25:00
 */
function queryEquipmentInfo() {
  if (!equipmentCode.value) {
    equipmentInfo.value = null;
    moldCurrentInfo.value = null;
    return;
  }
  equipmentLoading.value = true;
  getEquipBindingByCode(equipmentCode.value)
    .then((res: any) => {
      if (res) {
        equipmentInfo.value = {
          equipName: res.equipName || '',
          processName: res.processName || '',
        };
        message.success($t('moldDismounting.equipmentQuerySuccess'));
        // 查询当前在机模具信息
        queryMoldCurrentInfo();
      } else {
        equipmentInfo.value = null;
        moldCurrentInfo.value = null;
        message.warning($t('moldDismounting.equipmentQueryFail'));
      }
    })
    .catch(() => {
      equipmentInfo.value = null;
      moldCurrentInfo.value = null;
      message.error($t('moldDismounting.equipmentQueryFail'));
    })
    .finally(() => {
      equipmentLoading.value = false;
    });
}

/**
 * 查询当前在机模具信息
 * @returns {void} 无返回值
 * @since 2026-05-19 16:25:00
 */
function queryMoldCurrentInfo() {
  if (!equipmentCode.value) {
    return;
  }
  moldCurrentLoading.value = true;
  getMoldCurrentInfo(equipmentCode.value)
    .then((res: any) => {
      moldCurrentInfo.value = res
        ? {
            installTime: res.installTime || null,
            moldCode: res.moldCode || null,
            moldName: res.moldName || null,
            workOrderNo: res.workOrderNo || null,
          }
        : null;
    })
    .catch(() => {
      moldCurrentInfo.value = null;
    })
    .finally(() => {
      moldCurrentLoading.value = false;
    });
}

/**
 * 确认下模操作
 * @returns {void} 无返回值
 * @since 2026-05-19 16:25:00
 */
function handleSubmit() {
  if (!canSubmit.value) {
    return;
  }
  submitLoading.value = true;
  submitMoldOperation({
    operationType: 'REMOVE',
    moldCode: moldCurrentInfo.value?.moldCode ?? '',
    equipmentCode: equipmentCode.value,
  })
    .then(() => {
      message.success($t('moldDismounting.dismountSuccess'));
      // 重置表单
      resetForm();
    })
    .catch(() => {
      message.error($t('moldDismounting.dismountFail'));
    })
    .finally(() => {
      submitLoading.value = false;
    });
}

/**
 * 重置表单
 * @returns {void} 无返回值
 * @since 2026-05-19 16:25:00
 */
function resetForm() {
  equipmentCode.value = '';
  equipmentInfo.value = null;
  moldCurrentInfo.value = null;
}
</script>

<template>
  <Page>
    <Card class="mb-4">
      <div class="text-lg font-medium mb-4">
        {{ $t('moldDismounting.title') }}
      </div>
      <!-- 设备扫码 -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center mb-2">
          <span class="text-red-500 mr-1">*</span>
          <span class="font-medium">{{
            $t('moldDismounting.equipmentScan')
          }}</span>
        </div>
        <div class="flex items-center gap-4">
          <Input
            v-model:value="equipmentCode"
            :placeholder="$t('moldDismounting.equipmentScanPlaceholder')"
            class="w-80"
            @press-enter="queryEquipmentInfo"
          >
            <template #prefix>
              <Icon icon="mdi:barcode-scan" class="text-gray-400" />
            </template>
          </Input>
          <Button :loading="equipmentLoading" @click="queryEquipmentInfo">
            <Icon icon="mdi:magnify" class="inline-block align-top" />
            查询
          </Button>
        </div>
        <!-- 设备信息展示 -->
        <div
          v-if="equipmentInfo"
          class="mt-3 p-3 bg-white rounded border border-gray-200"
        >
          <Space>
            <span class="text-gray-500"
              >{{ $t('moldDismounting.equipmentName') }}：</span
            >
            <span class="font-medium">{{ equipmentInfo.equipName }}</span>
            <Divider type="vertical" />
            <span class="text-gray-500"
              >{{ $t('moldDismounting.process') }}：</span
            >
            <span class="font-medium">{{ equipmentInfo.processName }}</span>
          </Space>
        </div>
      </div>

      <!-- 当前在机模具信息 -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center mb-2">
          <span class="font-medium">{{
            $t('moldDismounting.moldCurrentInfo')
          }}</span>
        </div>
        <div
          v-if="moldCurrentLoading"
          class="p-4 bg-white rounded border border-gray-200 text-center text-gray-500"
        >
          {{ $t('moldDismounting.querying') }}
        </div>
        <div
          v-else-if="moldCurrentInfo && moldCurrentInfo.moldCode"
          class="p-3 bg-white rounded border border-gray-200"
        >
          <Space direction="vertical" :size="8">
            <Space>
              <span class="text-gray-500"
                >{{ $t('moldDismounting.moldCode') }}：</span
              >
              <span class="font-medium">{{ moldCurrentInfo.moldCode }}</span>
              <Divider type="vertical" />
              <span class="text-gray-500"
                >{{ $t('moldDismounting.moldName') }}：</span
              >
              <span class="font-medium">{{ moldCurrentInfo.moldName }}</span>
            </Space>
            <Space>
              <span class="text-gray-500"
                >{{ $t('moldDismounting.workOrderNo') }}：</span
              >
              <span class="font-medium">{{
                moldCurrentInfo.workOrderNo || '-'
              }}</span>
              <Divider type="vertical" />
              <span class="text-gray-500"
                >{{ $t('moldDismounting.installTime') }}：</span
              >
              <span class="font-medium">{{
                moldCurrentInfo.installTime || '-'
              }}</span>
            </Space>
          </Space>
        </div>
        <div
          v-else
          class="p-4 bg-white rounded border border-gray-200 text-center text-gray-400"
        >
          {{ $t('moldDismounting.noMoldOnEquipment') }}
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="flex justify-center gap-4">
        <Button size="large" @click="resetForm">
          <Icon icon="mdi:refresh" class="inline-block align-middle" />
          {{ $t('moldDismounting.reset') }}
        </Button>
        <Button
          type="primary"
          size="large"
          :disabled="!canSubmit"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          <Icon icon="mdi:check" class="inline-block align-middle" />
          {{ $t('moldDismounting.confirmDismount') }}
        </Button>
      </div>
    </Card>
  </Page>
</template>

<style scoped></style>
