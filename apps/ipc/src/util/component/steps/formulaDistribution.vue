<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button, Input, message, Spin } from 'ant-design-vue';

import {
  queryOfFormulaDistributionInformation,
  theFormulaHasBeenIssued,
} from '#/api';

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
const details = ref<any>({});
/**
 * 加载中
 */
const spinning = ref<any>(false);

/**
 * 查询配方分配信息
 * 功能：获取配方分配相关数据并更新视图状态
 * 流程：
 * 1. 设置加载状态为true（显示加载动画）
 * 2. 调用配方分配信息查询接口
 * 3. 接口返回后更新详情数据
 * 4. 无论成功失败都关闭加载状态
 *
 * 接口说明：
 * queryOfFormulaDistributionInformation - 配方分配信息查询接口
 * 参数结构：
 * {
 *   workstationCode: 工作中心编号,
 *   equipCode: 设备编号,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序ID,
 *   functionId: 工步ID
 * }
 *
 * 注意事项：
 * - 依赖props传递设备/工单相关标识参数
 * - 使用finally保证加载状态始终会被重置
 * - 直接更新响应式对象details实现视图自动更新
 * - 未处理接口异常情况，需根据业务需求补充错误处理
 */
function queryData() {
  spinning.value = true;
  queryOfFormulaDistributionInformation({
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

/**
 * 处理配方下发操作
 * 功能：提交配方信息至后端服务完成下发流程
 * 流程：
 * 1. 构建请求参数（包含设备/工单标识及目标配方号）
 * 2. 调用配方下发接口提交数据
 * 3. 成功后刷新当前配方分配信息
 *
 * 接口说明：
 * theFormulaHasBeenIssued - 配方下发接口
 * 参数结构：
 * {
 *   workstationCode: 工作中心编号,
 *   equipCode: 设备编号,
 *   worksheetCode: 工单编号,
 *   bindingId: 工序ID,
 *   functionId: 工步ID,
 *   nextTemplateCode: 目标配方号
 * }
 *
 * 注意事项：
 * - 依赖details中nextTemplateCode作为下发目标配方
 * - 成功后会重新获取最新配方分配状态
 * - 使用国际化机制处理成功提示信息
 * - 未处理接口异常情况，需补充错误处理逻辑
 * - 与queryData函数配合实现数据刷新机制
 */
function submit() {
  theFormulaHasBeenIssued({
    workstationCode: props.workstationCode,
    equipCode: props.equipCode,
    worksheetCode: props.worksheetCode,
    bindingId: props.bindingId,
    functionId: props.functionId,
    nextTemplateCode: details.value.nextTemplateCode,
  }).then(() => {
    message.success($t('common.successfulOperation'));
    queryData();
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
        <!-- 前工步执行状况 -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.implementationStatus') }}
        </span>
        <span :class="getValueClass()">
          {{ details.lastFlagName || $t('productionOperation.none') }}
        </span>
      </div>
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
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 原配方号" -->
        <label :class="getLabelClass()" for="originalRecipeNumber">
          {{ $t('productionOperation.originalRecipeNumber') }}
        </label>
        <Input
          v-model:value="details.templateCode"
          class="w-56 leading-[30px]"
          id="originalRecipeNumber"
        />
      </div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 目标配方号" -->
        <label :class="getLabelClass()" for="targetRecipeNumber">
          {{ $t('productionOperation.targetRecipeNumber') }}
        </label>
        <Input
          v-model:value="details.nextTemplateCode"
          class="w-56 leading-[30px]"
          id="targetRecipeNumber"
        />
      </div>
    </div>
    <div>
      <div class="mb-4 mr-8 inline-block">
        <!-- 配方下发状态" -->
        <span :class="getLabelClass()">
          {{ $t('productionOperation.formulaDeliveryCondition') }}
        </span>
        <span :class="getValueClass()">
          {{ details.tempSendFlagName }}
        </span>
      </div>
      <div class="mb-4 mr-8 inline-block">
        <Button type="primary" @click="submit()">
          {{ $t('productionOperation.manualDelivery') }}
        </Button>
      </div>
    </div>
  </Spin>
</template>

<style scoped></style>
