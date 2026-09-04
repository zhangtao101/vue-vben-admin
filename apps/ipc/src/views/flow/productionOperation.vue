<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { RadioButton, RadioGroup, Select } from 'ant-design-vue';

import {
  getOpFunctionsByOpdetail,
  getSstationProces,
  workstationListAcquisition,
} from '#/api';
import StepExecution from '#/util/component/stepExecution.vue';
import VerticalStepBar from '#/util/component/verticalStepBar.vue';

// region 工作站与工序选择（左上角）
const workstationList = ref<any[]>([]);
// 当前选中的工作站编号
const selectedWorkstation = ref<string>();
// 工序列表（下拉数据源）
const processList = ref<any[]>([]);
// 当前选中的工序编号
const selectedProcessCode = ref<string>();

/**
 * 查询工作站列表，默认选中第一个工作站并加载其工序
 */
function queryListOfWorkstations() {
  workstationListAcquisition().then((data: any[]) => {
    workstationList.value = data || [];
    // 默认选中第一个工作站并触发工序查询
    if (workstationList.value.length > 0) {
      selectedWorkstation.value = workstationList.value[0].workstationCode;
      queryListOfOperationItems();
    }
  });
}

/**
 * 根据选中的工作站查询工序列表
 */
function queryListOfOperationItems() {
  // 获取该工作站下的工序及其作业标签列表
  getSstationProces({ workstationCode: selectedWorkstation.value }).then(
    (stationProcesses: any[]) => {
      processList.value = stationProcesses || [];
      // 默认选中第一个工序
      selectedProcessCode.value =
        processList.value.length > 0
          ? processList.value[0].processCode
          : undefined;
      processChange(selectedProcessCode.value);
    },
  );
}
// endregion

// region 操作事项（顶部中间，来自所选工序的作业标签）
const listOfOperationItems = ref<any[]>([]);
// 当前选中的操作事项
const theSelectedOperation = ref<number>();

/**
 * 工序切换：用所选工序的作业标签填充操作事项
 * @param processCode 工序编号
 */
function processChange(processCode?: any) {
  const currentProcess = processList.value.find(
    (process: any) => process.processCode === processCode,
  );
  // 操作事项取当前工序绑定的作业标签（details）
  listOfOperationItems.value = currentProcess?.details || [];
  // 默认选中第一个操作事项
  theSelectedOperation.value =
    listOfOperationItems.value.length > 0
      ? listOfOperationItems.value[0].id
      : undefined;
  operationItemChange();
}

/**
 * 操作事项切换：根据标签页ID查询对应的工步列表
 */
function operationItemChange() {
  getOpFunctionsByOpdetail({ opDetailId: theSelectedOperation.value }).then(
    (data: any[]) => {
      // 接口数据转工步列表格式：id 对应 id，functionType 对应 type，
      // functionTypeName 对应 title，status 默认 1
      stepList.value = (data || []).map((item: any) => ({
        id: item.id,
        title: item.functionTypeName,
        type: item.functionType,
        status: 1,
      }));
      // 默认选中第一个工步
      currentStepIndex.value = 0;
      currentWorkingStep.value = stepList.value[0]
        ? { ...stepList.value[0] }
        : undefined;
    },
  );
}
// endregion

// region 假数据 - 工步（左侧竖排）
const stepList = ref<any[]>([
  { id: 101, title: '混合水LOT生成', type: 102, status: 2 },
  { id: 102, title: '混合水材料称重', type: 103, status: 1 },
  { id: 103, title: '混合水托盘投入', type: 104, status: -1 },
  { id: 104, title: '混合水作业进度', type: 105, status: 1 },
  { id: 106, title: '混合水/Mix工作指示失败传输', type: 106, status: 1 },
  { id: 107, title: '混合LOT生成', type: 107, status: 1 },
  { id: 108, title: '各筒仓材料设置', type: 108, status: 1 },
  { id: 119, title: '混合水/Mix工作指示传输V2', type: 119, status: 1 },
  { id: 109, title: '制面作业', type: 109, status: 1 },
  { id: 110, title: '落面信息', type: 110, status: 1 },
  { id: 111, title: '面机使用明细登记', type: 111, status: 1 },
  { id: 112, title: '包装工作进度', type: 112, status: 1 },
  { id: 113, title: '成品不良登记', type: 113, status: 1 },
  { id: 114, title: '生产业绩', type: 114, status: 1 },
  { id: 115, title: '包装作业进行', type: 115, status: 1 },
  { id: 116, title: '台车标签发行', type: 116, status: 1 },
  { id: 117, title: '台车装载/卸货', type: 117, status: 1 },
  { id: 118, title: '台车LOT变更', type: 118, status: 1 },
  { id: 120, title: '搅拌机批次LOT管理', type: 120, status: 1 },
  { id: 121, title: '搅拌材料称重管理', type: 121, status: 1 },
  { id: 122, title: '无重力搅拌托盘投入', type: 122, status: 1 },
  { id: 123, title: '搅拌作业进行', type: 123, status: 1 },
]);
// 当前选中的工步索引
const currentStepIndex = ref(0);
// 当前选中的工步
const currentWorkingStep = ref<any>(stepList.value[0]);
// 左侧工步栏是否收起
const collapsed = ref(false);

