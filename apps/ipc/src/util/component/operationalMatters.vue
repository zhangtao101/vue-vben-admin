<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Spin } from 'ant-design-vue';

import { getOpFunctions } from '#/api';
import useWebSocket from '#/util/websocket-util';

/**
 * 定义组件的 props，用于接收父组件传递的数据
 */
const props = defineProps({
  // 详情Id，用于标识具体的工序详情，默认为 -1
  detailsId: {
    type: Number,
    default: -1,
  },
  // 作业类型，1 表示有序作业，2 表示离散作业，默认为 1
  type: {
    type: Number,
    default: 1,
  },
  // 工单号，用于标识具体的工单，默认为空字符串
  worksheetCode: {
    type: String,
    default: '',
  },
});

/**
 * 定义事件发射器，用于触发 'currentChange' 事件通知父组件当前步骤的变化
 */
const emit = defineEmits(['currentChange']);

// region 有序操作步骤
/**
 * 步骤条数据，存储操作步骤的相关信息，用于步骤条组件的渲染
 */
const stepBar = ref<any>([]);
/**
 * 当前步骤的索引，用于标识当前激活的步骤
 */
const current = ref(-1);
/**
 * 加载状态，控制加载动画的显示与隐藏
 */
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
  // 开始加载，显示加载状态
  loading.value = true;
  // 调用接口获取操作功能数据
  getOpFunctions({
    // 传入详情ID
    opDetailId: props.detailsId,
    // 传入工单号
    worksheetCode: props.worksheetCode,
  })
    .then((data) => {
      // 清空步骤条数据
      stepBar.value = [];
      // 初始化步骤索引
      let i = -1;
      // 遍历接口返回数据，构建步骤条结构
      data.forEach((step: any, index: number) => {
        stepBar.value.push({
          // 步骤名称
          title: step.functionTypeName,
          // 功能类型
          functionType: step.functionType,
          // 执行状态
          status: step.workingState,
          // 步骤唯一标识
          id: step.id,
          // 错误标识
          errorFlag: step.errorFlag,
        });
        // 设置当前激活步骤索引
        if (step.workingState === 1) {
          i = index;
          // 当步骤有进行中的工单时设为当前步骤
          current.value = index;
        }
      });
      if (i === -1) {
        current.value = 0;
      }
    })
    .finally(() => {
      // 结束加载，隐藏加载状态
      loading.value = false;
    });
}

// region websocket
/**
 * 初始化 WebSocket 连接，并传入消息处理函数和配置参数
 */
useWebSocket(readMessage, {
  worksheetCode: props.worksheetCode,
  webSocketType: 4,
});

/**
 * 处理 WebSocket 接收到的消息
 * 当接收到消息时，调用 queryData 函数重新查询资源验证状态
 */
function readMessage() {
  querySteps();
}
// endregion

/**
 * 监听详情Id的变化，当详情Id变化时，重置当前步骤并重新查询步骤数据
 */
watch(
  () => props.detailsId,
  () => {
    current.value = -1;
    querySteps();
  },
);

/**
 * 监听当前步骤的变化，当当前步骤变化时，触发 'currentChange' 事件通知父组件
 */
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

/**
 * 组件挂载时，调用 querySteps 函数查询步骤数据
 */
onMounted(() => {
  querySteps();
});
</script>

<template>
  <!-- 注释：原注释掉的单选框组，用于选择作业类型 -->
  <!-- <RadioGroup
    v-model:value="theSelectedJobType"
    :options="jobType"
    class="mb-8"
  /> -->
  <!-- 根据 loading 状态显示加载动画 -->
  <Spin :spinning="loading">
    <!-- 可滚动的容器，用于显示步骤条 -->
    <div class="overflow-y-auto pb-4 pt-4">
      <!-- 当作业类型为有序作业时，显示水平排列的步骤条 -->
      <div v-if="props.type === 1" class="w-full whitespace-nowrap">
        <!-- 遍历步骤条数据，渲染每个步骤 -->
        <template v-for="(item, index) of stepBar" :key="index">
          <!-- 在第一个步骤之后显示箭头图标 -->
          <IconifyIcon
            icon="mdi:arrow-right"
            class="align--center ml-4 mr-4 inline-block text-4xl"
            v-if="index > 0"
          />
          <!-- 步骤块，点击可切换当前步骤 -->
          <div
            class="inline-block w-auto cursor-pointer rounded-xl border p-2 pl-4 pr-4 text-center hover:bg-pink-300 hover:text-black"
            :class="{
              // 原注释：当步骤状态为进行中时，背景颜色为蓝色，文字为白色
              // 'bg-sky-500 text-white': item.status === 1,
              // 当步骤状态为完成或进行中时，背景颜色为绿色，文字为白色
              'bg-green-500 text-white': item.status === 2 || item.status === 1,
              // 当步骤状态为未开始时，背景颜色为灰色
              'bg-gray-200': item.status === -1,
              // 当步骤状态为异常且不是当前步骤时，背景颜色为橙色，文字为白色
              'bg-amber-500 text-white': item.workingState === 3,
              // 当步骤有错误标识且不是当前步骤时，显示异常动画边框
              'anomaly border-4': item.errorFlag === 1 && current !== index,
              // 当步骤为当前步骤时，显示蓝色边框和阴影
              'border-4 border-sky-300 shadow-xl': current === index,
            }"
            @click="current = index"
          >
            <!-- 显示步骤名称 -->
            <div class="font-black">{{ item.title }}</div>
          </div>
        </template>
      </div>
      <!-- 当作业类型为离散作业时，显示垂直排列的步骤条 -->
      <div v-else class="w-full whitespace-nowrap">
        <!-- 遍历步骤条数据，渲染每个步骤 -->
        <template v-for="(item, index) of stepBar" :key="index">
          <!-- 步骤块，点击可切换当前步骤 -->
          <div
            class="m-4 inline-block w-36 cursor-pointer rounded-xl border p-2 text-center hover:bg-pink-300 hover:text-black"
            :class="{
              // 原注释：当步骤状态为进行中时，背景颜色为蓝色，文字为白色
              // 'bg-sky-500 text-white': item.status === 1,
              // 当步骤状态为完成或进行中时，背景颜色为绿色，文字为白色
              'bg-green-500 text-white': item.status === 2 || item.status === 1,
              // 当步骤状态为未开始时，背景颜色为灰色
              'bg-gray-200': item.status === -1,
              // 当步骤有错误标识且不是当前步骤时，显示异常动画边框
              'anomaly border-4': item.errorFlag === 1 && current !== index,
              // 当步骤为当前步骤时，显示蓝色边框和阴影
              'border-4 border-sky-300 shadow-xl': current === index,
            }"
            @click="current = index"
          >
            <!-- 显示步骤名称 -->
            <div class="font-black">{{ item.title }}</div>
          </div>
        </template>
      </div>
    </div>
  </Spin>
</template>

<style lang="scss" scoped>
@keyframes alarm {
  // 动画开始和结束时，边框颜色为透明
  0%,
  100% {
    border-color: transparent;
  }

  // 动画进行到 50% 时，边框颜色为红色
  50% {
    border-color: red;
  }
}

.anomaly {
  // 应用 alarm 动画，持续时间为 1 秒，无限循环
  animation: alarm 1s infinite;
}

/**
 * 异常状态的动画样式
 * 定义一个名为 alarm 的动画，让边框颜色在透明和红色之间切换
 */
</style>
