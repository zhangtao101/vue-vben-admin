<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Spin } from 'ant-design-vue';

import { queryOfResourceVerificationStatus } from '#/api';

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
  return 'mr-4 inline-block w-48 p-2 text-right';
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
 * 查询资源验证状态
 * 功能：获取当前工位的资源校验状态数据
 * 流程：
 * 1. 开启加载状态指示
 * 2. 构造包含工位、设备等上下文参数的请求对象
 * 3. 调用资源验证状态查询接口
 * 4. 存储返回数据到响应式对象
 * 5. 始终关闭加载状态指示
 *
 * 接口参数说明：
 * queryOfResourceVerificationStatus - 资源验证状态查询接口
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
  queryOfResourceVerificationStatus({
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

onMounted(() => {
  queryData();
});
</script>

<template>
  <Spin :spinning="spinning">
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 设备可用 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.equipmentAvailable') }}：
        </span>
        <span :class="getValueClass()">
          {{ details.readyFlagName || $t('productionOperation.none') }}
        </span>
      </div>
    </div>
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 设备堵料" -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.equipmentPlugging') }}：
        </span>
        <span :class="getValueClass()">
          {{ details.nextFuncEnableName || $t('productionOperation.none') }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 堵料原因 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.cloggingCause') }}：
        </span>
        <span :class="getValueClass()">
          {{ details.nextFuncEnableReason || $t('productionOperation.none') }}
        </span>
      </div>
    </div>
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 设备状态 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.deviceStatus') }}：
        </span>
        <span :class="getValueClass()">
          {{ details.machineStatusName || $t('productionOperation.none') }}
        </span>
      </div>
    </div>
  </Spin>
</template>

<style scoped></style>
