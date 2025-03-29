<script setup lang="ts">
import { $t } from '@vben/locales';

import { Col, Row, Tag } from 'ant-design-vue';

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
      <span :class="getLabelClass()">{{
        $t('equipmentOperationStatus.equipmentAvailable')
      }}</span>
      <Tag :bordered="false" color="success" class="align-middle text-xl">
        通讯
      </Tag>
      <Tag :bordered="false" color="error" class="align-middle text-xl">
        Ready
      </Tag>
      <Tag :bordered="false" color="warning" class="align-middle text-xl">
        远程
      </Tag>
    </Col>
  </Row>
  <Row class="mb-4">
    <Col :span="12">
      <!-- 设备堵料 -->
      <span :class="getLabelClass()">{{
        $t('equipmentOperationStatus.equipmentPlugging')
      }}</span>
      <span :class="getValueClass()">2222</span>
    </Col>
    <Col :span="12">
      <!-- 堵料原因 -->
      <span :class="getLabelClass()">{{
        $t('equipmentOperationStatus.cloggingCause')
      }}</span>
      <span :class="getValueClass()">2222</span>
    </Col>
  </Row>
  <Row>
    <Col :span="12">
      <!-- 设备状态 -->
      <span :class="getLabelClass()">{{
        $t('equipmentOperationStatus.deviceStatus')
      }}</span>
      <span :class="getValueClass()">2222</span>
    </Col>
  </Row>
</template>

<style scoped></style>
