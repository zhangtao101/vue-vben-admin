<script setup lang="ts">
import { $t } from '@vben/locales';

import { Col, Row } from 'ant-design-vue';

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
  <Row class="mb-4">
    <Col :span="12">
      <!-- 前工步执行状况 -->
      <span :class="getLabelClass()">{{
        $t('productionOperation.implementationStatus')
      }}</span>
      <span :class="getValueClass()">
        {{ obtainTheDeviceCleanStatus(1) }}
      </span>
    </Col>
  </Row>
  <Row>
    <Col :span="8">
      <!-- 设备自动清洁状态 -->
      <span :class="getLabelClass()">{{
        $t('productionOperation.automaticCleaningStatusOfTheDevice')
      }}</span>
      <span :class="getValueClass()">2222</span>
    </Col>
  </Row>
</template>

<style scoped></style>
