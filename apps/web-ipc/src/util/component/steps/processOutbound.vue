<script setup lang="ts">
import { $t } from '@vben/locales';

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
      <!-- 产品名称 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.productName') }}
      </span>
      <span :class="getValueClass()">
        {{ $t('productionOperation.none') }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 设备状态 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.deviceStatus') }}
      </span>
      <span :class="getValueClass()">
        {{ $t('productionOperation.shutDown') }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
