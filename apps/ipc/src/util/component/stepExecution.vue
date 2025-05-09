<script setup lang="ts">
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

defineProps({
  // 工步详情
  step: {
    type: Object,
    default: () => ({}),
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
  // 产品编号
  productCode: {
    type: String,
    default: '',
  },
  // 产品名称
  productName: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <!-- 资源检验 -->
  <ResourceInspection
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 1"
  />
  <!-- 设备清洗 -->
  <EquipmentCleaning
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 2"
  />
  <!-- 工序进站 -->
  <ProcessEntryStation
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 3"
  />
  <!-- 配方下发 -->
  <FormulaDistribution
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 4"
  />

  <!-- 物料投料-分切 -->
  <MaterialFeedingSlitting
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 5"
  />
  <!-- 设备清空 -->
  <DeviceClearing
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 6"
  />
  <!-- 工序出站 -->
  <ProcessOutbound
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 7"
  />
  <!-- 工序报工 -->
  <ProcessReporting
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 8"
  />
  <!-- 设备监控信息 -->
  <EquipmentMonitoringInformation
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 9"
  />

  <!-- 物料投料 -->
  <MaterialFeeding
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 10"
  />
  <!-- 设备运行状态 -->
  <EquipmentOperationStatus
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 11"
  />
  <!-- 安灯呼叫 -->
  <AndonCall
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :product-code="productCode"
    :product-name="productName"
    v-if="step.type === 12"
  />
  <!-- 安灯记录查询 -->
  <LampInstallationRecord
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 13"
  />
  <!-- 安灯评价 -->
  <LampInstallationRecord
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :state="3"
    v-if="step.type === 14"
  />

  <!-- 设备点位信息 -->
  <EquipmentLocationInformation
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 999"
  />
</template>

<style scoped></style>
