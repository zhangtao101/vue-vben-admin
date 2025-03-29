<script setup lang="ts">
import { ref } from 'vue';

import { Button, Popover, RadioGroup, Steps } from 'ant-design-vue';

// region 操作步骤类型
// 作业类型列表
const jobType = [
  {
    label: '有序作业',
    value: '1',
  },
  {
    label: '离散作业',
    value: '2',
  },
];
// 当前选中的作业类型
const theSelectedJobType = ref('1');

// endregion

// region 有序操作步骤
// 步骤条数据
const items = [
  {
    title: '步骤1',
    description: '步骤1的描述',
  },
  {
    title: '步骤2',
    description: '步骤2的描述',
  },
  {
    title: '步骤3',
    description: '步骤3的描述',
  },
  {
    title: '步骤1',
    description: '步骤1的描述',
  },
  {
    title: '步骤2',
    description: '步骤2的描述',
  },
  {
    title: '步骤3',
    description: '步骤3的描述',
  },
  {
    title: '步骤4',
    description: '步骤4的描述',
    disabled: true,
  },
  {
    title: '步骤5',
    description: '步骤5的描述',
    disabled: true,
  },
];
// 当前步骤
const current = ref(1);

// endregion

// region 离散操作步骤
const discreteOperationStep = ref([
  {
    label: '路线A',
    value: 1,
  },
  {
    label: '路线b',
    value: 2,
  },
  {
    label: '路线c',
    value: 3,
  },
  {
    label: '路线d',
    value: 4,
  },
  {
    label: '路线A',
    value: 11,
  },
  {
    label: '路线b',
    value: 21,
  },
  {
    label: '路线c',
    value: 31,
  },
  {
    label: '路线d',
    value: 41,
  },
]);
const checkedDiscreteOperationStep = ref(1);

/**
 * 操作步骤切换
 * @param value
 */
function discreteOperationStepCChange(value: number) {
  checkedDiscreteOperationStep.value = value;
}
// endregion
</script>

<template>
  <RadioGroup
    v-model:value="theSelectedJobType"
    :options="jobType"
    class="mb-8"
  />
  <div class="overflow-y-auto">
    <Steps
      v-model:current="current"
      :items="items"
      v-if="theSelectedJobType === '1'"
    >
      <template #progressDot="{ prefixCls }">
        <Popover>
          <span :class="`${prefixCls}-icon-dot`"></span>
        </Popover>
      </template>
    </Steps>
    <div v-else class="whitespace-nowrap">
      <Button
        v-for="item of discreteOperationStep"
        :type="
          item.value !== checkedDiscreteOperationStep ? 'default' : 'primary'
        "
        size="large"
        class="mr-4 w-32"
        :key="item.value"
        @click="discreteOperationStepCChange(item.value)"
      >
        {{ item.label }}
      </Button>
    </div>
  </div>
</template>

<style scoped></style>
