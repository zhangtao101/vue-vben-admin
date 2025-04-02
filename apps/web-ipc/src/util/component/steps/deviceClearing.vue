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
      <!-- 清空模式 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.emptyMode') }}
      </span>
      <span :class="getValueClass()">
        {{ $t('productionOperation.auto') }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 清空状态 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.emptyState') }}
      </span>
      <span :class="getValueClass()">
        {{ $t('productionOperation.beCleaning') }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 清空计时 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.emptyTimer') }}
      </span>
      <span :class="getValueClass()">15min</span>
    </div>
  </div>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 清空超时 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.emptyTimeout') }}
      </span>
      <span :class="getValueClass()">
        {{ $t('productionOperation.no') }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 超时时才会出现 -->
      <Button type="primary" size="large" class="mr-4">手动再次清洁</Button>
      <Button type="primary" size="large" danger>手动结束作业</Button>
    </div>
  </div>
</template>

<style scoped></style>
