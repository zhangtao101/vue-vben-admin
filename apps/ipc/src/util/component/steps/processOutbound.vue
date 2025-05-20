<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Empty, Spin } from 'ant-design-vue';

import { processExitInformationQuery } from '#/api';
import useWebSocket from '#/util/websocket-util';

const props = defineProps({
  // 工步id
  functionId: {
    type: Number,
    default: 0,
  },
  // 工序ID
  bindingId: {
    type: Number,
    default: 0,
  },
  // 工单编号
  worksheetCode: {
    type: String,
    default: '',
  },
  // 设备编号
  equipCode: {
    type: String,
    default: '',
  },
  // 工作中心
  workstationCode: {
    type: String,
    default: '',
  },
});

/**
 * 获取标签的class
 */
function getLabelClass() {
  return 'mr-4 inline-block w-48 border p-2 text-center';
}

/**
 * 获取值的class
 */
function getValueClass() {
  return 'inline-block w-48 border p-2 text-center';
}

/**
 * 详情
 */
const details = ref<any>(undefined);
/**
 * 加载中
 */
const spinning = ref<any>(false);

/**
 * 查询工序出站信息
 * 功能：获取当前工序的出站状态数据
 * 流程：
 * 1. 开启加载状态指示
 * 2. 构造包含工位、设备等上下文参数的请求对象
 * 3. 调用工序出站信息查询接口
 * 4. 存储返回数据到响应式对象
 * 5. 始终关闭加载状态指示
 *
 * 接口参数说明：
 * processExitInformationQuery - 工序出站信息查询接口
 * {
 *   workstationCode: 工作站编码,
 *   equipCode: 设备编码,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序绑定ID,
 *   functionId: 工步ID
 * }
 *
 * 注意事项：
 * - 使用spinning控制加载状态指示器
 * - 依赖props传入的工位/设备/工单等上下文参数
 * - 接口返回数据直接存储到details响应式对象
 * - 当前未处理接口异常情况，需补充错误处理逻辑
 * - 使用finally确保无论成功失败都会关闭加载状态
 */
function queryData() {
  spinning.value = true;
  processExitInformationQuery({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
  })
    .then((data) => {
      details.value = data;
    })
    .finally(() => {
      spinning.value = false;
    });
}

// region websocket

useWebSocket(readMessage, {
  workstationCode: props.workstationCode,
  equipCode: props.equipCode,
  worksheetCode: props.worksheetCode,
  bindingId: props.bindingId,
  functionId: props.functionId,
});

/**
 * WebSocket消息处理回调
 * 功能：解析并更新资源验证状态数据
 * 流程：
 * 1. 解析原始消息为JSON对象
 * 2. 验证数据有效性（非空检查）
 * 3. 更新响应式状态数据
 *
 * @param message - WebSocket推送的原始消息字符串
 *
 * 注意事项：
 * - 当前未处理JSON解析异常，需增加try-catch逻辑
 * - 会直接覆盖原有状态数据，需确保数据结构一致性
 * - 依赖父级作用域中的details响应式引用
 */
function readMessage(message: string) {
  // 反序列化WebSocket消息
  const data = JSON.parse(message);
  // 有效性检查后更新视图数据
  if (data) {
    details.value = data; // 直接替换整个状态对象
  }
}
// endregion

onMounted(() => {
  queryData();
});
</script>

<template>
  <Spin :spinning="spinning">
    <template v-if="details">
      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 前工步执行状况 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.implementationStatus') }}
          </span>
          <span :class="getValueClass()">
            {{ details.lastFlagName || $t('productionOperation.none') }}
          </span>
        </div>
      </div>

      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品名称 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productName') }}
          </span>
          <span :class="getValueClass()">
            {{ details.productName || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 当前工单 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.currentWorkOrder') }}
          </span>
          <span :class="getValueClass()">
            {{ details.currentJobId || $t('productionOperation.none') }}
          </span>
        </div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 产品编号 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.productNumber') }}
          </span>
          <span :class="getValueClass()">
            {{ details.productCode || $t('productionOperation.none') }}
          </span>
        </div>
      </div>
      <div>
        <div class="mb-4 mr-8 inline-block">
          <!-- 设备状态 -->
          <span :class="getLabelClass()">
            {{ $t('productionOperation.deviceStatus') }}
          </span>
          <span :class="getValueClass()">
            {{ details.machineStatusName || $t('productionOperation.none') }}
          </span>
        </div>
      </div>
    </template>
    <Empty v-else />
  </Spin>
</template>

<style scoped></style>
