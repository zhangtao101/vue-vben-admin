<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Input, message, Spin } from 'ant-design-vue';

import {
  queryOfFormulaDistributionInformation,
  theFormulaHasBeenIssued,
} from '#/api';

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
  queryOfFormulaDistributionInformation({
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

function submit() {
  theFormulaHasBeenIssued({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    nextTemplateCode: details.value.nextTemplateCode,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    queryData();
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
          {{ details.lastFlagName || $t('productionOperation.none') }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 设备状态 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.deviceStatus') }}
        </span>
        <span :class="getValueClass()">
          {{ details.machineStatusName || $t('productionOperation.none') }}
        </span>
      </div>
    </div>
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 原配方号" -->
        <label :class="getLabelClass()" for="originalRecipeNumber">
          {{ $t('productionOperation.originalRecipeNumber') }}
        </label>
        <Input
          v-model:value="details.templateCode"
          class="w-56 leading-[30px]"
          id="originalRecipeNumber"
        />
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 目标配方号" -->
        <label :class="getLabelClass()" for="targetRecipeNumber">
          {{ $t('productionOperation.targetRecipeNumber') }}
        </label>
        <Input
          v-model:value="details.nextTemplateCode"
          class="w-56 leading-[30px]"
          id="targetRecipeNumber"
        />
      </div>
    </div>
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 配方下发状态" -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.formulaDeliveryCondition') }}
        </span>
        <span :class="getValueClass()">
          {{ details.tempSendFlagName }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <Button type="primary" @click="submit()">
          {{ $t('productionOperation.manualDelivery') }}
        </Button>
      </div>
    </div>
  </Spin>
</template>

<style scoped></style>
