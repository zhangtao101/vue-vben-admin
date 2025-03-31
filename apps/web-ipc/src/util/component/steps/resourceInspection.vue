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
      <!-- 设备可用 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.equipmentAvailable') }}
      </span>
      <span :class="getValueClass()">
        {{ obtainTheDeviceCleanStatus(3) }}
      </span>
    </Col>
  </Row>
  <Row class="mb-4">
    <Col :span="8">
      <!-- 当前工单" -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.currentWorkOrder') }}
      </span>
      <span :class="getValueClass()">
        {{ $t('productionOperation.none') }}
      </span>
    </Col>
    <Col :span="8">
      <!-- 待进工单 -->
      <span :class="getLabelClass()">
        {{ $t('productionOperation.pendingWorkOrder') }}
      </span>
      <span :class="getValueClass()">
        {{ $t('productionOperation.none') }}
      </span>
    </Col>
  </Row>
</template>

<style scoped></style>
