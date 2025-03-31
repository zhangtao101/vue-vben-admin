<script setup lang="ts">
import { ref } from 'vue';

import EquipmentCleaning from '#/util/component/steps/equipmentCleaning.vue';
import EquipmentLocationInformation from '#/util/component/steps/equipmentLocationInformation.vue';
import EquipmentMonitoringInformation from '#/util/component/steps/equipmentMonitoringInformation.vue';
import EquipmentOperationStatus from '#/util/component/steps/equipmentOperationStatus.vue';
import ProcessEntryStation from '#/util/component/steps/processEntryStation.vue';
import ResourceInspection from '#/util/component/steps/resourceInspection.vue';

const status = ref(6);
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
  <!-- 资源检验 -->
  <ResourceInspection v-if="status === 5" />
  <!-- 工序进站 -->
  <ProcessEntryStation v-if="status === 6" />
</template>

<style scoped></style>
