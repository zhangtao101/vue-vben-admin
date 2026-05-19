<script lang="ts" setup>
/**
 * [INPUT]: 依赖 ant-design-vue、@iconify/vue 的组件，以及 moldBase、moldMounting API
 * [OUTPUT]: 对外提供模具上模填报页面组件
 * [POS]: 设备管理模块 的模具上模填报页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-05-19 15:10:00
 */
import { computed, ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import {
  Alert,
  Button,
  Card,
  Divider,
  Input,
  message,
  Space,
} from 'ant-design-vue';

import {
  getEquipBindingByCode,
  getMoldBaseByCode,
} from '#/api/equipManagement/moldBase.service';
import {
  getWorkSheetByCodeV2,
  submitMoldOperation,
  validateMoldOperation,
} from '#/api/equipManagement/moldMounting.service';
import { $t } from '#/locales';

// ========== 状态定义 ==========

/** 模具编码 */
const moldCode = ref('');
/** 模具信息 */
const moldInfo = ref<null | {
  currentStatusName: string;
  moldName: string;
}>(null);
/** 模具加载状态 */
const moldLoading = ref(false);

/** 设备编码 */
const equipmentCode = ref('');
/** 设备信息 */
const equipmentInfo = ref<null | {
  equipName: string;
  processName: string;
}>(null);
/** 设备加载状态 */
const equipmentLoading = ref(false);

/** 工单号 */
const workOrderNo = ref('');
/** 工单信息 */
const workOrderInfo = ref<null | {
  productCode: string;
  productName: string;
}>(null);
/** 工单加载状态 */
const workOrderLoading = ref(false);

/** 校验结果 */
const validateResult = ref<null | {
  message: string;
  valid: boolean;
  warning: boolean;
}>(null);
/** 校验加载状态 */
const validateLoading = ref(false);

/** 提交加载状态 */
const submitLoading = ref(false);

// ========== 计算属性 ==========

/** 是否可以提交（上模） */
const canSubmit = computed(() => {
  return (
    validateResult.value !== null &&
    validateResult.value.valid &&
    !submitLoading.value
  );
});

// ========== 接口调用 ==========

/**
 * 查询模具信息
 * @returns {void} 无返回值
 * @since 2026-05-19 15:10:00
 */
function queryMoldInfo() {
  if (!moldCode.value) {
    moldInfo.value = null;
    return;
  }
  moldLoading.value = true;
  getMoldBaseByCode(moldCode.value)
    .then((res: any) => {
      if (res) {
        moldInfo.value = {
          currentStatusName: res.currentStatusName || '',
          moldName: res.moldName || '',
        };
        message.success($t('moldMounting.moldQuerySuccess'));
      } else {
        moldInfo.value = null;
        message.warning($t('moldMounting.moldQueryFail'));
      }
    })
    .catch(() => {
      moldInfo.value = null;
      message.error($t('moldMounting.moldQueryFail'));
    })
    .finally(() => {
      moldLoading.value = false;
      checkValidation();
    });
}

/**
 * 查询设备信息
 * @returns {void} 无返回值
 * @since 2026-05-19 15:10:00
 */
function queryEquipmentInfo() {
  if (!equipmentCode.value) {
    equipmentInfo.value = null;
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
        message.success($t('moldMounting.equipmentQuerySuccess'));
      } else {
        equipmentInfo.value = null;
        message.warning($t('moldMounting.equipmentQueryFail'));
      }
    })
    .catch(() => {
      equipmentInfo.value = null;
      message.error($t('moldMounting.equipmentQueryFail'));
    })
    .finally(() => {
      equipmentLoading.value = false;
      checkValidation();
    });
}

/**
 * 查询工单信息
 * @returns {void} 无返回值
 * @since 2026-05-19 15:10:00
 */
function queryWorkOrderInfo() {
  if (!workOrderNo.value) {
    workOrderInfo.value = null;
    return;
  }
  workOrderLoading.value = true;
  getWorkSheetByCodeV2(workOrderNo.value)
    .then((res: any) => {
      if (res && res.productCode) {
        workOrderInfo.value = {
          productCode: res.productCode || '',
          productName: res.productName || '',
        };
        message.success($t('moldMounting.workOrderQuerySuccess'));
      } else {
        workOrderInfo.value = null;
        message.warning($t('moldMounting.workOrderQueryFail'));
      }
    })
    .catch(() => {
      workOrderInfo.value = null;
      message.error($t('moldMounting.workOrderQueryFail'));
    })
    .finally(() => {
      workOrderLoading.value = false;
      checkValidation();
    });
}

/**
 * 检查是否满足校验条件，满足则调用校验接口
 * @returns {void} 无返回值
 * @since 2026-05-19 15:10:00
 */
function checkValidation() {
  // 三个码都存在时才调用校验接口
  if (!moldCode.value || !equipmentCode.value || !workOrderNo.value) {
    return;
  }
  validateLoading.value = true;
  validateMoldOperation({
    moldCode: moldCode.value,
    equipmentCode: equipmentCode.value,
    workOrderNo: workOrderNo.value,
  })
    .then((res: any) => {
      validateResult.value = {
        valid: res.valid,
        message: res.message,
        warning: res.warning,
      };
    })
    .catch(() => {
      validateResult.value = {
        valid: false,
        message: '校验接口调用失败',
        warning: false,
      };
    })
    .finally(() => {
      validateLoading.value = false;
    });
}

/**
 * 确认上模操作
 * @returns {void} 无返回值
 * @since 2026-05-19 15:10:00
 */