/**
 * 工步切换
 * @param item 选中的工步数据
 */
function stepChange(item: any) {
  currentWorkingStep.value = { ...item };
}
// endregion

onMounted(() => {
  currentWorkingStep.value = stepList.value[currentStepIndex.value];
  queryListOfWorkstations();
});
</script>

<template>
  <Page auto-content-height>
    <div class="flex h-full flex-col">
      <!-- region 顶部：左上角工段名称 + 中间操作事项 -->
      <div class="mb-4 flex items-center">
        <!-- 左上角：工作站与工序选择 -->
        <div class="flex flex-shrink-0 items-center gap-2">
          <Select
            v-model:value="selectedWorkstation"
            :options="workstationList"
            :field-names="{
              label: 'workstationName',
              value: 'workstationCode',
            }"
            placeholder="请选择工作站"
            class="!w-44"
            @change="queryListOfOperationItems"
          />
          <Select
            v-model:value="selectedProcessCode"
            :options="processList"
            :field-names="{ label: 'processName', value: 'processCode' }"
            placeholder="请选择工序"
            class="!w-44"
            @change="processChange"
          />
        </div>

        <!-- 中间操作事项选择器 -->
        <div class="flex min-w-0 flex-1 justify-center overflow-x-auto">
          <RadioGroup
            v-model:value="theSelectedOperation"
            button-style="solid"
            @change="operationItemChange"
          >
            <RadioButton
              :value="item.id"
              v-for="item of listOfOperationItems"
              :key="item.id"
            >
              <!-- <Icon
                :icon="iconEnum[item.opTypeName]"
                class="inline-block text-xl"
               -->
              {{ item.opTypeName }}
            </RadioButton>
          </RadioGroup>
        </div>
      </div>
      <!-- endregion -->

      <!-- region 主体：左侧竖排工步 + 中间步骤执行 -->
      <div class="flex flex-1 gap-4 overflow-hidden">
        <!-- 左侧竖排工步（可向左收起） -->
        <div
          class="relative flex flex-shrink-0 flex-col rounded-lg border border-border bg-card shadow-sm transition-all duration-300"
          :class="collapsed ? 'w-1' : 'w-32'"
        >
          <!-- 收起/展开按钮：右侧边缘垂直居中的圆形按钮 -->
          <button
            class="absolute right-0 top-1/2 z-10 flex size-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:bg-accent hover:text-foreground"
            @click="collapsed = !collapsed"
          >
            <Icon
              :icon="collapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'"
              class="text-2xl"
            />
          </button>
          <!-- 工步列表（收起时隐藏） -->
          <div
            v-show="!collapsed"
            class="h-full flex-1 overflow-x-hidden overflow-y-auto pl-0 pr-2"
          >
            <VerticalStepBar
              v-model="currentStepIndex"
              :steps="stepList"
              @change="stepChange"
            />
          </div>
        </div>

        <!-- 中间步骤执行（一大部分） -->
        <div class="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <StepExecution
            class="min-h-0 flex-1"
            :workstation-code="selectedWorkstation"
            :process-code="selectedProcessCode"
            :step="currentWorkingStep"
            v-if="currentWorkingStep"
          />
        </div>
      </div>
      <!-- endregion -->
    </div>
  </Page>
</template>

<style scoped lang="scss">
.anomaly {
  animation: alarm 1s infinite;
}

@keyframes alarm {
  0%,
  100% {
    border-color: transparent;
  }

  50% {
    border-color: red;
  }
}
</style>
