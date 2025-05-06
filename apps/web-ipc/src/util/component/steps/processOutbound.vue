<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Spin } from 'ant-design-vue';

import { processExitInformationQuery } from '#/api';

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
  processExitInformationQuery({
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
        <!-- 前工步执行状况 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.implementationStatus') }}
        </span>
        <span :class="getValueClass()">
          {{ details.lastFlagName }}
        </span>
      </div>
    </div>

    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 产品名称 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.productName') }}
        </span>
        <span :class="getValueClass()">
          {{ details.productName }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 当前工单 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.currentWorkOrder') }}
        </span>
        <span :class="getValueClass()">
          {{ details.currentJobId }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 产品编号 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.productNumber') }}
        </span>
        <span :class="getValueClass()">
          {{ details.productCode }}
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
          {{ details.machineStatusName }}
        </span>
      </div>
    </div>
  </Spin>
</template>

<style scoped></style>
