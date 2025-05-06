<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, message, Spin } from 'ant-design-vue';

import { endOfFeeding, materialFeedingInformationQuerySlitting } from '#/api';

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
  materialFeedingInformationQuerySlitting({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    feedtype: 2,
  })
    .then((data) => {
      details.value = data;
    })
    .finally(() => {
      spinning.value = false;
    });
}

function submit() {
  endOfFeeding({
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
          {{ details.lastFlagName }}
        </span>
      </div>
    </div>

    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 当前模式 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.currentMode') }}
        </span>
        <span :class="getValueClass()">
          {{ details.feedModelName }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 模式切换次数 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.modeSwitchingTimes') }}
        </span>
        <span :class="getValueClass()">
          {{ details.feedModelChangeCount }}
        </span>
      </div>
    </div>

    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 前设备投料 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.preEquipmentFeeding') }}
        </span>
        <span :class="getValueClass()">
          {{ details.lastFeedFlagName }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 前设备堵料设置 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.frontDevicePlugSetting') }}
        </span>
        <span :class="getValueClass()">
          {{ details.lastFeedWaiteFlagName }}
        </span>
      </div>
    </div>

    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 后级设备入料允许 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.feedIsAllowedForPostStageEquipment') }}
        </span>
        <span :class="getValueClass()">
          {{ details.nextFeedFlagName }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 后级设备工单 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.postEquipmentWorkOrder') }}
        </span>
        <span :class="getValueClass()">
          {{ details.nextWorksheetCode }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 后级设备状态 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.statusOfTheLastDevice') }}
        </span>
        <span :class="getValueClass()">
          {{ details.nextMachineStatusName }}
        </span>
      </div>
    </div>

    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 当前设备投料状态 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.currentDeviceFeedingStatus') }}
        </span>
        <span :class="getValueClass()">
          {{ details.machineStatusName }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <Button type="primary" @click="submit">
          {{ $t('productionOperation.endOfFeeding') }}
        </Button>
      </div>
    </div>
  </Spin>
</template>

<style scoped></style>
