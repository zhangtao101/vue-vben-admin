<script setup lang="ts">
import { $t } from '@vben/locales';

import { Button, Input } from 'ant-design-vue';

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
  return 'inline-block min-w-24 border p-2 text-center';
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
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 原配方号" -->
      <label :class="getLabelClass()" for="originalRecipeNumber">
        {{ $t('productionOperation.originalRecipeNumber') }}
      </label>
      <Input class="w-56 leading-[30px]" id="originalRecipeNumber" />
    </div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 目标配方号" -->
      <label :class="getLabelClass()" for="targetRecipeNumber">
        {{ $t('productionOperation.targetRecipeNumber') }}
      </label>
      <Input class="w-56 leading-[30px]" id="targetRecipeNumber" />
    </div>
  </div>
  <div>
    <div class="mb-4 mr-8 inline-block">
      <!-- 配方下发状态" -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.formulaDeliveryCondition') }}
      </span>
      <span :class="getValueClass()">
        {{ $t('productionOperation.automaticallyDeliveredSuccessfully') }}
      </span>
    </div>
    <div class="mb-4 mr-8 inline-block">
      <Button type="primary">
        {{ $t('productionOperation.manualDelivery') }}
      </Button>
    </div>
  </div>
</template>

<style scoped></style>
