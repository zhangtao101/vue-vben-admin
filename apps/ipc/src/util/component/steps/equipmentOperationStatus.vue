<script setup lang="ts">
import { $t } from '@vben/locales';

import { Tag } from 'ant-design-vue';

/**
 * 获取清洗状态描述
 */
/* function obtainTheDeviceCleanStatus(status: number) {
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
}*/

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 p-2 text-right';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block w-48 border p-2 text-center';
}
</script>

<template>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 设备可用 -->
      <span :class="getLabelClass()">
        {{ $t('equipmentOperationStatus.equipmentAvailable') }}：
      </span>
      <Tag :bordered="false" color="success" class="align-middle text-xl">
        通讯
      </Tag>
      <Tag :bordered="false" color="error" class="align-middle text-xl">
        Ready
      </Tag>
      <Tag :bordered="false" color="warning" class="align-middle text-xl">
        远程
      </Tag>
    </div>
  </div>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 设备堵料 -->
      <span :class="getLabelClass()">
        {{ $t('equipmentOperationStatus.equipmentPlugging') }}：
      </span>
      <span :class="getValueClass()">2222</span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 堵料原因 -->
      <span :class="getLabelClass()">
        {{ $t('equipmentOperationStatus.cloggingCause') }}：
      </span>
      <span :class="getValueClass()">2222</span>
    </div>
  </div>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 设备状态 -->
      <span :class="getLabelClass()">
        {{ $t('equipmentOperationStatus.deviceStatus') }}：
      </span>
      <span :class="getValueClass()">2222</span>
    </div>
  </div>
</template>

<style scoped></style>
