<script setup lang="ts">
import { ref } from 'vue';

import EquipmentCleaning from '#/util/component/steps/equipmentCleaning.vue';
import EquipmentLocationInformation from '#/util/component/steps/equipmentLocationInformation.vue';
import EquipmentMonitoringInformation from '#/util/component/steps/equipmentMonitoringInformation.vue';
import EquipmentOperationStatus from '#/util/component/steps/equipmentOperationStatus.vue';

const status = ref(1);
</script>

<template>
  <!-- 设备清洗 -->
  <EquipmentCleaning v-if="status === 1" />
  <!-- 设备运行状态 -->
  <EquipmentOperationStatus v-if="status === 2" />
  <!-- 设备点位信息 -->
  <EquipmentLocationInformation v-if="status === 3" />
  <!-- 设备监控信息 -->
  <EquipmentMonitoringInformation v-if="status === 4" />
</template>

<style scoped></style>
