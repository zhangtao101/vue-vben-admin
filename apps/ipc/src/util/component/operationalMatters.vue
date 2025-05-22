<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Spin } from 'ant-design-vue';

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
 * 查询操作步骤数据
 * 功能：获取并构建工序步骤数据结构
 * 流程：
 * 1. 调用接口获取操作功能数据
 * 2. 格式化步骤数据为步骤条组件所需结构
 * 3. 自动定位当前进行中的步骤
 * 4. 更新全局加载状态
 *
 * 接口说明：
 * getOpFunctions - 操作功能查询接口，接收参数：
 *   - opDetailId: 工序详情ID（来自父组件props.detailsId）
 *   - worksheetCode: 当前工单编号（来自父组件props.worksheetCode）
 *
 * 数据结构处理：
 * - title: 步骤显示名称（取自functionTypeName）
 * - functionType: 功能类型标识（用于后续操作类型判断）
 * - description: 动态提示信息（根据currentWorksheet存在性生成）
 * - id: 步骤唯一标识（用于步骤跟踪）
 *
 * 状态控制：
 * - loading: 控制加载动画显示
 * - current: 记录当前激活步骤索引
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
      let i = -1; // 初始化步骤索引
      // 遍历接口返回数据，构建步骤条结构
      data.forEach((step: any, index: number) => {
        stepBar.value.push({
          title: step.functionTypeName, // 步骤名称
          functionType: step.functionType, // 功能类型
          status: step.workingState, // 执行状态
          id: step.id, // 步骤唯一标识
          errorFlag: step.errorFlag, // 错误标识
        });
        // 设置当前激活步骤索引
        if (step.workingState === 1) {
          i = index;
          current.value = index; // 当步骤有进行中的工单时设为当前步骤
        }
      });
      if (i === -1) {
        current.value = 0;
      }
    })
    .finally(() => {
      loading.value = false; // 结束加载，隐藏加载状态
    });
}

watch(
  () => props.detailsId,
  () => {
    current.value = -1;
    querySteps();
  },
);
watch(current, () => {
  let params: any = {};
  if (
    stepBar.value &&
    stepBar.value.length > 0 &&
    stepBar.value[current.value]
  ) {
    params = {
      id: stepBar.value[current.value].id,
      type: stepBar.value[current.value].functionType,
    };
  }
  emit('currentChange', params);
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
    <div class="overflow-y-auto pb-4 pt-4">
      <div v-if="props.type === 1" class="w-full whitespace-nowrap">
        <template v-for="(item, index) of stepBar" :key="index">
          <IconifyIcon
            icon="mdi:arrow-right"
            class="align--center ml-4 mr-4 inline-block text-4xl"
            v-if="index > 0"
          />
          <div
            class="inline-block w-auto cursor-pointer rounded-xl border p-2 pl-4 pr-4 text-center hover:bg-pink-300 hover:text-black"
            :class="{
              // 'bg-sky-500 text-white': item.status === 1,
              'bg-green-500 text-white': item.status === 2 || item.status === 1,
              'bg-gray-200': item.status === -1,
              'bg-amber-500 text-white': item.workingState === 3,
              'anomaly border-4': item.errorFlag === 1 && current !== index,
              'border-4 border-sky-300 shadow-xl': current === index,
            }"
            @click="current = index"
          >
            <div class="font-black">{{ item.title }}</div>
          </div>
        </template>
      </div>
      <div v-else class="w-full whitespace-nowrap">
        <template v-for="(item, index) of stepBar" :key="index">
          <div
            class="m-4 inline-block w-36 cursor-pointer rounded-xl border p-2 text-center hover:bg-pink-300 hover:text-black"
            :class="{
              // 'bg-sky-500 text-white': item.status === 1,
              'bg-green-500 text-white': item.status === 2 || item.status === 1,
              'bg-gray-200': item.status === -1,
              'anomaly border-4': item.errorFlag === 1 && current !== index,
              'border-4 border-sky-300 shadow-xl': current === index,
            }"
            @click="current = index"
          >
            <div class="font-black">{{ item.title }}</div>
          </div>
        </template>
      </div>
    </div>
  </Spin>
</template>

<style lang="scss" scoped>
.anomaly {
  @keyframes alarm {
    0%,
    100% {
      border-color: transparent;
    }

    50% {
      border-color: red;
    }
  }

  animation: alarm 1s infinite;
}
</style>
