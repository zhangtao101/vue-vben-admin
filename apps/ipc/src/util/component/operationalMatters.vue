<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Button, Popover, Steps } from 'ant-design-vue';

import { getOpFunctions } from '#/api';

const props = defineProps({
  // 详情Id
  detailsId: {
    type: Number,
    default: -1,
  },
  // 作业类型 1:有序作业 2:离散作业
  type: {
    type: Number,
    default: 1,
  },
  // 工单号
  worksheetCode: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['currentChange']);

// region 有序操作步骤
// 步骤条数据
const stepBar = ref<any>([]);
// 当前步骤
const current = ref(-1);

// endregion

/**
 * 查询步骤列表
 */
function querySteps() {
  getOpFunctions({
    opDetailId: props.detailsId,
    worksheetCode: props.worksheetCode,
  }).then((data) => {
    stepBar.value = [];
    data.forEach((step: any) => {
      stepBar.value.push({
        title: step.functionTypeName,
        functionType: step.functionType,
        description: step.currentWorksheet
          ? `当前正在进行工单: ${step.currentWorksheet} 加工`
          : '当前无工单进行中',
        id: step.id,
      });
    });
    current.value = 2;
  });
}

watch(
  () => props.detailsId,
  () => {
    querySteps();
  },
);
watch(current, () => {
  emit('currentChange', {
    id: stepBar.value[current.value].id,
    type: stepBar.value[current.value].functionType,
  });
});

onMounted(() => {
  querySteps();
});
</script>

<template>
  <!-- <RadioGroup
    v-model:value="theSelectedJobType"
    :options="jobType"
    class="mb-8"
  /> -->
  <div class="overflow-y-auto">
    <Steps v-model:current="current" :items="stepBar" v-if="props.type === 1">
      <template #progressDot="{ prefixCls }">
        <Popover>
          <span :class="`${prefixCls}-icon-dot`"></span>
        </Popover>
      </template>
    </Steps>
    <div v-else>
      <Button
        v-for="(item, index) of stepBar"
        :type="index !== current ? 'default' : 'primary'"
        size="large"
        class="mb-4 mr-4 w-32"
        :key="item.id"
        @click="() => (current = index)"
      >
        {{ item.title }}
      </Button>
    </div>
  </div>
</template>

<style scoped></style>
