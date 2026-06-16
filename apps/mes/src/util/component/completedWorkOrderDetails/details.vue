/**
 * [INPUT]: 依赖 ant-design-vue、@vben/locales、detailsTable 子组件
 * [OUTPUT]: 对外提供完工工单详情抽屉组件，调用方通过 ref.show(row) 打开
 * [POS]: 生产执行模块 的完工工单详情展示，展示能耗/报工/投料/入库/参数/压机设置六个 Tab
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * [TIME]: 2026-06-16 10:26:00
 */
<script setup lang="ts">
import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Drawer, TabPane, Tabs } from 'ant-design-vue';

import DetailsTable from '#/util/component/completedWorkOrderDetails/detailsTable.vue';

/** 抽屉显示状态 */
const showDrawer = ref(false);
/** 当前查看的完工工单行数据 */
const editItem = ref<any>({});
/** 当前激活的标签页 key（1-6 对应能耗/报工/投料/入库/参数/压机设置） */
const activeKey = ref('1');

/**
 * 显示完工工单详情抽屉，设置行数据并打开抽屉。
 * @param {any} row - 工单行数据，需包含 worksheetCode 和 workstationCode。
 * @returns {void} 无返回值。
 * @since 2026-06-16 10:26:00
 */
function show(row: any) {
  editItem.value = row;
  showDrawer.value = true;
}

// ========== 明细表格 ref 集合 ==========
/** 能耗明细表格组件实例 */
const energyConsumptionDetails = ref();
/** 报工明细表格组件实例 */
const workReportDetails = ref();
/** 投料明细表格组件实例 */
const feedingDetails = ref();
/** 入库明细表格组件实例 */
const warehouseEntryDetails = ref();
/** 参数明细表格组件实例 */
const parameterDetails = ref();
/** 参数压机设备设置明细表格组件实例 */
const detailedSettingsOfTheParameterPressEquipment = ref();

/**
 * 根据当前激活标签页触发对应明细表格重新加载数据。
 * @returns {void} 无返回值，通过 setTimeout 延迟 100ms 确保 Tab 切换完成。
 * @since 2026-06-16 10:26:00
 */
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
 * 关闭抽屉并清空行数据。
 * @returns {void} 无返回值。
 * @since 2026-06-16 10:26:00
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
