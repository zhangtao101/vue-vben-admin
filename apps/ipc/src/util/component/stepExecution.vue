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
import InsulationVoltage from '#/util/component/steps/insulationVoltage.vue';
import LampInstallationRecord from '#/util/component/steps/lampInstallationRecord.vue';
import ManufactureEntry from '#/util/component/steps/manufactureEntry.vue';
import MaterialFeeding from '#/util/component/steps/materialFeeding.vue';
import MaterialFeedingSlitting from '#/util/component/steps/materialFeedingSlitting.vue';
import MultiStationScan from '#/util/component/steps/multiStationScan.vue';
import ParamTemplate from '#/util/component/steps/paramTemplate.vue';
import ProcessEntryStation from '#/util/component/steps/processEntryStation.vue';
import ProcessOutbound from '#/util/component/steps/processOutbound.vue';
import ProcessReporting from '#/util/component/steps/processReporting.vue';
import ReportForWorkExit from '#/util/component/steps/reportForWorkExit.vue';
import ResourceInspection from '#/util/component/steps/resourceInspection.vue';
import ScanningHomework from '#/util/component/steps/scanningHomework.vue';
import ScanTask from '#/util/component/steps/scanTask.vue';
import Selfinspection from '#/util/component/steps/selfinspection.vue';
import SingleStationScan from '#/util/component/steps/singleStationScan.vue';
import Transcoding from '#/util/component/steps/transcoding.vue';

/**
 * 定义组件接收的 props，用于传递工步执行所需的相关信息
 */
