<script setup lang="ts">
import { ref } from 'vue';

import AndonCall from '#/util/component/steps/andonCall.vue';
import DeviceClearing from '#/util/component/steps/deviceClearing.vue';
import EquipmentCleaning from '#/util/component/steps/equipmentCleaning.vue';
import EquipmentLocationInformation from '#/util/component/steps/equipmentLocationInformation.vue';
import EquipmentMonitoringInformation from '#/util/component/steps/equipmentMonitoringInformation.vue';
import EquipmentOperationStatus from '#/util/component/steps/equipmentOperationStatus.vue';
import FormulaDistribution from '#/util/component/steps/formulaDistribution.vue';
import LampInstallationRecord from '#/util/component/steps/lampInstallationRecord.vue';
import MaterialFeeding from '#/util/component/steps/materialFeeding.vue';
import MaterialFeedingSlitting from '#/util/component/steps/materialFeedingSlitting.vue';
import ProcessEntryStation from '#/util/component/steps/processEntryStation.vue';
import ProcessOutbound from '#/util/component/steps/processOutbound.vue';
import ProcessReporting from '#/util/component/steps/processReporting.vue';
import ResourceInspection from '#/util/component/steps/resourceInspection.vue';

const status = ref(13);

function toggle() {
  status.value = -1;
  setTimeout(() => {
    status.value = 14;
  });
}
</script>

<template>
  <button @click="toggle">11111</button>
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
  <!-- 物料投料 -->
  <MaterialFeeding v-if="status === 7" />
  <!-- 工序出站 -->
  <ProcessOutbound v-if="status === 8" />
  <!-- 配方下发 -->
  <FormulaDistribution v-if="status === 9" />
  <!-- 物料投料-分切 -->
  <MaterialFeedingSlitting v-if="status === 10" />
  <!-- 设备清空 -->
  <DeviceClearing v-if="status === 11" />
  <!-- 工序报工 -->
  <ProcessReporting v-if="status === 12" />
  <!-- 安灯呼叫 -->
  <AndonCall v-if="status === 13" />
  <!-- 安灯记录查询 -->
  <LampInstallationRecord v-if="status === 14" />
  <!-- 安灯评价 -->
  <LampInstallationRecord :state="3" v-if="status === 15" />
</template>

<style scoped></style>
