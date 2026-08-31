<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

// eslint-disable-next-line n/no-extraneous-import
import { Icon } from '@iconify/vue';
import { RadioButton, RadioGroup } from 'ant-design-vue';
// eslint-disable-next-line n/no-extraneous-import
import { Enum } from 'enum-plus';

import { useSectionStore } from '#/store';
import StepExecution from '#/util/component/stepExecution.vue';
import VerticalStepBar from '#/util/component/verticalStepBar.vue';

// 工段信息（左上角展示，来自工段设置）
const sectionStore = useSectionStore();

// region 图标
const iconEnum: any = Enum({
  SOP查看: {
    label: 'SOP查看',
    value: 'mdi:eye-outline',
  },
  安灯: {
    label: '安灯',
    value: 'mdi:alarm-light',
  },
  质量检验: {
    label: '质量检验',
    value: 'mdi:quality-medium',
  },
  工序过程操作: {
    label: '工序过程操作',
    value: 'fluent-mdl2:processing-run',
  },
  资源指派: {
    label: '资源指派',
    value: 'mdi:resize',
  },
  设备参数: {
    label: '设备参数',
    value: 'mdi:checkerboard',
  },
});
// endregion

// region 假数据 - 操作事项（顶部中间）
const listOfOperationItems = ref<any[]>([
  { id: 1, opTypeName: '工序过程操作' },
  { id: 2, opTypeName: '质量检验' },
  { id: 3, opTypeName: 'SOP查看' },
  { id: 4, opTypeName: '设备参数' },
  { id: 5, opTypeName: '资源指派' },
]);
// 当前选中的操作事项
const theSelectedOperation = ref<number>(1);
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

// region 假数据 - 工单信息（供步骤执行使用）
const fakeWorkOrder = ref({
  worksheetCode: 'WO-2026-0001',
  productCode: 'P-1001',
  productName: '示例产品A',
});
// 当前选中的工序绑定 ID
const checkedProcessId = ref(1001);
// endregion

onMounted(() => {
  currentWorkingStep.value = stepList.value[currentStepIndex.value];
});
</script>

<template>
  <Page auto-content-height>
    <div class="flex h-full flex-col">
      <!-- region 顶部：左上角工段名称 + 中间操作事项 -->
      <div class="mb-4 flex items-center">
        <!-- 左上角工段名称 -->
        <div
          class="w-56 flex-shrink-0 border-l-4 border-sky-500 pl-4 text-2xl font-black"
        >
          {{ sectionStore.sectionName || '未设置工段' }}
        </div>

        <!-- 中间操作事项选择器 -->
        <div class="flex flex-1 justify-center">
          <RadioGroup v-model:value="theSelectedOperation" button-style="solid">
            <RadioButton
              :value="item.id"
              v-for="item of listOfOperationItems"
              :key="item.id"
            >
              <Icon
                :icon="iconEnum[item.opTypeName]"
                class="inline-block text-xl"
              />
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
            :workstation-code="sectionStore.sectionCode"
            :worksheet-code="fakeWorkOrder.worksheetCode"
            :product-code="fakeWorkOrder.productCode"
            :product-name="fakeWorkOrder.productName"
            :binding-id="checkedProcessId"
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
