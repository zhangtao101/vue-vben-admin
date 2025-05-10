<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, message, Spin } from 'ant-design-vue';

import {
  equipmentCleaningInformation,
  manualCleaningOfTheEquipment,
  manuallyFinishTheCleaning,
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
  equipmentCleaningInformation({
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

/**
 * 提交
 * @param bol 是否为手动清空
 */
function submit(bol: boolean) {
  const params = {
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    nextTemplateCode: details.value.nextTemplateCode,
  };
  const ob = bol
    ? manualCleaningOfTheEquipment(params)
    : manuallyFinishTheCleaning(params);
  ob.then(() => {
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
    </div>

    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 清洁模式 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.cleaningMode') }}
        </span>
        <span :class="getValueClass()">
          {{ details.cleanModel === 1 ? '自动' : '手动' }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 清洁状态 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.cleanCondition') }}
        </span>
        <span :class="getValueClass()">
          {{ details.cleanlinessFlagName || $t('productionOperation.none') }}
        </span>
      </div>
    </div>
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 清洁计时 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.cleaningTimer') }}
        </span>
        <span :class="getValueClass()"> {{ details.setMinute || 0 }}分钟 </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 清洁设置时长 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.cleaningSettingDuration') }}
        </span>
        <span :class="getValueClass()">
          {{ details.cleanMinute || 0 }}分钟
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 清洁超时 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.cleaningTimeout') }}
        </span>
        <span :class="getValueClass()">
          {{ $t('productionOperation.no') }}
        </span>
      </div>
      <div class="float-right mb-4 mr-8 inline-block">
        <!-- 超时时才会出现  v-if="details.overTimeFlag === 1" -->
        <Button
          type="primary"
          size="large"
          class="mr-4"
          @click="submit(true)"
          :disabled="[1, 2, 3].includes(details.cleanlinessFlag)"
        >
          {{ $t('productionOperation.manualRecleaning') }}
        </Button>
        <Button
          type="primary"
          size="large"
          danger
          @click="submit(false)"
          :disabled="![1, 2, 3].includes(details.cleanlinessFlag)"
        >
          {{ $t('productionOperation.manualEndJob') }}
        </Button>
      </div>
    </div>
  </Spin>
</template>

<style scoped></style>