function handleSubmit() {
  if (!canSubmit.value) {
    return;
  }
  submitLoading.value = true;
  submitMoldOperation({
    operationType: 'INSTALL',
    moldCode: moldCode.value,
    equipmentCode: equipmentCode.value,
    workOrderNo: workOrderNo.value,
  })
    .then(() => {
      message.success($t('moldMounting.mountSuccess'));
      // 重置表单
      resetForm();
    })
    .catch(() => {
      message.error($t('moldMounting.mountFail'));
    })
    .finally(() => {
      submitLoading.value = false;
    });
}

/**
 * 重置表单
 * @returns {void} 无返回值
 * @since 2026-05-19 15:10:00
 */
function resetForm() {
  moldCode.value = '';
  moldInfo.value = null;
  equipmentCode.value = '';
  equipmentInfo.value = null;
  workOrderNo.value = '';
  workOrderInfo.value = null;
  validateResult.value = null;
}
</script>

<template>
  <Page>
    <Card class="mb-4">
      <div class="text-lg font-medium mb-4">{{ $t('moldMounting.title') }}</div>
      <!-- 上部：模具扫码 -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center mb-2">
          <span class="text-red-500 mr-1">*</span>
          <span class="font-medium">{{ $t('moldMounting.moldScan') }}</span>
        </div>
        <div class="flex items-center gap-4">
          <Input
            v-model:value="moldCode"
            :placeholder="$t('moldMounting.moldScanPlaceholder')"
            class="w-80"
            @press-enter="queryMoldInfo"
          >
            <template #prefix>
              <Icon icon="mdi:barcode-scan" class="text-gray-400" />
            </template>
          </Input>
          <Button :loading="moldLoading" @click="queryMoldInfo">
            <Icon icon="mdi:magnify" class="inline-block align-top" />
            查询
          </Button>
        </div>
        <!-- 模具信息展示 -->
        <div
          v-if="moldInfo"
          class="mt-3 p-3 bg-white rounded border border-gray-200"
        >
          <Space>
            <span class="text-gray-500"
              >{{ $t('moldMounting.moldName') }}：</span
            >
            <span class="font-medium">{{ moldInfo.moldName }}</span>
            <Divider type="vertical" />
            <span class="text-gray-500"
              >{{ $t('moldMounting.moldStatus') }}：</span
            >
            <span class="font-medium">
              {{ moldInfo.currentStatusName }}
            </span>
          </Space>
        </div>
      </div>

      <!-- 中部：设备扫码 -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center mb-2">
          <span class="text-red-500 mr-1">*</span>
          <span class="font-medium">{{
            $t('moldMounting.equipmentScan')
          }}</span>
        </div>
        <div class="flex items-center gap-4">
          <Input
            v-model:value="equipmentCode"
            :placeholder="$t('moldMounting.equipmentScanPlaceholder')"
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
              >{{ $t('moldMounting.equipmentName') }}：</span
            >
            <span class="font-medium">{{ equipmentInfo.equipName }}</span>
            <Divider type="vertical" />
            <span class="text-gray-500"
              >{{ $t('moldMounting.process') }}：</span
            >
            <span class="font-medium">{{ equipmentInfo.processName }}</span>
          </Space>
        </div>
      </div>

      <!-- 下部：工单扫码 -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center mb-2">
          <span class="text-red-500 mr-1">*</span>
          <span class="font-medium">{{
            $t('moldMounting.workOrderScan')
          }}</span>
        </div>
        <div class="flex items-center gap-4">
          <Input
            v-model:value="workOrderNo"
            :placeholder="$t('moldMounting.workOrderScanPlaceholder')"
            class="w-80"
            @press-enter="queryWorkOrderInfo"
          >
            <template #prefix>
              <Icon icon="mdi:barcode-scan" class="text-gray-400" />
            </template>
          </Input>
          <Button :loading="workOrderLoading" @click="queryWorkOrderInfo">
            <Icon icon="mdi:magnify" class="inline-block align-top" />
            查询
          </Button>
        </div>
        <!-- 工单信息展示 -->
        <div
          v-if="workOrderInfo"
          class="mt-3 p-3 bg-white rounded border border-gray-200"
        >
          <Space>
            <span class="text-gray-500"
              >{{ $t('moldMounting.productCode') }}：</span
            >
            <span class="font-medium">{{ workOrderInfo.productCode }}</span>
            <Divider type="vertical" />
            <span class="text-gray-500"
              >{{ $t('moldMounting.productName') }}：</span
            >
            <span class="font-medium">{{ workOrderInfo.productName }}</span>
          </Space>
        </div>
      </div>

      <!-- 验证结果 -->
      <div class="mb-6">
        <div class="flex items-center mb-2">
          <span class="font-medium">{{
            $t('moldMounting.validateResult')
          }}</span>
        </div>
        <div
          v-if="validateLoading"
          class="p-4 bg-gray-50 rounded-lg text-center text-gray-500"
        >
          {{ $t('moldMounting.validating') }}
        </div>
        <Alert
          v-else-if="validateResult"
          :message="
            validateResult.valid
              ? $t('moldMounting.validatePass')
              : $t('moldMounting.validateFail')
          "
          :description="validateResult.message"
          :type="validateResult.valid ? 'success' : 'error'"
          :show-icon="true"
        />
        <div v-else class="p-4 bg-gray-50 rounded-lg text-center text-gray-400">
          {{ $t('moldMounting.validateHint') }}
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="flex justify-center gap-4">
        <Button size="large" @click="resetForm">
          <Icon icon="mdi:refresh" class="inline-block align-middle" />
          {{ $t('moldMounting.reset') }}
        </Button>
        <Button
          type="primary"
          size="large"
          :disabled="!canSubmit"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          <Icon icon="mdi:check" class="inline-block align-middle" />
          {{ $t('moldMounting.confirmMount') }}
        </Button>
      </div>
    </Card>
  </Page>
</template>

<style scoped></style>
