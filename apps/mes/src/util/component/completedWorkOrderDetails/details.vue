<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Drawer, TabPane, Tabs } from 'ant-design-vue';

import DetailsTable from '#/util/component/completedWorkOrderDetails/detailsTable.vue';

/**
 * 是否显示抽屉
 */
const showDrawer = ref(false);
/**
 * 编辑的项
 */
const editItem = ref<any>({});
/**
 * 激活的标签页
 */
const activeKey = ref('1');
/**
 * 显示抽屉
 * @param row
 */
function show(row: any) {
  editItem.value = row;
  showDrawer.value = true;
}

const energyConsumptionDetails = ref();
const workReportDetails = ref();
const feedingDetails = ref();
const warehouseEntryDetails = ref();
const parameterDetails = ref();
const detailedSettingsOfTheParameterPressEquipment = ref();
function queryTable() {
  setTimeout(() => {
    switch (activeKey.value) {
      case '1': {
        energyConsumptionDetails.value.reload();
        break;
      }
      case '2': {
        workReportDetails.value.reload();
        break;
      }
      case '3': {
        feedingDetails.value.reload();
        break;
      }
      case '4': {
        warehouseEntryDetails.value.reload();
        break;
      }
      case '5': {
        parameterDetails.value.reload();
        break;
      }
      case '6': {
        detailedSettingsOfTheParameterPressEquipment.value.reload();
        break;
      }
    }
  }, 100);
}

/**
 * 关闭抽屉
 */
function close() {
  showDrawer.value = false;
  editItem.value = {};
}

// region 暴露方法，供父组件调用
defineExpose({
  show,
});
// endregion
</script>

<template>
  <Drawer
    v-model:open="showDrawer"
    :footer-style="{ textAlign: 'right' }"
    height="80%"
    placement="top"
    :title="$t('supplementaryFeedingOperation.supplementaryFeeding')"
    @close="close"
  >
    <Tabs
      v-model:active-key="activeKey"
      @change="queryTable"
      v-if="editItem.worksheetCode"
    >
      <!-- 能耗明细 -->
      <TabPane
        key="1"
        :tab="$t('completedWorkOrderDetails.energyConsumptionDetails')"
      >
        <DetailsTable
          ref="energyConsumptionDetails"
          :type="activeKey"
          :worksheet-code="editItem.worksheetCode"
          :workstation-code="editItem.workstationCode"
        />
      </TabPane>
      <!-- 报工明细 -->
      <TabPane key="2" :tab="$t('completedWorkOrderDetails.workReportDetails')">
        <DetailsTable
          ref="workReportDetails"
          :type="activeKey"
          :worksheet-code="editItem.worksheetCode"
          :workstation-code="editItem.workstationCode"
        />
      </TabPane>
      <!-- 投料明细 -->
      <TabPane key="3" :tab="$t('completedWorkOrderDetails.feedingDetails')">
        <DetailsTable
          ref="feedingDetails"
          :type="activeKey"
          :worksheet-code="editItem.worksheetCode"
          :workstation-code="editItem.workstationCode"
        />
      </TabPane>
      <!-- 入库明细 -->
      <TabPane
        key="4"
        :tab="$t('completedWorkOrderDetails.warehouseEntryDetails')"
        v-if="
          !editItem.workstationCode.includes('CX') &&
          !editItem.workstationCode.includes('SY')
        "
      >
        <DetailsTable
          ref="warehouseEntryDetails"
          :type="activeKey"
          :worksheet-code="editItem.worksheetCode"
          :workstation-code="editItem.workstationCode"
        />
      </TabPane>
      <!-- 参数明细 -->
      <TabPane key="5" :tab="$t('completedWorkOrderDetails.parameterDetails')">
        <DetailsTable
          ref="parameterDetails"
          :type="activeKey"
          :worksheet-code="editItem.worksheetCode"
          :workstation-code="editItem.workstationCode"
        />
      </TabPane>
      <!-- 参数压机设备设置明细 -->
      <TabPane
        key="6"
        :tab="
          $t(
            'completedWorkOrderDetails.detailedSettingsOfTheParameterPressEquipment',
          )
        "
        v-if="
          editItem.worksheetCode.includes('BC1') &&
          editItem.workstationCode.includes('CX')
        "
      >
        <DetailsTable
          ref="detailedSettingsOfTheParameterPressEquipment"
          :type="activeKey"
          :worksheet-code="editItem.worksheetCode"
          :workstation-code="editItem.workstationCode"
        />
      </TabPane>
    </Tabs>
  </Drawer>
</template>

<style scoped></style>
