<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Spin } from 'ant-design-vue';

import { queryOfResourceVerificationStatus } from '#/api';

const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
});

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 border p-2 text-center';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block w-48 border p-2 text-center';
}

/**
 * 详情
 */
const details = ref<any>({});
/**
 * 加载中
 */
const spinning = ref<any>(false);
/**
 * 查询数据
 */
function queryData() {
  spinning.value = true;
  queryOfResourceVerificationStatus({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  })
    .then((data) => {
      details.value = data;
    })
    .finally(() => {
      spinning.value = false;
    });
}

onMounted(() => {
  queryData();
});
</script>

<template>
  <Spin :spinning="spinning">
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 设备可用 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.equipmentAvailable') }}
        </span>
        <span :class="getValueClass()">
          {{ details.readyFlagName || '暂无' }}
        </span>
      </div>
    </div>
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 设备堵料" -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.equipmentPlugging') }}
        </span>
        <span :class="getValueClass()">
          {{ details.nextFuncEnableName || '暂无' }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 堵料原因 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.cloggingCause') }}
        </span>
        <span :class="getValueClass()">
          {{ details.nextFuncEnableReason || '暂无' }}
        </span>
      </div>
    </div>
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 设备状态 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.deviceStatus') }}
        </span>
        <span :class="getValueClass()">
          {{ details.machineStatusName || '暂无' }}
        </span>
      </div>
    </div>
  </Spin>
</template>

<style scoped></style>
