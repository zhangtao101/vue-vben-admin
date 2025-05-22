<script setup lang="ts">
import AndonCall from '#/util/component/steps/andonCall.vue';
import DeviceClearing from '#/util/component/steps/deviceClearing.vue';
import EquipmentCleaning from '#/util/component/steps/equipmentCleaning.vue';
import EquipmentLocationInformation from '#/util/component/steps/equipmentLocationInformation.vue';
import EquipmentMonitoringInformation from '#/util/component/steps/equipmentMonitoringInformation.vue';
import EquipmentOperationStatus from '#/util/component/steps/equipmentOperationStatus.vue';
import ExitReport from '#/util/component/steps/exitReport.vue';
import FirstInspection from '#/util/component/steps/firstInspection.vue';
import FormulaDistribution from '#/util/component/steps/formulaDistribution.vue';
import LampInstallationRecord from '#/util/component/steps/lampInstallationRecord.vue';
import ManufactureEntry from '#/util/component/steps/manufactureEntry.vue';
import MaterialFeeding from '#/util/component/steps/materialFeeding.vue';
import MaterialFeedingSlitting from '#/util/component/steps/materialFeedingSlitting.vue';
import ProcessEntryStation from '#/util/component/steps/processEntryStation.vue';
import ProcessOutbound from '#/util/component/steps/processOutbound.vue';
import ProcessReporting from '#/util/component/steps/processReporting.vue';
import ReportForWorkExit from '#/util/component/steps/reportForWorkExit.vue';
import ResourceAssignment from '#/util/component/steps/resourceAssignment.vue';
import ResourceInspection from '#/util/component/steps/resourceInspection.vue';
import ScanModule from '#/util/component/steps/scanModule.vue';
import ScanningHomework from '#/util/component/steps/scanningHomework.vue';
import ScanTask from '#/util/component/steps/scanTask.vue';
import ScanWorkflow from '#/util/component/steps/scanWorkflow.vue';
import Selfinspection from '#/util/component/steps/selfinspection.vue';
import Transcoding from '#/util/component/steps/transcoding.vue';

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
  <!-- 设备运行状态(弃用) -->
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
  <LampInstallationRecord v-if="step.type === 13" />
  <!-- 安灯评价 -->
  <LampInstallationRecord :place="3" v-if="step.type === 14" />
  <!-- 转码 -->
  <Transcoding
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 15"
  />
  <!-- 首检 -->
  <FirstInspection
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 16"
  />
  <!-- 自检 -->
  <Selfinspection
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 17"
  />
  <!-- 巡检 -->
  <Selfinspection
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 18"
  />
  <!-- 末检 -->
  <Selfinspection
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    v-if="step.type === 19"
  />
  <!-- 转向节压装 - 扫码作业 -- 和城 -->
  <ScanningHomework
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 20"
  />
  <!-- 焊接底座 - 扫码作业 -- 和城 -->
  <ScanningHomework
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 21"
  />
  <!-- 人工检验 - 扫码作业 -- 和城 -->
  <ScanningHomework
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 22"
  />
  <!-- 弹簧压装 - 扫码作业 -- 和城 -->
  <ScanningHomework
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 23"
  />
  <!-- 出站报工 -->
  <ReportForWorkExit
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 24"
  />
  <!-- 转向节压装 - 扫码作业 -- 马瑞利 -->
  <ScanningHomework
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 25"
  />
  <!-- 焊接底座 - 扫码作业 -- 马瑞利 -->
  <ScanningHomework
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 26"
  />
  <!-- 人工检验 - 扫码作业 -- 马瑞利 -->
  <ScanningHomework
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 27"
  />
  <!-- 弹簧压装 - 扫码作业 -- 马瑞利 -->
  <ScanningHomework
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 28"
  />
  <!-- 资源指派 -->
  <ResourceAssignment
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 29"
  />
  <!-- 出站报工 - 和城 -->
  <ExitReport
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 31"
  />
  <!-- 扫码作业--- 成品、半成品老练检 耐压 -->
  <ScanModule
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 32"
  />
  <!-- 扫码作业--- 氦气 -->
  <ScanModule
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 33"
  />
  <!-- 扫码作业--- 陶瓷 -->
  <ScanWorkflow
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 34"
  />
  <!-- 扫码作业--- 半成品宗参，触点电洗，开距测试 -->
  <ScanTask
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 35"
  />
  <!-- 扫码作业--- 成品宗参，高度极性 -->
  <ScanTask
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 37"
  />
  <!-- 工序进站 -->
  <ManufactureEntry
    :workstation-code="workstationCode"
    :equip-code="equipCode"
    :worksheet-code="worksheetCode"
    :binding-id="bindingId"
    :function-id="step.id"
    :show-type-number="step.type"
    v-if="step.type === 36"
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
