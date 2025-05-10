<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Button, Popover, Spin, Steps } from 'ant-design-vue';

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
// 加载状态
const loading = ref(false);

// endregion

/**
 * 查询步骤列表
 * 1. 调用接口获取操作功能数据
 * 2. 处理接口返回数据，构建步骤条结构
 * 3. 设置当前激活的步骤索引
 * 4. 更新加载状态
 */
function querySteps() {
  loading.value = true; // 开始加载，显示加载状态
  getOpFunctions({
    // 调用接口获取操作功能数据
    opDetailId: props.detailsId, // 传入详情ID
    worksheetCode: props.worksheetCode, // 传入工单号
  })
    .then((data) => {
      stepBar.value = []; // 清空步骤条数据
      // 遍历接口返回数据，构建步骤条结构
      data.forEach((step: any, index: number) => {
        stepBar.value.push({
          title: step.functionTypeName, // 步骤名称
          functionType: step.functionType, // 功能类型
          description: step.currentWorksheet // 步骤描述
            ? `当前正在进行工单: ${step.currentWorksheet} 加工` // 有工单时的提示
            : '当前无工单进行中', // 无工单时的提示
          id: step.id, // 步骤唯一标识
        });
        // 设置当前激活步骤索引
        if (step.currentWorksheet) {
          current.value = index; // 当步骤有进行中的工单时设为当前步骤
        }
      });
    })
    .finally(() => {
      loading.value = false; // 结束加载，隐藏加载状态
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
  <Spin :spinning="loading">
    <div class="h-24 overflow-y-auto">
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
  </Spin>
</template>

<style scoped></style>
