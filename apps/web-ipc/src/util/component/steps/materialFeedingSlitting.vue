<script setup lang="ts">
import { $t } from '@vben/locales';

import { Button } from 'ant-design-vue';

/**
 * 获取清洗状态描述
 */
function obtainTheDeviceCleanStatus(status: number) {
  switch (status) {
    case 1: {
      return $t('productionOperation.yes');
    }
    case 2: {
      return $t('productionOperation.beCleaning');
    }
    case 3: {
      return $t('productionOperation.completed');
    }
    default: {
      return $t('productionOperation.no');
    }
  }
}

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
  return 'inline-block w-24 border p-2 text-center';
}
</script>

<template>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 前工步执行状况 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.implementationStatus') }}
      </span>
      <span :class="getValueClass()">
        {{ obtainTheDeviceCleanStatus(3) }}
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
        {{ $t('productionOperation.longRange') }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 模式切换次数 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.modeSwitchingTimes') }}
      </span>
      <span :class="getValueClass()"> 0 </span>
    </div>
  </div>

  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 当前模式 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.preEquipmentFeeding') }}
      </span>
      <span :class="getValueClass()"> 1 </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 模式切换次数 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.frontDevicePlugSetting') }}
      </span>
      <span :class="getValueClass()"> 0 </span>
    </div>
  </div>

  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 后级设备入料允许 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.feedIsAllowedForPostStageEquipment') }}
      </span>
      <span :class="getValueClass()"> 1 </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 后级设备工单 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.postEquipmentWorkOrder') }}
      </span>
      <span :class="getValueClass()"> 0 </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 后级设备状态 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.statusOfTheLastDevice') }}
      </span>
      <span :class="getValueClass()"> 0 </span>
    </div>
  </div>

  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 当前设备投料状态 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.currentDeviceFeedingStatus') }}
      </span>
      <span :class="getValueClass()"> 1 </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <Button type="primary">
        {{ $t('productionOperation.endOfFeeding') }}
      </Button>
    </div>
  </div>
</template>

<style scoped></style>