defineProps({
  // 工步详情对象，包含工步的类型、ID 等信息
  step: {
    type: Object,
    default: () => ({}),
  },
  // 工序 ID，用于标识当前工序
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号，用于标识当前工单
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号，用于标识当前使用的设备
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心代码，用于标识当前工作中心
  workstationCode: {
    type: String,
    default: '',
  },
  // 产品编号，用于标识当前生产的产品
  productCode: {
    type: String,
    default: '',
  },
  // 产品名称，用于显示当前生产的产品名称
  productName: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div>
    <!-- 资源检验：根据工步类型为 1 时，渲染资源检验组件，并传递相关参数 -->
    <ResourceInspection
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 1"
    />
    <!-- 设备清洗：根据工步类型为 2 时，渲染设备清洗组件，并传递相关参数 -->
    <EquipmentCleaning
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 2"
    />
    <!-- 工序进站：根据工步类型为 3 时，渲染工序进站组件，并传递相关参数 -->
    <ProcessEntryStation
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 3"
    />
    <!-- 配方下发：根据工步类型为 4 时，渲染配方下发组件，并传递相关参数 -->
    <FormulaDistribution
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 4"
    />

    <!-- 物料投料-分切：根据工步类型为 5 时，渲染物料投料-分切组件，并传递相关参数 -->
    <MaterialFeedingSlitting
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 5"
    />
    <!-- 设备清空：根据工步类型为 6 时，渲染设备清空组件，并传递相关参数 -->
    <DeviceClearing
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 6"
    />
    <!-- 工序出站：根据工步类型为 7 时，渲染工序出站组件，并传递相关参数 -->
    <ProcessOutbound
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 7"
    />
    <!-- 工序报工：根据工步类型为 8 时，渲染工序报工组件，并传递相关参数 -->
    <ProcessReporting
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 8"
    />
    <!-- 设备监控信息：根据工步类型为 9 时，渲染设备监控信息组件，并传递相关参数 -->
    <EquipmentMonitoringInformation
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 9"
    />

    <!-- 物料投料：根据工步类型为 10 时，渲染物料投料组件，并传递相关参数 -->
    <MaterialFeeding
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 10"
    />
    <!-- 设备运行状态(弃用)：根据工步类型为 11 时，渲染设备运行状态组件，并传递相关参数 -->
    <EquipmentOperationStatus
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 11"
    />
    <!-- 安灯呼叫：根据工步类型为 12 时，渲染安灯呼叫组件，并传递相关参数 -->
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
    <!-- 安灯记录查询：根据工步类型为 13 时，渲染安灯记录查询组件 -->
    <LampInstallationRecord v-if="step.type === 13" />
    <!-- 安灯评价：根据工步类型为 14 时，渲染安灯记录查询组件，并传递评价位置参数 -->
    <LampInstallationRecord :place="3" v-if="step.type === 14" />
    <!-- 转码：根据工步类型为 15 或 30 或 45 时，渲染转码组件，并传递相关参数 -->
    <Transcoding
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="[15, 30, 45].includes(step.type)"
    />
    <!-- 首检：根据工步类型为 16 时，渲染首检组件，并传递相关参数 -->
    <FirstInspection
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 16"
    />
    <!-- 自检：根据工步类型为 17 时，渲染自检组件，并传递相关参数 -->
    <Selfinspection
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 17"
    />
    <!-- 巡检：根据工步类型为 18 时，渲染自检组件，并传递相关参数 -->
    <Selfinspection
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 18"
    />
    <!-- 末检：根据工步类型为 19 时，渲染自检组件，并传递相关参数 -->
    <Selfinspection
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 19"
    />
    <!-- 转向节压装 - 扫码作业 -- 和城：根据工步类型为 20 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanningHomework
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 20"
    />
    <!-- 焊接底座 - 扫码作业 -- 和城：根据工步类型为 21 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanningHomework
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 21"
    />
    <!-- 人工检验 - 扫码作业 -- 和城：根据工步类型为 22 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanningHomework
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 22"
    />
    <!-- 弹簧压装 - 扫码作业 -- 和城：根据工步类型为 23 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanningHomework
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 23"
    />
    <!-- 出站报工：根据工步类型为 24 时，渲染出站报工组件，并传递相关参数 -->
    <ReportForWorkExit
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 24"
    />
    <!-- 转向节压装 - 扫码作业 -- 马瑞利：根据工步类型为 25 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanTask
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 25"
    />
    <!--支耳加强焊 - 扫码作业 -- 马瑞利：根据工步类型为 26 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanTask
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 26"
    />
    <!-- 人工检验 - 扫码作业 -- 马瑞利：根据工步类型为 27 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanTask
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 27"
    />
    <!-- 工序报工 - 和城：根据工步类型为 31 时，渲染工序报工组件，并传递相关参数 -->
    <ExitReport
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 31"
    />
    <!-- 扫码作业--- 成品、半成品老练检：根据工步类型为 32 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanTask
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 32"
    />
    <!-- 扫码作业--- 耐压：根据工步类型为 39 时，渲染扫码作业组件，并传递相关参数 -->
    <InsulationVoltage
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 39"
    />
    <!-- 扫码作业--- 氦气：根据工步类型为 33 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanTask
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 33"
    />
    <!-- 扫码作业--- 陶瓷：根据工步类型为 34 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanTask
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 34"
    />
    <!-- 扫码作业--- 半成品宗参，成品宗参 触点电洗，开距测试：根据工步类型为 35 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanTask
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 35"
    />
    <!-- 扫码作业--- 高度极性：根据工步类型为 37 时，渲染扫码作业组件，并传递相关参数 -->
    <ScanTask
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 37"
    />
    <!-- 工序进站：根据工步类型为 36 时，渲染工序进站组件，并传递相关参数 -->
    <ManufactureEntry
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 36"
    />
    <!-- 出战报工 - 和城：根据工步类型为 38 时，渲染工序报工组件，并传递相关参数 -->
    <ExitReport
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 38"
    />
    <!-- 单工位扫码 - 和城：根据工步类型为 40 时，渲染工序报工组件，并传递相关参数 -->
    <SingleStationScan
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 40"
    />
    <!-- 多工位扫码 - 和城：根据工步类型为 41 时，渲染工序报工组件，并传递相关参数 -->
    <MultiStationScan
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 41"
    />
    <!-- 多工位扫码 - 和城：根据工步类型为 41 时，渲染工序报工组件，并传递相关参数 -->
    <ParamTemplate
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      :show-type-number="step.type"
      v-if="step.type === 99"
    />

    <!-- 设备点位信息：根据工步类型为 999 时，渲染设备点位信息组件，并传递相关参数 -->
    <EquipmentLocationInformation
      :workstation-code="workstationCode"
      :equip-code="equipCode"
      :worksheet-code="worksheetCode"
      :binding-id="bindingId"
      :function-id="step.id"
      v-if="step.type === 999"
    />
  </div>
</template>

<style scoped>
/* 作用域样式，仅对当前组件生效 */
</style>
